import {
  ContactBand,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "@/components/site";
import styles from "@/components/site/site.module.css";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "회사 소개",
  description:
    "사업을 이해하고 웹사이트와 디지털 제품을 끝까지 완성하는 원디자인스튜디오의 존재 이유와 방향을 소개합니다.",
  path: "/about",
});

const values = [
  "고객 사업에 대한 이해",
  "완성도",
  "전문성",
  "실행력",
  "커뮤니케이션",
] as const;

export default function AboutPage() {
  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
      <PageHero
        tone="accent"
        title={
          <>
            디자인을 깊이 들여다볼수록,
            <br />그 근원에는 늘 비즈니스가 있었습니다.
          </>
        }
        description="원디자인스튜디오는 보기 좋은 결과물을 만드는 데서 멈추지 않습니다. 중요한 아이디어가 실제 웹사이트와 디지털 제품으로 완성되도록 필요한 구조와 팀을 설계합니다."
      />

      <section className={styles.section} aria-labelledby="purpose-title">
        <div className={styles.container}>
          <h2 id="purpose-title" className={styles.aboutStatement}>
            좋은 사업이 <em>실행팀의 부재</em>로 멈추지 않도록. 기업이
            디자인과 개발 과정에서 같은 시행착오를 반복하지 않도록.
          </h2>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <h2>시작과 확장</h2>
            <p>
              원디자인스튜디오는 디자인에서 출발해 사업, 제품과 기술로
              역할을 확장했습니다. 고객사의 중요한 아이디어가 실제
              웹사이트와 디지털 제품으로 완성되도록 필요한 구조와 팀을
              설계합니다.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={styles.missionGrid}>
            <article className={styles.missionBlock}>
              <span>미션</span>
              <p>
                기업의 사업 과제를 이해하고, 이를 완성도 높은 웹사이트와
                디지털 제품으로 실행합니다.
              </p>
            </article>
            <article className={styles.missionBlock}>
              <span>우리가 향하는 곳</span>
              <p>
                대기업의 사업, 마케팅, 브랜드와 제품 조직이 중요한 디지털
                프로젝트를 믿고 맡기는 20명 규모의 대표적인 디지털 경험
                파트너가 됩니다.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading
            label="가치"
            title="함께 일하는 모든 과정에서 지키는 기준입니다."
          />
          <ol className={styles.valuesList}>
            {values.map((value) => (
              <li key={value} className={styles.valueItem}>
                <span>{value}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <h2>팀과 파트너</h2>
            <p>
              프로젝트 목표와 범위에 맞춰 필요한 디자인과 개발 역량을
              구성합니다.
            </p>
          </div>
        </div>
      </section>

        <ContactBand />
      </main>
    </SiteFrame>
  );
}
