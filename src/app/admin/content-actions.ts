"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { AdminAuthorizationError, requireAdminAction } from "@/lib/auth/admin";
import {
  legalDocumentInputSchema,
  LEGAL_DOCUMENT_TYPES,
  mediaMetadataInputSchema,
  portfolioProjectInputSchema,
} from "@/lib/content/schema";
import { LEGAL_DOCUMENT_LABELS, LEGAL_DOCUMENT_TEMPLATES } from "@/lib/content/legal-templates";
import type { ContentActionState } from "@/lib/content/types";

const uuidSchema = z.string().uuid();
const imageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const imageExtension: Record<(typeof imageMimeTypes)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function validateImageFile(file: File) {
  if (!imageMimeTypes.includes(file.type as (typeof imageMimeTypes)[number])) {
    throw new z.ZodError([{ code: "custom", path: ["file"], message: "JPG, PNG, WebP 이미지만 업로드할 수 있습니다.", input: file }]);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new z.ZodError([{ code: "custom", path: ["file"], message: "이미지는 10MB 이하만 업로드할 수 있습니다.", input: file }]);
  }
}

function contentActionError(error: unknown): ContentActionState {
  if (error instanceof AdminAuthorizationError) {
    return { status: "error", message: error.message };
  }

  if (error instanceof z.ZodError) {
    return {
      status: "error",
      message: error.issues[0]?.message ?? "입력 내용을 확인해 주세요.",
    };
  }

  return {
    status: "error",
    message: "요청을 처리하지 못했습니다. 입력 내용과 관리자 설정을 확인해 주세요.",
  };
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function scopes(formData: FormData) {
  return text(formData, "scopes")
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function projectPayload(formData: FormData) {
  return portfolioProjectInputSchema.parse({
    slug: text(formData, "slug"),
    title: text(formData, "title"),
    clientName: text(formData, "clientName"),
    summary: text(formData, "summary"),
    projectType: text(formData, "projectType"),
    scopes: scopes(formData),
    statusLabel: text(formData, "statusLabel"),
    visualTone: text(formData, "visualTone"),
    challenge: text(formData, "challenge"),
    roleDescription: text(formData, "roleDescription"),
    approach: text(formData, "approach"),
    outcome: text(formData, "outcome"),
    sortOrder: Number(text(formData, "sortOrder")),
    isPublished: checkbox(formData, "isPublished"),
    detailPublished: checkbox(formData, "detailPublished"),
  });
}

function projectRow(input: ReturnType<typeof projectPayload>) {
  return {
    slug: input.slug,
    title: input.title,
    client_name: input.clientName,
    summary: input.summary,
    project_type: input.projectType,
    scopes: input.scopes,
    status_label: input.statusLabel,
    visual_tone: input.visualTone,
    challenge: input.challenge,
    role_description: input.roleDescription,
    approach: input.approach,
    outcome: input.outcome,
    sort_order: input.sortOrder,
    is_published: input.isPublished,
    detail_published: input.detailPublished,
  };
}

async function normalizeProjectSortOrders(client: SupabaseClient) {
  const { data, error } = await client
    .from("portfolio_projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return false;

  const updates = (data ?? []).flatMap((project, index) => (
    Number(project.sort_order) === index + 1
      ? []
      : [client.from("portfolio_projects").update({ sort_order: index + 1 }).eq("id", project.id)]
  ));
  const results = await Promise.all(updates);
  return results.every((result) => !result.error);
}

export async function createProjectAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const input = projectPayload(formData);
    const { data: project, error } = await client
      .from("portfolio_projects")
      .insert(projectRow(input))
      .select("id, slug")
      .single();
    if (error || !project) throw error ?? new Error("project_create_failed");

    const image = formData.get("projectImage");
    if (image instanceof File && image.size > 0) {
      try {
        const publishImage = checkbox(formData, "publishProjectImage");
        const imageInput = mediaMetadataInputSchema.parse({
          projectId: project.id,
          kind: "project_image",
          altText: text(formData, "imageAltText"),
          caption: text(formData, "imageCaption"),
          clientName: "",
          approvalStatus: publishImage ? "approved" : "draft",
          isPublished: publishImage,
          sortOrder: 0,
        });
        await uploadMediaRecord(client, imageInput, image);
      } catch (uploadError) {
        await client.from("portfolio_projects").delete().eq("id", project.id);
        throw uploadError;
      }
    }
    const orderNormalized = await normalizeProjectSortOrders(client);

    revalidatePath("/admin/projects");
    revalidatePath("/admin/media");
    revalidatePath("/work");
    revalidatePath(`/work/${project.slug}`);
    revalidatePath("/");
    return {
      status: "success",
      message: orderNormalized
        ? (image instanceof File && image.size > 0 ? "프로젝트와 대표 이미지를 추가했습니다." : "프로젝트를 추가했습니다.")
        : "프로젝트를 추가했지만 노출 순서 자동 정리에 실패했습니다. 순서를 확인해 주세요.",
    };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function updateProjectAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const id = uuidSchema.parse(formData.get("id"));
    const input = projectPayload(formData);
    const { data, error } = await client
      .from("portfolio_projects")
      .update(projectRow(input))
      .eq("id", id)
      .select("slug")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("project_not_found");
    const orderNormalized = await normalizeProjectSortOrders(client);

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);
    revalidatePath("/work");
    revalidatePath(`/work/${data.slug}`);
    revalidatePath("/");
    return orderNormalized
      ? { status: "success", message: "프로젝트를 저장했습니다." }
      : { status: "success", message: "프로젝트를 저장했지만 노출 순서 자동 정리에 실패했습니다. 순서를 확인해 주세요." };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function deleteProjectAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const id = uuidSchema.parse(formData.get("id"));
    if (formData.get("confirmed") !== "true") {
      return { status: "error", message: "삭제 확인이 필요합니다." };
    }

    const [{ data: project, error: projectError }, { data: media, error: mediaError }] = await Promise.all([
      client.from("portfolio_projects").select("slug").eq("id", id).maybeSingle(),
      client.from("media_assets").select("storage_path").eq("project_id", id),
    ]);
    if (projectError || !project) throw projectError ?? new Error("project_not_found");
    if (mediaError) throw mediaError;

    const storagePaths = (media ?? []).flatMap((item) => (
      typeof item.storage_path === "string" ? [item.storage_path] : []
    ));
    if (storagePaths.length > 0) {
      const { error: storageError } = await client.storage
        .from("wds-media")
        .remove(storagePaths);
      if (storageError) {
        return {
          status: "error",
          message: "연결된 파일 삭제에 실패해 프로젝트 기록을 유지했습니다. 잠시 후 다시 시도해 주세요.",
        };
      }
    }

    const { data: deleted, error: deleteError } = await client
      .from("portfolio_projects")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (deleteError || !deleted) {
      return {
        status: "error",
        message: storagePaths.length > 0
          ? "파일은 삭제했지만 프로젝트 기록 정리에 실패했습니다. 다시 시도하면 남은 기록을 정리합니다."
          : "프로젝트 기록을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }

    const orderNormalized = await normalizeProjectSortOrders(client);

    revalidatePath("/admin/projects");
    revalidatePath("/admin/media");
    revalidatePath("/work");
    revalidatePath(`/work/${project.slug}`);
    revalidatePath("/");

    return orderNormalized
      ? { status: "success", message: "프로젝트를 삭제했습니다." }
      : { status: "success", message: "프로젝트를 삭제했지만 노출 순서 자동 정리에 실패했습니다. 순서를 확인해 주세요." };
  } catch (error) {
    return contentActionError(error);
  }
}

function mediaPayload(formData: FormData) {
  const projectId = text(formData, "projectId").trim() || null;
  return mediaMetadataInputSchema.parse({
    projectId,
    kind: text(formData, "kind"),
    altText: text(formData, "altText"),
    caption: text(formData, "caption"),
    clientName: text(formData, "clientName"),
    approvalStatus: text(formData, "approvalStatus"),
    isPublished: checkbox(formData, "isPublished"),
    sortOrder: Number(text(formData, "sortOrder")),
  });
}

function mediaRow(input: ReturnType<typeof mediaPayload>) {
  return {
    project_id: input.kind === "project_image" ? input.projectId : null,
    kind: input.kind,
    alt_text: input.altText,
    caption: input.caption,
    client_name: input.kind === "client_logo" ? input.clientName : null,
    approval_status: input.approvalStatus,
    is_published: input.isPublished,
    sort_order: input.sortOrder,
  };
}

async function uploadMediaRecord(
  client: SupabaseClient,
  input: ReturnType<typeof mediaPayload>,
  file: File,
) {
  validateImageFile(file);
  const extension = imageExtension[file.type as (typeof imageMimeTypes)[number]];
  const uploadedPath = `${input.kind}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await client.storage
    .from("wds-media")
    .upload(uploadedPath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { error: insertError } = await client.from("media_assets").insert({
    ...mediaRow(input),
    storage_path: uploadedPath,
    original_name: file.name.slice(0, 255),
    mime_type: file.type,
    byte_size: file.size,
  });
  if (insertError) {
    await client.storage.from("wds-media").remove([uploadedPath]);
    throw insertError;
  }
}

export async function uploadMediaAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const input = mediaPayload(formData);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", message: "업로드할 이미지 파일을 선택해 주세요." };
    }
    await uploadMediaRecord(client, input, file);

    revalidatePath("/admin/media");
    if (input.projectId) revalidatePath(`/admin/projects/${input.projectId}`);
    revalidatePath("/work");
    revalidatePath("/");
    return { status: "success", message: "이미지를 업로드했습니다." };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function updateMediaAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const id = uuidSchema.parse(formData.get("id"));
    const input = mediaPayload(formData);
    const { data, error } = await client
      .from("media_assets")
      .update(mediaRow(input))
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("media_not_found");

    revalidatePath("/admin/media");
    if (input.projectId) revalidatePath(`/admin/projects/${input.projectId}`);
    revalidatePath(`/api/media/${id}`);
    revalidatePath("/work");
    revalidatePath("/");
    return { status: "success", message: "미디어 정보를 저장했습니다." };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function deleteMediaAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const id = uuidSchema.parse(formData.get("id"));
    if (formData.get("confirmed") !== "true") {
      return { status: "error", message: "삭제 확인이 필요합니다." };
    }

    const { data, error: lookupError } = await client
      .from("media_assets")
      .select("storage_path, project_id")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) {
      return { status: "error", message: "삭제할 미디어 정보를 불러오지 못했습니다. 다시 시도해 주세요." };
    }
    if (!data) {
      return { status: "success", message: "파일과 기록이 이미 삭제되었습니다." };
    }

    const { error: storageError } = await client.storage
      .from("wds-media")
      .remove([data.storage_path]);
    if (storageError) {
      return {
        status: "error",
        message: "파일 삭제에 실패해 기록을 유지했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }

    const { data: deleted, error: deleteError } = await client
      .from("media_assets")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (deleteError || !deleted) {
      return {
        status: "error",
        message: "파일은 삭제했지만 기록 정리에 실패했습니다. 다시 시도하면 남은 기록을 정리합니다.",
      };
    }

    revalidatePath(`/api/media/${id}`);
    revalidatePath("/work");
    revalidatePath("/");
    return { status: "success", message: "파일과 연결된 기록을 영구 삭제했습니다." };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function createLegalDraftAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const documentType = z.enum(LEGAL_DOCUMENT_TYPES).parse(formData.get("documentType"));
    const { data: existingDraft, error: draftError } = await client
      .from("legal_documents")
      .select("id")
      .eq("document_type", documentType)
      .eq("status", "draft")
      .maybeSingle();
    if (draftError) throw draftError;
    if (existingDraft) {
      return { status: "error", message: "이미 편집 중인 초안이 있습니다." };
    }

    const { data: published, error: publishedError } = await client
      .from("legal_documents")
      .select("title, version, summary, content, effective_at")
      .eq("document_type", documentType)
      .eq("status", "published")
      .maybeSingle();
    if (publishedError) throw publishedError;

    const today = new Date().toISOString().slice(0, 10);
    const { error } = await client.from("legal_documents").insert({
      document_type: documentType,
      title: published?.title ?? LEGAL_DOCUMENT_LABELS[documentType],
      version: today,
      summary: published?.summary ?? "",
      content: published?.content ?? LEGAL_DOCUMENT_TEMPLATES[documentType],
      effective_at: published?.effective_at ?? today,
      status: "draft",
    });
    if (error) throw error;

    revalidatePath("/admin/legal");
    return { status: "success", message: "편집할 초안을 만들었습니다." };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function saveLegalDraftAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const id = uuidSchema.parse(formData.get("id"));
    const input = legalDocumentInputSchema.parse({
      documentType: text(formData, "documentType"),
      title: text(formData, "title"),
      version: text(formData, "version"),
      summary: text(formData, "summary"),
      content: text(formData, "content"),
      effectiveAt: text(formData, "effectiveAt") || null,
    });

    const { data, error } = await client
      .from("legal_documents")
      .update({
        title: input.title,
        version: input.version,
        summary: input.summary,
        content: input.content,
        effective_at: input.effectiveAt,
      })
      .eq("id", id)
      .eq("document_type", input.documentType)
      .eq("status", "draft")
      .select("id")
      .maybeSingle();
    if (error || !data) throw error ?? new Error("legal_draft_not_found");

    revalidatePath("/admin/legal");
    return { status: "success", message: "초안을 저장했습니다." };
  } catch (error) {
    return contentActionError(error);
  }
}

export async function publishLegalDocumentAction(
  _previous: ContentActionState,
  formData: FormData,
): Promise<ContentActionState> {
  try {
    const { client } = await requireAdminAction();
    const id = uuidSchema.parse(formData.get("id"));
    const documentType = z.enum(LEGAL_DOCUMENT_TYPES).parse(formData.get("documentType"));
    const { data, error } = await client.rpc("publish_legal_document", {
      p_document_id: id,
    });
    if (error || data !== true) throw error ?? new Error("legal_publish_failed");

    revalidatePath("/admin/legal");
    revalidatePath(documentType === "privacy" ? "/privacy" : "/terms");
    revalidatePath("/");
    return { status: "success", message: "새 버전을 공개했습니다." };
  } catch (error) {
    return contentActionError(error);
  }
}
