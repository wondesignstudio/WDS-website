import { redirect } from "next/navigation";

import { AdminLoginButton } from "@/components/admin/admin-login-button";
import { getAdminAccess } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "로그인 응답에 필요한 코드가 없습니다.",
  callback_failed: "Google 로그인 확인에 실패했습니다. 다시 시도해 주세요.",
  auth_not_configured: "Supabase Google 로그인이 아직 설정되지 않았습니다.",
  not_allowed: "허용 목록에 등록된 Google 계정만 접근할 수 있습니다.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const access = await getAdminAccess();
  if (access.state === "allowed") {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;
  const configurationMessage =
    access.state === "configuration_error"
      ? `환경 설정 필요: ${access.missing.join(", ")}`
      : access.state === "unavailable"
        ? "인증 서비스에 연결할 수 없습니다. Supabase migration과 OAuth 설정을 확인해 주세요."
        : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Won Design Studio
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">관리자 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          등록된 Google 관리자 계정으로만 문의를 확인할 수 있습니다.
        </p>
        {errorMessage || configurationMessage ? (
          <p className="my-5 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900" role="alert">
            {errorMessage ?? configurationMessage}
          </p>
        ) : (
          <div className="h-5" />
        )}
        <AdminLoginButton />
      </section>
    </main>
  );
}
