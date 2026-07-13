import {
  ContactBand,
  PageHero,
  ProjectCard,
  SiteFrame,
} from "@/components/site";
import styles from "@/components/site/site.module.css";
import { listPublishedProjects } from "@/lib/content/public";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "프로젝트",
  description:
    "기업 웹사이트부터 디지털 제품까지, 원디자인스튜디오가 문제를 이해하고 실제 결과로 완성한 프로젝트를 소개합니다.",
  path: "/work",
});

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const projects = await listPublishedProjects();
  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
        <PageHero
          tone="accent"
          title={
            <>
              문제를 이해하고,
              <br />
              실제 결과로 완성한 프로젝트.
            </>
          }
          description="기업 웹사이트부터 디지털 제품까지, 어떤 문제를 어떻게 풀고 구현했는지 보여드립니다."
        />

        <section className={styles.section} aria-label="프로젝트 목록">
          <div className={styles.container}>
            <div className={styles.projectList}>
              {projects.map((project, index) => (
                <ProjectCard key={project.slug} project={project} index={index} />
              ))}
            </div>
          </div>
        </section>

        <ContactBand title="우리 프로젝트도 함께 이야기해볼까요?" />
      </main>
    </SiteFrame>
  );
}
