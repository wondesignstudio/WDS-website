import type { ContentActionState } from "@/lib/content/types";

export function ContentActionMessage({ state }: { state: ContentActionState }) {
  if (state.status === "idle") return null;

  return (
    <p
      className={`mt-4 rounded-lg px-4 py-3 text-sm ${
        state.status === "success"
          ? "bg-emerald-50 text-emerald-800"
          : "bg-red-50 text-red-800"
      }`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}
