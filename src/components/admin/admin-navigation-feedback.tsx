"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  ADMIN_NAVIGATION_BLOCKED_EVENT,
  ADMIN_NAVIGATION_START_EVENT,
} from "@/lib/admin/navigation-events";

const FALLBACK_TIMEOUT_MS = 12_000;
const FEEDBACK_DELAY_MS = 240;

function isAdminNavigationClick(event: MouseEvent) {
  if (
    event.defaultPrevented
    || event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
    || !(event.target instanceof Element)
  ) {
    return false;
  }

  const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  const destination = new URL(anchor.href, window.location.href);
  return destination.origin === window.location.origin
    && destination.pathname.startsWith("/admin")
    && destination.href !== window.location.href;
}

export function AdminNavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = `${pathname}?${searchParams.toString()}`;
  const [navigationState, setNavigationState] = useState({ location, active: false });
  const startTimer = useRef<number | null>(null);
  const fallbackTimer = useRef<number | null>(null);
  const loading = navigationState.location === location && navigationState.active;

  useEffect(() => {
    const clearTimers = () => {
      if (startTimer.current !== null) window.clearTimeout(startTimer.current);
      if (fallbackTimer.current !== null) window.clearTimeout(fallbackTimer.current);
      startTimer.current = null;
      fallbackTimer.current = null;
    };

    const start = () => {
      clearTimers();
      setNavigationState({ location, active: true });
      fallbackTimer.current = window.setTimeout(
        () => setNavigationState({ location, active: false }),
        FALLBACK_TIMEOUT_MS,
      );
    };

    const scheduleStart = (event: MouseEvent) => {
      if (!isAdminNavigationClick(event)) return;
      clearTimers();
      startTimer.current = window.setTimeout(start, FEEDBACK_DELAY_MS);
    };

    const stop = () => {
      clearTimers();
      setNavigationState({ location, active: false });
    };

    document.addEventListener("click", scheduleStart, true);
    window.addEventListener("popstate", start);
    window.addEventListener("pageshow", stop);
    window.addEventListener(ADMIN_NAVIGATION_START_EVENT, start);
    window.addEventListener(ADMIN_NAVIGATION_BLOCKED_EVENT, stop);

    return () => {
      clearTimers();
      document.removeEventListener("click", scheduleStart, true);
      window.removeEventListener("popstate", start);
      window.removeEventListener("pageshow", stop);
      window.removeEventListener(ADMIN_NAVIGATION_START_EVENT, start);
      window.removeEventListener(ADMIN_NAVIGATION_BLOCKED_EVENT, stop);
    };
  }, [location]);

  if (!loading) return null;

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-full bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-xl"
      role="status"
      aria-live="polite"
    >
      <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true" />
      페이지 불러오는 중
    </div>
  );
}
