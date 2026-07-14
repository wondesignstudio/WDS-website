import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";

import { SupabaseConfigurationError } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAccess =
  | { state: "allowed"; client: SupabaseClient; user: User }
  | { state: "signed_out" }
  | { state: "forbidden"; email: string | null }
  | { state: "configuration_error"; missing: string[] }
  | { state: "unavailable" };

export class AdminAuthorizationError extends Error {
  constructor(message = "관리자 권한을 확인할 수 없습니다.") {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

export const getAdminAccess = cache(async function getAdminAccess(): Promise<AdminAccess> {
  let client: SupabaseClient;

  try {
    client = await createSupabaseServerClient();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      return { state: "configuration_error", missing: error.missing };
    }

    return { state: "unavailable" };
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    return { state: "signed_out" };
  }

  const { data: isAdmin, error: adminError } = await client.rpc(
    "is_current_admin",
  );

  if (adminError) {
    return { state: "unavailable" };
  }

  if (isAdmin !== true) {
    return { state: "forbidden", email: user.email ?? null };
  }

  return { state: "allowed", client, user };
});

export async function requireAdminAction() {
  const access = await getAdminAccess();

  if (access.state !== "allowed") {
    throw new AdminAuthorizationError(
      access.state === "configuration_error"
        ? `관리자 환경 설정이 필요합니다: ${access.missing.join(", ")}`
        : "로그인 또는 관리자 권한을 다시 확인해 주세요.",
    );
  }

  return access;
}
