"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { signOutAdminAction } from "@/app/admin/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import { AdminNavigationFeedback } from "@/components/admin/admin-navigation-feedback";

type NavigationItem = {
  href: string;
  label: string;
  icon: "inquiries" | "projects" | "media" | "legal";
};

const navigationItems: NavigationItem[] = [
  { href: "/admin/inquiries", label: "문의", icon: "inquiries" },
  { href: "/admin/projects", label: "프로젝트", icon: "projects" },
  { href: "/admin/media", label: "미디어", icon: "media" },
  { href: "/admin/legal", label: "법적 문서", icon: "legal" },
];

function NavigationIcon({ name }: { name: NavigationItem["icon"] }) {
  if (name === "inquiries") {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.75h6m-8.25 8.25 1.62-3.24A8.25 8.25 0 1 1 20.25 12c0 4.56-3.69 8.25-8.25 8.25H5.25Z" />
      </svg>
    );
  }

  if (name === "projects") {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75A2.25 2.25 0 0 1 6 4.5h3.13c.6 0 1.17.24 1.59.66l1.12 1.12c.42.42.99.66 1.59.66H18A2.25 2.25 0 0 1 20.25 9.2v8.05A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75Z" />
      </svg>
    );
  }

  if (name === "media") {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 16.5 4.72-4.72a2.25 2.25 0 0 1 3.18 0l1.6 1.6m0 0 1.97-1.97a2.25 2.25 0 0 1 3.18 0l1.85 1.84m-7 0 3.1 3.1m3.9-10.6v12.5A2.25 2.25 0 0 1 18 20.5H6a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 6 3.5h12a2.25 2.25 0 0 1 2.25 2.25ZM16.5 8.25h.01v.01h-.01v-.01Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h7.69c.6 0 1.17.24 1.59.66l2.31 2.31c.42.42.66.99.66 1.59v11.94H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75V7.5h3.75M8.25 12h7.5m-7.5 3.25h5.25" />
    </svg>
  );
}

function SidebarContent({
  email,
  pathname,
  onNavigate,
}: {
  email: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <Link
        className="flex items-center gap-3 rounded-2xl px-3 py-2 text-white"
        href="/admin/inquiries"
        onClick={onNavigate}
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
          <BrandLogo variant="white" className="size-7 object-contain" sizes="28px" priority />
        </span>
        <span>
          <span className="block text-base font-semibold tracking-tight text-white">WDS Admin</span>
          <span className="mt-0.5 block text-[13px] font-medium text-zinc-500">Content operations</span>
        </span>
      </Link>

      <nav className="mt-10" aria-label="관리자 메뉴">
        <p className="px-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-zinc-600">Workspace</p>
        <ul className="mt-3 grid gap-1.5">
          {navigationItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                  }`}
                  href={item.href}
                  onClick={onNavigate}
                >
                  <span className={active ? "text-[#ff5c00]" : "text-zinc-500 group-hover:text-zinc-300"}>
                    <NavigationIcon name={item.icon} />
                  </span>
                  <span className={`flex-1 ${active ? "text-zinc-950" : "text-zinc-400 group-hover:text-white"}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto rounded-2xl bg-white/[0.06] p-3.5">
        <p className="truncate text-sm font-semibold text-white">{email}</p>
        <a
          className="group mt-3 flex items-center justify-between rounded-lg px-1 py-2 text-sm font-medium text-zinc-400 hover:text-white"
          href="/"
          target="_blank"
          rel="noreferrer"
        >
          <span className="text-zinc-400 group-hover:text-white">공개 사이트 보기</span>
          <svg aria-hidden="true" className="size-4 text-zinc-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18v4.5M18 6l-7.5 7.5M9.75 7.5H6.5A1.5 1.5 0 0 0 5 9v8.5A1.5 1.5 0 0 0 6.5 19h8.5a1.5 1.5 0 0 0 1.5-1.5v-3.25" />
          </svg>
        </a>
        <form action={signOutAdminAction}>
          <button className="mt-1 w-full rounded-lg px-1 py-2 text-left text-sm font-medium text-zinc-400 hover:text-white">
            로그아웃
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleDialogKeyboard);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKeyboard);
      menuButton?.focus();
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden bg-[#f3f3f1]">
      <AdminNavigationFeedback />

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] overflow-y-auto bg-[#111111] lg:block">
        <SidebarContent email={email} pathname={pathname} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-white/95 px-5 shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <Link className="flex items-center gap-2.5 font-semibold tracking-tight" href="/admin/inquiries">
          <BrandLogo className="size-7 object-contain" sizes="28px" priority />
          WDS Admin
        </Link>
        <button
          ref={menuButtonRef}
          className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950"
          type="button"
          aria-label="관리자 메뉴 열기"
          aria-controls="admin-mobile-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
            <path strokeLinecap="round" d="M4 7.5h16M4 12h16M4 16.5h16" />
          </svg>
        </button>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/55"
            type="button"
            aria-label="관리자 메뉴 닫기"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            ref={mobileMenuRef}
            id="admin-mobile-navigation"
            className="absolute inset-y-0 left-0 w-[min(19rem,86vw)] overflow-y-auto bg-[#111111] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="관리자 메뉴"
          >
            <button
              ref={closeButtonRef}
              className="absolute right-4 top-5 z-10 flex size-10 items-center justify-center rounded-xl bg-white/10 text-white"
              type="button"
              aria-label="관리자 메뉴 닫기"
              onClick={() => setMenuOpen(false)}
            >
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                <path strokeLinecap="round" d="m6.5 6.5 11 11m0-11-11 11" />
              </svg>
            </button>
            <SidebarContent email={email} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div id="main-content" tabIndex={-1} className="min-h-screen min-w-0 max-w-full lg:pl-[17rem]">
        {children}
      </div>
    </div>
  );
}
