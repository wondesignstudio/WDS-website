import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  EmailDeliveryStatus,
  InquiryDetail,
  InquiryListItem,
  InquiryListResult,
} from "./types";
import { INQUIRY_STATUSES, PROJECT_TYPES } from "./schema";

type RawInquiryListRow = {
  id: number;
  public_id: string;
  created_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  project_type: string;
  project_background: string;
  budget_range: string;
  status: InquiryListItem["status"];
  inquiry_email_deliveries: Array<{
    status: EmailDeliveryStatus["status"];
  }> | null;
};

type RawInquiryDetailRow = Omit<
  RawInquiryListRow,
  "inquiry_email_deliveries"
> & {
  expected_scope: string | null;
  desired_schedule: string | null;
  reference_links: string[];
  privacy_consent_at: string;
  privacy_policy_version: string;
  internal_memo: string;
  memo_updated_at: string | null;
  status_changed_at: string;
  converted_at: string | null;
  customer_record_transferred_at: string | null;
  customer_record_reference: string | null;
  purge_after: string;
  inquiry_email_deliveries: Array<{
    id: number;
    kind: EmailDeliveryStatus["kind"];
    status: EmailDeliveryStatus["status"];
    attempt_count: number;
    sent_at: string | null;
    last_error_code: string | null;
  }> | null;
};

export type InquiryListFilters = {
  query?: string;
  status?: string;
  projectType?: string;
  cursor?: number;
};

export class AdminInquiryDataError extends Error {
  constructor(message = "문의 데이터를 불러오지 못했습니다.") {
    super(message);
    this.name = "AdminInquiryDataError";
  }
}

function mapListItem(row: RawInquiryListRow): InquiryListItem {
  return {
    id: row.id,
    publicId: row.public_id,
    createdAt: row.created_at,
    companyName: row.company_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    projectType: row.project_type,
    projectBackground: row.project_background,
    budgetRange: row.budget_range,
    status: row.status,
    failedEmailCount: (row.inquiry_email_deliveries ?? []).filter(
      (delivery) => delivery.status === "failed",
    ).length,
  };
}

function normalizeSearchQuery(value: string | undefined) {
  return value
    ?.trim()
    .replace(/[%_(),.]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

export async function listInquiries(
  client: SupabaseClient,
  filters: InquiryListFilters,
): Promise<InquiryListResult> {
  const pageSize = 25;
  let query = client
    .from("contact_inquiries")
    .select(
      "id,public_id,created_at,company_name,contact_name,email,phone,project_type,project_background,budget_range,status,inquiry_email_deliveries(status)",
    )
    .order("id", { ascending: false })
    .limit(pageSize + 1);

  if (filters.cursor && filters.cursor > 0) {
    query = query.lt("id", filters.cursor);
  }

  if (
    filters.status &&
    INQUIRY_STATUSES.includes(
      filters.status as (typeof INQUIRY_STATUSES)[number],
    )
  ) {
    query = query.eq("status", filters.status);
  }

  if (
    filters.projectType &&
    PROJECT_TYPES.includes(filters.projectType as (typeof PROJECT_TYPES)[number])
  ) {
    query = query.eq("project_type", filters.projectType);
  }

  const normalizedQuery = normalizeSearchQuery(filters.query);

  if (normalizedQuery && normalizedQuery.length >= 2) {
    query = query.ilike("search_text", `%${normalizedQuery.toLowerCase()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new AdminInquiryDataError();
  }

  const rows = (data ?? []) as RawInquiryListRow[];
  const hasNextPage = rows.length > pageSize;
  const visibleRows = hasNextPage ? rows.slice(0, pageSize) : rows;

  return {
    items: visibleRows.map(mapListItem),
    nextCursor: hasNextPage
      ? (visibleRows[visibleRows.length - 1]?.id ?? null)
      : null,
  };
}

export async function getInquiryDetail(
  client: SupabaseClient,
  publicId: string,
): Promise<InquiryDetail | null> {
  const { data, error } = await client
    .from("contact_inquiries")
    .select(
      "id,public_id,created_at,company_name,contact_name,email,phone,project_type,project_background,budget_range,expected_scope,desired_schedule,reference_links,privacy_consent_at,privacy_policy_version,status,status_changed_at,internal_memo,memo_updated_at,converted_at,customer_record_transferred_at,customer_record_reference,purge_after,inquiry_email_deliveries(id,kind,status,attempt_count,sent_at,last_error_code)",
    )
    .eq("public_id", publicId)
    .maybeSingle();

  if (error) {
    throw new AdminInquiryDataError();
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as RawInquiryDetailRow;

  return {
    ...mapListItem(row),
    expectedScope: row.expected_scope,
    desiredSchedule: row.desired_schedule,
    referenceLinks: row.reference_links ?? [],
    privacyConsentAt: row.privacy_consent_at,
    privacyPolicyVersion: row.privacy_policy_version,
    internalMemo: row.internal_memo,
    memoUpdatedAt: row.memo_updated_at,
    statusChangedAt: row.status_changed_at,
    convertedAt: row.converted_at,
    customerRecordTransferredAt: row.customer_record_transferred_at,
    customerRecordReference: row.customer_record_reference,
    purgeAfter: row.purge_after,
    deliveries: (row.inquiry_email_deliveries ?? []).map((delivery) => ({
      id: delivery.id,
      kind: delivery.kind,
      status: delivery.status,
      attemptCount: delivery.attempt_count,
      sentAt: delivery.sent_at,
      lastErrorCode: delivery.last_error_code,
    })),
  };
}
