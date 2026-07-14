"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";

import { deleteProjectAction } from "@/app/admin/content-actions";

const initialState = { status: "idle" } as const;

export function ProjectRowActions({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteProjectAction, initialState);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
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

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
          href={`/admin/projects/${id}`}
        >
          수정
        </Link>
        <button
          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          type="button"
          onClick={() => setOpen(true)}
        >
          삭제
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-black/55"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onCancel={(event) => {
          event.preventDefault();
          if (!pending) setOpen(false);
        }}
      >
        <form action={formAction} className="p-6 sm:p-7">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="confirmed" value="true" />
          <p className="text-sm font-semibold text-red-700">프로젝트 삭제</p>
          <h2 id={titleId} className="mt-2 text-2xl font-semibold tracking-tight">
            {title} 프로젝트를 삭제할까요?
          </h2>
          <p id={descriptionId} className="mt-3 text-sm leading-6 text-zinc-600">
            프로젝트와 연결된 이미지 정보가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          {state.status === "error" ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {state.message}
            </p>
          ) : null}
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
              {pending ? "삭제 중…" : "프로젝트 삭제"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
