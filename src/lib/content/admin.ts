import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminMediaAsset, AdminProjectCover, LegalDocument, ManagedProject } from "./types";

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

export async function getNextProjectSortOrder(client: SupabaseClient) {
  const { data, error } = await client
    .from("portfolio_projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? Number(data.sort_order) + 1 : 1;
}

export async function listAdminProjectCovers(client: SupabaseClient): Promise<AdminProjectCover[]> {
  const { data, error } = await client
    .from("media_assets")
    .select("id, project_id, alt_text")
    .eq("kind", "project_image")
    .not("project_id", "is", null)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    projectId: String(row.project_id),
    altText: String(row.alt_text),
  }));
}

function mapAdminMedia(row: Record<string, unknown>): AdminMediaAsset {
  const projectValue = row.portfolio_projects as { title?: unknown } | Array<{ title?: unknown }> | null;
  const project = Array.isArray(projectValue) ? projectValue[0] : projectValue;

  return {
    id: String(row.id),
    projectId: typeof row.project_id === "string" ? row.project_id : null,
    projectTitle: typeof project?.title === "string" ? project.title : null,
    kind: row.kind as AdminMediaAsset["kind"],
    originalName: String(row.original_name),
    mimeType: String(row.mime_type),
    byteSize: Number(row.byte_size),
    altText: String(row.alt_text),
    caption: String(row.caption ?? ""),
    clientName: typeof row.client_name === "string" ? row.client_name : null,
    approvalStatus: row.approval_status as AdminMediaAsset["approvalStatus"],
    isPublished: Boolean(row.is_published),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  };
}

export async function listAdminMedia(client: SupabaseClient): Promise<AdminMediaAsset[]> {
  const { data, error } = await client
    .from("media_assets")
    .select("*, portfolio_projects(title)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAdminMedia);
}

export async function listAdminProjectMedia(client: SupabaseClient, projectId: string) {
  const { data, error } = await client
    .from("media_assets")
    .select("*, portfolio_projects(title)")
    .eq("kind", "project_image")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapAdminMedia);
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
