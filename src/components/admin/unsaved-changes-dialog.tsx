"use client";

import { useEffect, useRef } from "react";

export function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      stayButtonRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-black/55"
      aria-labelledby="unsaved-project-title"
      aria-describedby="unsaved-project-description"
      onCancel={(event) => {
        event.preventDefault();
        onStay();
      }}
    >
      <div className="p-6 sm:p-7">
        <p className="text-sm font-semibold text-zinc-500">저장 확인</p>
        <h2 id="unsaved-project-title" className="mt-2 text-2xl font-semibold tracking-tight">
          작성 중인 내용이 있습니다
        </h2>
        <p id="unsaved-project-description" className="mt-3 text-sm leading-6 text-zinc-600">
          지금 페이지를 나가면 저장하지 않은 프로젝트 내용이 사라집니다.
        </p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            type="button"
            onClick={onLeave}
          >
            저장하지 않고 나가기
          </button>
          <button
            ref={stayButtonRef}
            className="rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
            type="button"
            onClick={onStay}
          >
            계속 작성
          </button>
        </div>
      </div>
    </dialog>
  );
}
