export default function AdminLoading() {
  return (
    <main className="mx-auto flex min-h-[55vh] max-w-7xl items-center justify-center px-6 py-16" aria-busy="true">
      <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
        <span className="size-8 animate-spin rounded-full border-[3px] border-zinc-300 border-t-zinc-950" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-zinc-700">관리자 페이지를 불러오는 중입니다.</p>
      </div>
    </main>
  );
}
