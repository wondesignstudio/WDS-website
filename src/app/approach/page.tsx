import {
  ContactBand,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "@/components/site";
import styles from "@/components/site/site.module.css";
import {
  approachSteps,
  collaborationTools,
  projectDocuments,
} from "@/data/approach";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "진행 방식",
  description:
    "프로젝트의 범위와 책임, 커뮤니케이션, 디자인 검토, 개발 검증, 출시 이후 안정화 과정을 소개합니다.",
  path: "/approach",
});

export default function ApproachPage() {
  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
      <PageHero
        tone="accent"
        title={
          <>
            결과만큼,
            <br />
            함께 일하는 과정도 신뢰할 수 있어야 합니다.
          </>
        }
        description="무엇이 진행되고 있고, 무엇을 결정해야 하는지 고객사가 항상 이해할 수 있도록 합니다."
      />

      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <SectionHeading
            label="진행 방식"
            title="깊이 이해하고, 끝까지 완성합니다."
            description="검토와 정의부터 품질 검수, 안정화와 개선까지 하나의 흐름으로 관리합니다."
            inverted
          />
          <div className={styles.approachList}>
            {approachSteps.map((step) => (
              <article key={step.index} className={styles.approachRow}>
                <span className={styles.approachIndex}>{step.index}</span>
                <h2 className={styles.approachTitle}>{step.title}</h2>
                <p className={styles.approachDescription}>
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading
            label="협업 기준"
            title="기준이 되는 문서와 도구를 함께 관리합니다."
          />
          <div className={styles.documentsGrid}>
            <article>
              <h3>기본 문서</h3>
              <ol className={styles.documentList}>
                {projectDocuments.map((document, index) => (
                  <li key={document}>
                    <span>{document}</span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </li>
                ))}
              </ol>
            </article>
            <article>
              <h3>협업 도구</h3>
              <ul className={styles.toolList}>
                {collaborationTools.map(([tool, purpose]) => (
                  <li key={tool}>
                    <strong>{tool}</strong>
                    <span>{purpose}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

        <ContactBand />
      </main>
    </SiteFrame>
  );
}
