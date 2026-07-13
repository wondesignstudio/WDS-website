import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceConfig } from "./config";

let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient() {
  if (serviceClient) {
    return serviceClient;
  }

  const { url, serviceRoleKey } = getSupabaseServiceConfig();
  serviceClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return serviceClient;
}
