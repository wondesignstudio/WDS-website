import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAdminAction } from "@/app/admin/actions";
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
    <>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link className="font-semibold tracking-tight" href="/admin/inquiries">
              WDS Admin
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden text-zinc-500 sm:inline">
                {access.user.email}
              </span>
              <form action={signOutAdminAction}>
                <button className="font-medium text-zinc-700 hover:text-zinc-950">
                  로그아웃
                </button>
              </form>
            </div>
          </div>
          <nav className="mt-4 overflow-x-auto" aria-label="관리자 메뉴">
            <ul className="flex min-w-max gap-1 text-sm font-semibold">
              {[
                ["/admin/inquiries", "문의"],
                ["/admin/projects", "프로젝트"],
                ["/admin/media", "미디어"],
                ["/admin/legal", "법적 문서"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link className="block rounded-lg px-3 py-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" href={href}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
