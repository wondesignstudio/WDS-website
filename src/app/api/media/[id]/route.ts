import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAdminAccess } from "@/lib/auth/admin";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const idSchema = z.string().uuid();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const parsed = idSchema.safeParse(rawId);
  if (!parsed.success) return new NextResponse(null, { status: 404 });

  const adminPreview = request.nextUrl.searchParams.get("admin") === "1";

  try {
    if (adminPreview) {
      const access = await getAdminAccess();
      if (access.state !== "allowed") return new NextResponse(null, { status: 404 });

      const { data: asset, error } = await access.client
        .from("media_assets")
        .select("storage_path")
        .eq("id", parsed.data)
        .maybeSingle();
      if (error || !asset) return new NextResponse(null, { status: 404 });

      const { data: signed, error: signError } = await access.client.storage
        .from("wds-media")
        .createSignedUrl(asset.storage_path, 300);
      if (signError || !signed) return new NextResponse(null, { status: 404 });

      return NextResponse.redirect(signed.signedUrl, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const client = getSupabaseServiceClient();
    const { data: asset, error } = await client
      .from("media_assets")
      .select("storage_path, kind, project_id, approval_status, is_published")
      .eq("id", parsed.data)
      .maybeSingle();

    if (
      error ||
      !asset ||
      asset.approval_status !== "approved" ||
      asset.is_published !== true
    ) {
      return new NextResponse(null, { status: 404 });
    }

    if (asset.kind === "project_image") {
      const { data: project, error: projectError } = await client
        .from("portfolio_projects")
        .select("is_published")
        .eq("id", asset.project_id)
        .maybeSingle();
      if (projectError || project?.is_published !== true) {
        return new NextResponse(null, { status: 404 });
      }
    }

    const { data: signed, error: signError } = await client.storage
      .from("wds-media")
      .createSignedUrl(asset.storage_path, 300);
    if (signError || !signed) return new NextResponse(null, { status: 404 });

    return NextResponse.redirect(signed.signedUrl, {
      headers: { "Cache-Control": "public, max-age=240, stale-while-revalidate=60" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
