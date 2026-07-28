"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";

import { deleteMediaAction } from "@/app/admin/content-actions";

import { ContentActionMessage } from "./content-action-message";

const initialState = { status: "idle" } as const;

export function MediaDeleteAction({ id, assetName }: { id: string; assetName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteMediaAction, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const completeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelButtonRef.current?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (state.status === "success") completeButtonRef.current?.focus();
  }, [state.status]);

  const finish = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        className="mt-4 rounded-lg px-1 py-2 text-sm font-semibold text-red-700 hover:text-red-900"
        type="button"
        onClick={() => setOpen(true)}
      >
        파일과 기록 영구 삭제
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-black/55"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          event.preventDefault();
          if (pending) return;
          if (state.status === "success") finish();
          else setOpen(false);
        }}
      >
        <div className="p-6 sm:p-7">
          {state.status === "success" ? (
            <>
              <p className="text-sm font-semibold text-emerald-700">삭제 완료</p>
              <h2 id={titleId} className="mt-2 text-2xl font-semibold tracking-tight">
                파일을 영구 삭제했습니다
              </h2>
              <p id={descriptionId} className="mt-3 text-sm leading-6 text-zinc-600">
                {state.message}
              </p>
              <button
                ref={completeButtonRef}
                className="mt-7 w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
                type="button"
                onClick={finish}
              >
                확인
              </button>
            </>
          ) : (
            <form action={formAction}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="confirmed" value="true" />
              <p className="text-sm font-semibold text-red-700">미디어 영구 삭제</p>
              <h2 id={titleId} className="mt-2 text-2xl font-semibold tracking-tight">
                이 파일을 삭제할까요?
              </h2>
              <p id={descriptionId} className="mt-3 break-words text-sm leading-6 text-zinc-600">
                <strong className="font-semibold text-zinc-800">{assetName}</strong> 파일과 연결된 관리 기록을 함께 삭제합니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              <ContentActionMessage state={state} />
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  ref={cancelButtonRef}
                  className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  취소
                </button>
                <button
                  className="rounded-lg bg-red-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  type="submit"
                  disabled={pending}
                >
                  {pending ? "삭제 중…" : "파일과 기록 삭제"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
