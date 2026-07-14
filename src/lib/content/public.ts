import { projects as fallbackProjects, type Project } from "@/data/projects";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

import type { ClientLogo, LegalDocument, ManagedProject, ProjectMedia } from "./types";
import type { LegalDocumentType } from "./schema";

type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  client_name: string | null;
  summary: string;
  project_type: string;
  scopes: string[];
  status_label: string;
  visual_tone: Project["visualTone"];
  challenge: string;
  role_description: string;
  approach: string;
  outcome: string;
  sort_order: number;
  is_published: boolean;
  detail_published: boolean;
};

function fallbackManagedProjects(): ManagedProject[] {
  return fallbackProjects.map((project, index) => ({
    id: `fallback-${project.slug}`,
    slug: project.slug,
    title: project.title,
    clientName: null,
    summary: project.summary,
    type: project.type,
    scopes: [...project.scopes],
    status: project.status,
    visualTone: project.visualTone,
    challenge: "",
    roleDescription: "",
    approach: "",
    outcome: "",
    sortOrder: index + 1,
    isPublished: true,
    detailPublished: project.detailPublished,
    media: [],
  }));
}

function mapProject(row: ProjectRow, media: ProjectMedia[] = []): ManagedProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    clientName: row.client_name,
    summary: row.summary,
    type: row.project_type,
    scopes: row.scopes,
    status: row.status_label,
    visualTone: row.visual_tone,
    challenge: row.challenge,
    roleDescription: row.role_description,
    approach: row.approach,
    outcome: row.outcome,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    detailPublished: row.detail_published,
    media,
  };
}

async function listProjectMedia(projectIds: string[]) {
  if (projectIds.length === 0) return new Map<string, ProjectMedia[]>();

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("media_assets")
    .select("id, project_id, alt_text, caption")
    .eq("kind", "project_image")
    .eq("approval_status", "approved")
    .eq("is_published", true)
    .in("project_id", projectIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  const grouped = new Map<string, ProjectMedia[]>();
  for (const row of data ?? []) {
    if (!row.project_id) continue;
    const items = grouped.get(row.project_id) ?? [];
    items.push({ id: row.id, altText: row.alt_text, caption: row.caption });
    grouped.set(row.project_id, items);
  }
  return grouped;
}

export async function listPublishedProjects(): Promise<ManagedProject[]> {
  try {
    const client = getSupabaseServiceClient();
    const { data, error } = await client
      .from("portfolio_projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (!data?.length) return fallbackManagedProjects();

    const rows = data as ProjectRow[];
    const mediaByProject = await listProjectMedia(rows.map((row) => row.id));
    return rows.map((row) => mapProject(row, mediaByProject.get(row.id)));
  } catch {
    return fallbackManagedProjects();
  }
}

export async function getPublishedProject(slug: string) {
  const projects = await listPublishedProjects();
  return projects.find((project) => project.slug === slug);
}

export async function listPublishedClientLogos(): Promise<ClientLogo[]> {
  try {
    const client = getSupabaseServiceClient();
    const { data, error } = await client
      .from("media_assets")
      .select("id, client_name, alt_text")
      .eq("kind", "client_logo")
      .eq("approval_status", "approved")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).filter((row) => row.client_name).map((row) => ({
      id: row.id,
      clientName: row.client_name as string,
      altText: row.alt_text,
    }));
  } catch {
    return [];
  }
}

export async function getPublishedLegalDocument(
  documentType: LegalDocumentType,
): Promise<LegalDocument | null> {
  try {
    const client = getSupabaseServiceClient();
    const { data, error } = await client
      .from("legal_documents")
      .select("*")
      .eq("document_type", documentType)
      .eq("status", "published")
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      documentType: data.document_type,
      title: data.title,
      version: data.version,
      summary: data.summary,
      content: data.content,
      status: data.status,
      effectiveAt: data.effective_at,
      publishedAt: data.published_at,
      updatedAt: data.updated_at,
    } as LegalDocument;
  } catch {
    return null;
  }
}
