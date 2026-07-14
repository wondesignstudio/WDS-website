import { redirect } from "next/navigation";

import { signOutAdminAction } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAccess } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

function ConfigurationNotice({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <h1 className="text-2xl font-semibold">관리자 설정이 필요합니다.</h1>
        <p className="mt-3 leading-7 text-amber-950">{message}</p>
      </section>
    </main>
  );
}

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await getAdminAccess();

  if (access.state === "signed_out") {
    redirect("/admin/login");
  }

  if (access.state === "configuration_error") {
    return (
      <ConfigurationNotice
        message={`Vercel에 ${access.missing.join(", ")} 환경 변수를 설정해 주세요.`}
      />
    );
  }

  if (access.state === "unavailable") {
    return (
      <ConfigurationNotice message="Supabase migration과 Google OAuth provider 설정을 확인해 주세요." />
    );
  }

  if (access.state === "forbidden") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-semibold">접근 권한이 없습니다.</h1>
          <p className="mt-3 text-red-950">
            {access.email ?? "현재 계정"}은 관리자 허용 목록에 없습니다.
          </p>
          <form className="mt-6" action={signOutAdminAction}>
            <button className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
              다른 계정으로 로그인
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <AdminShell email={access.user.email ?? "관리자"}>
      {children}
    </AdminShell>
  );
}
