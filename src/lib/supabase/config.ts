export class SupabaseConfigurationError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Supabase 환경 변수가 없습니다: ${missing.join(", ")}`);
    this.name = "SupabaseConfigurationError";
    this.missing = missing;
  }
}

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const missing: string[] = [];

  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!url || !publishableKey) {
    throw new SupabaseConfigurationError(missing);
  }

  return { url, publishableKey };
}

export function getSupabaseServiceConfig() {
  const publicConfig = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new SupabaseConfigurationError(["SUPABASE_SERVICE_ROLE_KEY"]);
  }

  return { ...publicConfig, serviceRoleKey };
}
