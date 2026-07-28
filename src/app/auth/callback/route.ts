import { NextResponse } from "next/server";

import { sanitizeAdminRedirect } from "@/lib/auth/redirect";
import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginRedirect(requestUrl: URL, error: string) {
  const target = new URL("/admin/login", requestUrl.origin);
  target.searchParams.set("error", error);
  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeAdminRedirect(requestUrl.searchParams.get("next"));

  if (!code) {
    return loginRedirect(requestUrl, "missing_code");
  }

  try {
    const client = await createSupabaseServerClient();
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return loginRedirect(requestUrl, "callback_failed");
    }

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      return loginRedirect(requestUrl, "callback_failed");
    }

    const { data: isAdmin, error: adminError } = await client.rpc(
      "is_current_admin",
    );

    if (adminError) {
      await client.auth.signOut();
      return loginRedirect(requestUrl, "auth_not_configured");
    }

    if (isAdmin !== true) {
      await client.auth.signOut();
      return loginRedirect(requestUrl, "not_allowed");
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    return loginRedirect(
      requestUrl,
      error instanceof SupabaseConfigurationError
        ? "auth_not_configured"
        : "callback_failed",
    );
  }
}
