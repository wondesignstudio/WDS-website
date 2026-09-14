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
              {projects.length === 0 ? (
                <div>
                  <h2 className={styles.projectCardTitle}>프로젝트에 맞는 경험을 함께 이야기합니다.</h2>
                  <p className={styles.pageDescription}>공개 사례 외에 궁금한 수행 범위가 있다면 상담에서 확인해 주세요. 현재 상황과 목표를 바탕으로 필요한 접근을 안내합니다.</p>
                </div>
              ) : null}
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
