import { HomePage } from "@/components/home/HomePage";
import { createPageMetadata } from "@/lib/metadata";
import {
  getPublishedLegalDocument,
  listPublishedClientLogos,
  listPublishedProjects,
} from "@/lib/content/public";

export const metadata = createPageMetadata({
  title: "Won Design Studio | Digital Experience Partner",
  description:
    "사업을 이해하는 것부터 웹사이트와 디지털 제품의 설계, 개발, 출시 이후 개선까지 연결하는 Digital Experience Partner입니다.",
  path: "/",
  absoluteTitle: true,
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, clientLogos, terms] = await Promise.all([
    listPublishedProjects(),
    listPublishedClientLogos(),
    getPublishedLegalDocument("terms"),
  ]);
  return <HomePage projects={projects} clientLogos={clientLogos} hasTerms={Boolean(terms)} />;
}
