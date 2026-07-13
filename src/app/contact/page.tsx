import { ContactForm } from "@/components/contact/contact-form";
import { PageHero, SiteFrame } from "@/components/site";
import styles from "@/components/site/site.module.css";
import { siteConfig } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "상담 문의",
  description:
    "웹사이트와 디지털 제품 프로젝트의 현재 상황, 필요한 범위, 일정과 예산을 알려주세요. 다음 영업일 이내에 확인해 안내드립니다.",
  path: "/contact",
});

const preparationItems = [
  "현재 상황과 해결하려는 문제",
  "프로젝트의 목표와 예상 업무 범위",
  "희망 일정과 예산 범위",
  "참고할 웹사이트나 문서 링크",
] as const;

export default function ContactPage() {
  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
        <PageHero
          tone="accent"
          title={
            <>
              중요한 디지털 프로젝트를
              <br />
              준비하고 있나요?
            </>
          }
          description="현재 상황과 전달해주신 내용을 먼저 검토한 뒤, 사전 상담을 진행합니다. 문의 내용은 다음 영업일 이내에 확인해 안내드립니다."
        />

        <section className={styles.sectionCompact}>
          <div className={styles.container}>
            <div className={styles.contactPreparation}>
              <h2>상담 전에 준비하면 좋은 내용</h2>
              <div className={styles.contactPreparationDetails}>
                <ol className={styles.preparationList}>
                  {preparationItems.map((item, index) => (
                    <li key={item}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {item}
                    </li>
                  ))}
                </ol>
                <p className={styles.consultationPhone}>
                  전화 상담이 필요하면
                  <a href={siteConfig.consultationPhone.href}>
                    {siteConfig.consultationPhone.display}
                  </a>
                  으로 연락해 주세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.formSection} aria-labelledby="contact-form-title">
          <div className={styles.container}>
            <div className={styles.formFrame}>
              <h2 id="contact-form-title">프로젝트 상담 신청</h2>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
