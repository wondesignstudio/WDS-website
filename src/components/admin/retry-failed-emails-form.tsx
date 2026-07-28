"use client";

import { useActionState } from "react";

import { retryFailedInquiryEmailsAction } from "@/app/admin/actions";
import type { AdminActionState } from "@/lib/contact/types";

import { ActionSubmitButton } from "./action-submit-button";

const initialState: AdminActionState = { status: "idle", message: "" };

export function RetryFailedEmailsForm({
  publicId,
  failedCount,
}: {
  publicId: string;
  failedCount: number;
}) {
  const [state, action] = useActionState(
    retryFailedInquiryEmailsAction,
    initialState,
  );

  return (
    <form action={action} className="mt-4 grid gap-3">
      <input type="hidden" name="publicId" value={publicId} />
      <ActionSubmitButton
        idleLabel={`실패 ${failedCount}건 다시 시도`}
        pendingLabel="대기열에 넣는 중…"
      />
      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "text-sm text-red-800"
              : "text-sm text-emerald-800"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
