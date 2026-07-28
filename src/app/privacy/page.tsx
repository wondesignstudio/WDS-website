import type { ReactNode } from "react";
import Link from "next/link";

import { AnalyticsPreferenceReset } from "@/components/analytics/analytics-preference-reset";
import { ManagedLegalPage } from "@/components/legal/managed-legal-page";
import { ArrowIcon, PageHero, SiteFrame } from "@/components/site";
import styles from "@/components/site/site.module.css";
import { createPageMetadata } from "@/lib/metadata";
import { getPublishedLegalDocument } from "@/lib/content/public";

export const metadata = createPageMetadata({
  title: "개인정보처리방침",
  description:
    "원디자인스튜디오 웹사이트의 프로젝트 문의 개인정보 수집, 이용, 보유 및 파기 기준을 안내합니다.",
  path: "/privacy",
});

const POLICY_VERSION = "2026-07-14";

export default async function PrivacyPage() {
  const managedDocument = await getPublishedLegalDocument("privacy");
  if (managedDocument) {
    return <ManagedLegalPage document={managedDocument} analyticsControls />;
  }

  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
        <PageHero
          title="개인정보처리방침"
          description="원디자인스튜디오는 프로젝트 문의 처리에 필요한 최소한의 개인정보를 수집하고 안전하게 관리합니다."
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.privacyGrid}>
              <aside className={styles.privacyAside}>
                <p>
                  시행일 2026. 7. 14.
                  <br />
                  방침 버전 {POLICY_VERSION}
                </p>
              </aside>

              <div className={styles.privacyContent}>
                <p className={styles.privacyIntro}>
                  프로젝트 상담을 위해 전달한 정보가 어떤 목적으로 사용되고,
                  어디에서 처리되며, 언제까지 보관되는지 안내합니다.
                </p>

                <PolicySection title="1. 개인정보의 처리 목적">
                  <p>
                    원디자인스튜디오(이하 “WDS”)는 프로젝트 문의 확인, 사전
                    상담과 회신, 업무 범위·일정·예산 검토, 제안 안내, 중복
                    접수와 부정 이용 방지를 위해 개인정보를 처리합니다. 수집한
                    정보는 이 목적과 관련 없는 용도로 사용하지 않습니다.
                  </p>
                </PolicySection>

                <PolicySection title="2. 처리하는 개인정보 항목">
                  <h3>필수 항목</h3>
                  <p>
                    회사명, 담당자명, 업무 이메일, 프로젝트 유형, 현재 문제와
                    추진 배경, 예산 범위, 개인정보 수집·이용 동의 여부와 시각,
                    동의한 방침 버전
                  </p>
                  <h3>선택 항목</h3>
                  <p>연락처, 예상 업무 범위, 희망 일정, 참고 링크</p>
                  <h3>서비스 이용 과정에서 생성되는 항목</h3>
                  <p>
                    접수 시각과 요청 기록, 중복 접수와 부정 이용 방지를 위해
                    이메일 및 네트워크 주소를 일방향 변환한 식별값
                  </p>
                  <p className={styles.privacyNote}>
                    필수 항목 수집에 동의하지 않을 수 있으나, 동의하지 않으면
                    웹사이트를 통한 프로젝트 상담 접수가 어렵습니다.
                  </p>
                </PolicySection>

                <PolicySection title="3. 보유 및 이용 기간">
                  <p>
                    계약으로 이어지지 않은 문의 정보는 접수일로부터 12개월간
                    보관한 뒤 삭제합니다. 계약으로 이어진 경우에는 계약 이행과
                    법적 의무에 필요한 정보만 별도 고객 기록으로 이관하며, 해당
                    계약과 관련 법령에서 정한 기간 동안 보관합니다. 요청 제한용
                    일방향 식별값은 설정된 제한 기간이 끝나면 삭제합니다.
                  </p>
                </PolicySection>

                <PolicySection title="4. 개인정보의 제3자 제공">
                  <p>
                    WDS는 정보주체의 별도 동의를 받거나 법령에 근거가 있는
                    경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.
                  </p>
                </PolicySection>

                <PolicySection title="5. 개인정보 처리 위탁">
                  <p>
                    WDS는 문의 접수와 운영을 위해 아래 사업자에게 필요한 범위의
                    처리를 위탁합니다.
                  </p>
                  <ul>
                    <li>Vercel Inc.: 웹사이트 호스팅과 서버 요청 처리</li>
                    <li>Supabase, Inc.: 문의 데이터 저장과 관리자 인증</li>
                    <li>Resend, Inc.: 운영자 알림과 문의자 확인 이메일 발송</li>
                    <li>Google LLC: 이용자가 허용한 경우에만 방문·전환 분석</li>
                  </ul>
                  <p className={styles.privacyNote}>
                    수탁사가 변경되거나 위탁 업무가 달라지면 본 방침을 통해
                    안내합니다.
                  </p>
                </PolicySection>

                <PolicySection title="6. 개인정보의 국외 처리">
                  <p>
                    웹사이트 운영에 필요한 클라우드 서비스를 이용하는 과정에서
                    개인정보가 아래와 같이 국외에서 처리될 수 있습니다.
                  </p>
                  <div className={styles.privacyFacts}>
                    <PolicyFact title="Vercel Inc. · 미국">
                      문의 접수 시 암호화된 네트워크를 통해 필수·선택 문의 항목을
                      서버 요청 처리에 이용합니다. 프로젝트 상담 요청에 필요한
                      처리 위탁이며, 요청 처리와 서비스 운영에 필요한 기간 동안
                      처리됩니다.
                    </PolicyFact>
                    <PolicyFact title="Supabase, Inc. · 일본(도쿄)">
                      문의 접수 시 암호화된 네트워크를 통해 문의 정보와 동의
                      기록을 전송하여 저장·관리합니다. 문의 정보는 원칙적으로
                      접수일로부터 12개월 보관합니다.
                    </PolicyFact>
                    <PolicyFact title="Resend, Inc. · 일본(도쿄), 미국">
                      문의 접수 직후 암호화된 네트워크를 통해 이름과 이메일 등
                      발송에 필요한 정보를 전송하여 접수 알림과 확인 메일을
                      발송합니다. 발송 기록은 발송과 장애 대응에 필요한 기간
                      동안 처리됩니다.
                    </PolicyFact>
                    <PolicyFact title="Google LLC · 미국 등 Google 처리 시설 소재 국가">
                      이용자가 선택 분석을 허용한 시점부터 방문 경로, 페이지,
                      클릭 이벤트, 기기·브라우저 정보와 대략적인 지역 정보가
                      암호화된 네트워크를 통해 전송됩니다. 문의서에 입력한 내용은
                      전송하지 않습니다. 사용자·이벤트 수준 데이터는 Google
                      Analytics 설정에 따라 최대 14개월 보관될 수 있습니다.
                    </PolicyFact>
                  </div>
                  <p className={styles.privacyNote}>
                    문의 처리용 국외 위탁·보관을 원하지 않으면 웹 폼 대신 아래
                    개인정보 보호 문의 전화로 상담할 수 있습니다. 선택 분석은
                    언제든 거부하거나 다시 설정할 수 있으며, 거부해도 웹사이트
                    이용과 문의 접수에는 영향이 없습니다.
                  </p>
                </PolicySection>

                <PolicySection title="7. 자동 수집 정보와 선택 분석">
                  <p>
                    WDS는 이용자가 ‘선택 분석 허용’을 선택한 경우에만 Google
                    Analytics를 불러옵니다. 이때 방문·전환 분석을 위한 자사
                    쿠키와 브라우저 저장소가 사용될 수 있습니다. 선택 결과는
                    브라우저의 로컬 저장소에 보관되며, 아래 버튼이나 브라우저
                    저장 데이터 삭제 기능으로 언제든 변경할 수 있습니다.
                  </p>
                  <AnalyticsPreferenceReset />
                </PolicySection>

                <PolicySection title="8. 파기 절차와 방법">
                  <p>
                    보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 복구할
                    수 없는 방식으로 지체 없이 삭제합니다. 전자 파일은 기록을
                    재생할 수 없는 기술적 방법으로 삭제합니다.
                  </p>
                </PolicySection>

                <PolicySection title="9. 정보주체의 권리와 행사 방법">
                  <p>
                    정보주체는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리
                    정지 또는 동의 철회를 요청할 수 있습니다. 본인 확인이 필요한
                    경우 최소한의 확인 절차를 거치며, 법령에서 정한 사유가 없는
                    한 지체 없이 처리 결과를 안내합니다.
                  </p>
                  <Link className={styles.textLink} href="/contact">
                    개인정보 관련 요청하기
                    <ArrowIcon />
                  </Link>
                </PolicySection>

                <PolicySection title="10. 안전성 확보 조치">
                  <p>
                    WDS는 문의 정보에 대한 접근 권한을 업무상 필요한 운영자로
                    제한하고, 관리자 인증과 접근 통제, 전송 구간 암호화, 비밀
                    정보의 서버 전용 관리, 보관 기간 경과 데이터의 정기 삭제 등
                    보호 조치를 적용합니다.
                  </p>
                </PolicySection>

                <PolicySection title="11. 개인정보 보호 문의">
                  <p>
                    담당 부서: 원디자인스튜디오 개인정보 보호 담당
                    <br />
                    이메일: <a href="mailto:wondesign01@gmail.com">wondesign01@gmail.com</a>
                    <br />
                    전화: <a href="tel:+821039919389">010-3991-9389</a>
                  </p>
                  <p className={styles.privacyNote}>
                    개인정보 침해에 대한 상담이나 신고가 필요하면 개인정보침해
                    신고센터(국번 없이 118) 또는 개인정보분쟁조정위원회
                    (1833-6972)에 문의할 수 있습니다.
                  </p>
                </PolicySection>

                <PolicySection title="12. 방침 변경 안내">
                  <p>
                    본 방침의 내용이 변경되는 경우 시행 전에 웹사이트를 통해
                    변경 내용과 시행일을 안내합니다. 본 방침은 2026년 7월
                    14일부터 시행합니다.
                  </p>
                </PolicySection>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.privacySection}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function PolicyFact({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.privacyFact}>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
