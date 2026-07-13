import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminMediaAsset, LegalDocument, ManagedProject } from "./types";

function mapAdminProject(row: Record<string, unknown>): ManagedProject {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    clientName: typeof row.client_name === "string" ? row.client_name : null,
    summary: String(row.summary),
    type: String(row.project_type),
    scopes: Array.isArray(row.scopes) ? row.scopes.map(String) : [],
    status: String(row.status_label),
    visualTone: row.visual_tone as ManagedProject["visualTone"],
    challenge: String(row.challenge ?? ""),
    roleDescription: String(row.role_description ?? ""),
    approach: String(row.approach ?? ""),
    outcome: String(row.outcome ?? ""),
    sortOrder: Number(row.sort_order),
    isPublished: Boolean(row.is_published),
    detailPublished: Boolean(row.detail_published),
    media: [],
  };
}

export async function listAdminProjects(client: SupabaseClient) {
  const { data, error } = await client
    .from("portfolio_projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapAdminProject);
}

export async function getAdminProject(client: SupabaseClient, id: string) {
  const { data, error } = await client
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapAdminProject(data) : null;
}

export async function listAdminMedia(client: SupabaseClient): Promise<AdminMediaAsset[]> {
  const { data, error } = await client
    .from("media_assets")
    .select("*, portfolio_projects(title)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const project = Array.isArray(row.portfolio_projects)
      ? row.portfolio_projects[0]
      : row.portfolio_projects;

    return {
      id: row.id,
      projectId: row.project_id,
      projectTitle: project?.title ?? null,
      kind: row.kind,
      originalName: row.original_name,
      mimeType: row.mime_type,
      byteSize: Number(row.byte_size),
      altText: row.alt_text,
      caption: row.caption,
      clientName: row.client_name,
      approvalStatus: row.approval_status,
      isPublished: row.is_published,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    } as AdminMediaAsset;
  });
}

function mapLegalDocument(row: Record<string, unknown>): LegalDocument {
  return {
    id: String(row.id),
    documentType: row.document_type as LegalDocument["documentType"],
    title: String(row.title),
    version: String(row.version),
    summary: String(row.summary ?? ""),
    content: String(row.content),
    status: row.status as LegalDocument["status"],
    effectiveAt: typeof row.effective_at === "string" ? row.effective_at : null,
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    updatedAt: String(row.updated_at),
  };
}

export async function listLegalDocuments(client: SupabaseClient) {
  const { data, error } = await client
    .from("legal_documents")
    .select("*")
    .in("status", ["draft", "published"])
    .order("document_type", { ascending: true })
    .order("status", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapLegalDocument);
}

export async function getLegalDraft(
  client: SupabaseClient,
  documentType: LegalDocument["documentType"],
) {
  const { data, error } = await client
    .from("legal_documents")
    .select("*")
    .eq("document_type", documentType)
    .eq("status", "draft")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLegalDocument(data) : null;
}

export async function getPublishedLegalForAdmin(
  client: SupabaseClient,
  documentType: LegalDocument["documentType"],
) {
  const { data, error } = await client
    .from("legal_documents")
    .select("*")
    .eq("document_type", documentType)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? mapLegalDocument(data) : null;
}
