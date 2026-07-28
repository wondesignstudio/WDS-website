"use client";

import { useFormStatus } from "react-dom";

export function ActionSubmitButton({
  idleLabel,
  pendingLabel,
  destructive = false,
}: {
  idleLabel: string;
  pendingLabel: string;
  destructive?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        destructive
          ? "rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          : "rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      }
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
