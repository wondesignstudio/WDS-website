"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);

    try {
      const client = createSupabaseBrowserClient();
      const { error: signInError } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "openid email profile",
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch {
      setPending(false);
      setError("Google 로그인을 시작하지 못했습니다. 환경 설정을 확인해 주세요.");
    }
  }

  return (
    <div>
      <button
        type="button"
        className="w-full rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:opacity-60"
        disabled={pending}
        onClick={signIn}
      >
        {pending ? "Google로 이동 중…" : "Google로 로그인"}
      </button>
      {error ? (
        <p className="mt-3 text-sm leading-6 text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
