"use client";

import { deleteInquiryAction } from "@/app/admin/actions";

import { ActionSubmitButton } from "./action-submit-button";

export function DeleteInquiryForm({ publicId }: { publicId: string }) {
  return (
    <form
      action={deleteInquiryAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "이 문의와 연결된 이메일 처리 기록을 영구 삭제할까요? 되돌릴 수 없습니다.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="publicId" value={publicId} />
      <input type="hidden" name="confirmed" value="true" />
      <ActionSubmitButton
        idleLabel="문의 영구 삭제"
        pendingLabel="삭제 중…"
        destructive
      />
    </form>
  );
}
