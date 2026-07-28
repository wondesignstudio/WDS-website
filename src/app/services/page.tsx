import Link from "next/link";
import {
  ArrowIcon,
  ContactBand,
  PageHero,
  SectionHeading,
  SiteFrame,
} from "@/components/site";
import styles from "@/components/site/site.module.css";
import {
  coreCapabilities,
  excludedCapabilities,
  optionalCapabilities,
  services,
} from "@/data/services";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "서비스",
  description:
    "웹사이트 진단, 기업 웹사이트, 디지털 제품, 운영과 개선까지 프로젝트 상황에 맞는 범위를 연결합니다.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
      <PageHero
        tone="accent"
        title={
          <>
            사업의 문제를 이해하고,
            <br />
            필요한 범위만 연결합니다.
          </>
        }
        description="진단과 설계부터 개발, 출시 이후의 운영과 개선까지 프로젝트 상황에 맞춰 구성합니다."
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <SectionHeading
            label="서비스"
            title="문제를 이해하는 일부터 출시 이후의 개선까지."
          />
          <div className={styles.serviceList}>
            {services.map((service) => (
              <article
                key={service.id}
                id={service.id}
                className={styles.serviceRow}
              >
                <span className={styles.serviceIndex}>{service.index}</span>
                <h2 className={styles.serviceTitle}>{service.title}</h2>
                <div>
                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>
                  <Link className={styles.textLink} href="/contact">
                    이 서비스로 상담하기
                    <ArrowIcon />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionMuted}`}>
        <div className={styles.container}>
          <SectionHeading
            label="제공 범위"
            title="필요한 전문성을 프로젝트 범위에 맞춰 구성합니다."
          />
          <div className={styles.scopeGrid}>
            <ScopeColumn title="핵심 제공" items={coreCapabilities} />
            <ScopeColumn title="선택 제공" items={optionalCapabilities} />
            <ScopeColumn title="제외 범위" items={excludedCapabilities} />
          </div>
        </div>
      </section>

        <ContactBand />
      </main>
    </SiteFrame>
  );
}

function ScopeColumn({
  title,
  items,
}: {
  title: string;
  items: readonly string[];
}) {
  return (
    <article className={styles.scopeColumn}>
      <h3>{title}</h3>
      <ul className={styles.scopeList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
