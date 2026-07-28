import { notFound } from "next/navigation";

import { ManagedLegalPage } from "@/components/legal/managed-legal-page";
import { getPublishedLegalDocument } from "@/lib/content/public";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "이용약관",
  description: "원디자인스튜디오 웹사이트의 이용 조건과 운영 기준을 안내합니다.",
  path: "/terms",
});

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const document = await getPublishedLegalDocument("terms");
  if (!document) notFound();
  return <ManagedLegalPage document={document} />;
}
