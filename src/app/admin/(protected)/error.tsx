"use client";

export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <section className="rounded-2xl border border-red-200 bg-white p-8">
        <h1 className="text-2xl font-semibold">관리자 데이터를 불러오지 못했습니다.</h1>
        <p className="mt-3 text-zinc-600">
          연결 상태를 확인하고 다시 시도해 주세요.
        </p>
        <button
          className="mt-6 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={reset}
        >
          다시 시도
        </button>
      </section>
    </main>
  );
}
