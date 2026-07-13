"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  AdminAuthorizationError,
  requireAdminAction,
} from "@/lib/auth/admin";
import { inquiryStatusSchema } from "@/lib/contact/schema";
import type { AdminActionState } from "@/lib/contact/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicIdSchema = z.string().uuid();

function actionError(error: unknown): AdminActionState {
  if (error instanceof AdminAuthorizationError) {
    return { status: "error", message: error.message };
  }

  return {
    status: "error",
    message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  };
}

export async function updateInquiryStatusAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { client } = await requireAdminAction();
    const publicId = publicIdSchema.parse(formData.get("publicId"));
    const status = inquiryStatusSchema.parse(formData.get("status"));
    const reference = String(formData.get("customerRecordReference") ?? "")
      .trim()
      .slice(0, 500);
    const transferConfirmed = formData.get("transferConfirmed") === "on";

    if (status === "converted" && (!transferConfirmed || !reference)) {
      return {
        status: "error",
        message: "고객 전환 전 별도 고객기록 이관과 참조를 확인해 주세요.",
      };
    }

    const updates: Record<string, string | null> = { status };
    if (status === "converted") {
      updates.customer_record_reference = reference;
      updates.customer_record_transferred_at = new Date().toISOString();
    }

    const { data, error } = await client
      .from("contact_inquiries")
      .update(updates)
      .eq("public_id", publicId)
      .select("public_id")
      .maybeSingle();

    if (error || !data) {
      return { status: "error", message: "상태를 변경하지 못했습니다." };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${publicId}`);
    return { status: "success", message: "상태를 저장했습니다." };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveInquiryMemoAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { client } = await requireAdminAction();
    const publicId = publicIdSchema.parse(formData.get("publicId"));
    const memo = z.string().trim().max(10_000).parse(formData.get("memo"));
    const { data, error } = await client
      .from("contact_inquiries")
      .update({ internal_memo: memo })
      .eq("public_id", publicId)
      .select("public_id")
      .maybeSingle();

    if (error || !data) {
      return { status: "error", message: "메모를 저장하지 못했습니다." };
    }

    revalidatePath(`/admin/inquiries/${publicId}`);
    return { status: "success", message: "메모를 저장했습니다." };
  } catch (error) {
    return actionError(error);
  }
}

export async function retryFailedInquiryEmailsAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const { client } = await requireAdminAction();
    const publicId = publicIdSchema.parse(formData.get("publicId"));
    const { data, error } = await client.rpc(
      "requeue_failed_email_deliveries",
      { p_inquiry_public_id: publicId },
    );

    if (error || typeof data !== "number") {
      return {
        status: "error",
        message: "실패한 이메일을 재시도 대기열에 넣지 못했습니다.",
      };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${publicId}`);

    if (data === 0) {
      return { status: "success", message: "재시도할 실패 이메일이 없습니다." };
    }

    return {
      status: "success",
      message: `실패한 이메일 ${data}건을 재시도 대기열에 넣었습니다.`,
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteInquiryAction(formData: FormData) {
  try {
    const { client } = await requireAdminAction();
    const publicId = publicIdSchema.parse(formData.get("publicId"));
    const confirmed = formData.get("confirmed") === "true";

    if (!confirmed) {
      return;
    }

    const { error } = await client
      .from("contact_inquiries")
      .delete()
      .eq("public_id", publicId);

    if (error) {
      return;
    }

    revalidatePath("/admin/inquiries");
  } catch {
    return;
  }

  redirect("/admin/inquiries?deleted=1");
}

export async function signOutAdminAction() {
  try {
    const client = await createSupabaseServerClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    if (user) {
      await client.auth.signOut();
    }
  } catch {
    // The local cookie is no longer considered an authenticated admin even if
    // the remote sign-out endpoint is temporarily unavailable.
  }

  redirect("/admin/login");
}
