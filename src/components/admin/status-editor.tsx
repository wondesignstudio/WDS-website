"use client";

import { useActionState, useState } from "react";

import { updateInquiryStatusAction } from "@/app/admin/actions";
import { INQUIRY_STATUS_OPTIONS, type InquiryStatus } from "@/lib/contact/schema";
import type { AdminActionState } from "@/lib/contact/types";

import { ActionSubmitButton } from "./action-submit-button";

const initialState: AdminActionState = { status: "idle", message: "" };

export function StatusEditor({
  publicId,
  status: initialStatus,
  customerRecordReference,
  customerRecordTransferredAt,
}: {
  publicId: string;
  status: InquiryStatus;
  customerRecordReference: string | null;
  customerRecordTransferredAt: string | null;
}) {
  const [state, action] = useActionState(
    updateInquiryStatusAction,
    initialState,
  );
  const [status, setStatus] = useState<InquiryStatus>(initialStatus);
  const isConverted = status === "converted";

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="publicId" value={publicId} />
      <label className="text-sm font-medium text-zinc-700">
        진행 상태
        <select
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as InquiryStatus)}
        >
          {INQUIRY_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {isConverted ? (
        <div className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <label className="text-sm font-medium text-zinc-700">
            별도 고객기록 참조
            <input
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              name="customerRecordReference"
              maxLength={500}
              defaultValue={customerRecordReference ?? ""}
              placeholder="고객 ID, 문서 경로 또는 CRM 링크"
              required
            />
          </label>
          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              className="mt-1"
              type="checkbox"
              name="transferConfirmed"
              defaultChecked={Boolean(customerRecordTransferredAt)}
              required
            />
            별도 고객기록으로 필요한 정보를 이관했습니다.
          </label>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <ActionSubmitButton idleLabel="상태 저장" pendingLabel="저장 중…" />
        {state.message ? (
          <p
            className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-emerald-700"}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
