import type { ProjectVisualTone } from "@/data/projects";
import type { LegalDocumentType } from "./schema";

export type ProjectMedia = {
  id: string;
  altText: string;
  caption: string;
};

export type ClientLogo = {
  id: string;
  clientName: string;
  altText: string;
};

export type ManagedProject = {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  summary: string;
  type: string;
  scopes: string[];
  status: string;
  visualTone: ProjectVisualTone;
  challenge: string;
  roleDescription: string;
  approach: string;
  outcome: string;
  sortOrder: number;
  isPublished: boolean;
  detailPublished: boolean;
  media: ProjectMedia[];
};

export type AdminMediaAsset = {
  id: string;
  projectId: string | null;
  projectTitle: string | null;
  kind: "project_image" | "client_logo";
  originalName: string;
  mimeType: string;
  byteSize: number;
  altText: string;
  caption: string;
  clientName: string | null;
  approvalStatus: "draft" | "approved" | "rejected";
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
};

export type LegalDocument = {
  id: string;
  documentType: LegalDocumentType;
  title: string;
  version: string;
  summary: string;
  content: string;
  status: "draft" | "published" | "archived";
  effectiveAt: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type ContentActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };
