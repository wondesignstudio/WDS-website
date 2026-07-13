"use client";

import { useActionState } from "react";

import { saveInquiryMemoAction } from "@/app/admin/actions";
import type { AdminActionState } from "@/lib/contact/types";

import { ActionSubmitButton } from "./action-submit-button";

const initialState: AdminActionState = { status: "idle", message: "" };

export function MemoEditor({
  publicId,
  memo,
}: {
  publicId: string;
  memo: string;
}) {
  const [state, action] = useActionState(saveInquiryMemoAction, initialState);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="publicId" value={publicId} />
      <label className="text-sm font-medium text-zinc-700">
        내부 메모
        <textarea
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950"
          name="memo"
          rows={7}
          maxLength={10_000}
          defaultValue={memo}
        />
      </label>
      <div className="flex items-center gap-3">
        <ActionSubmitButton idleLabel="메모 저장" pendingLabel="저장 중…" />
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
