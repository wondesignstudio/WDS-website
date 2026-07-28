import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import type { ClientLogo, ManagedProject } from "@/lib/content/types";
import styles from "./home.module.css";

const navigation = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Approach", href: "/approach" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

const challenges = [
  "기획, 디자인, 개발 업체를 각각 관리해야 함",
  "디자인과 실제 구현 결과가 다름",
  "현재 진행 상황과 다음 결정을 파악하기 어려움",
  "출시 후 운영을 위해 다시 새로운 업체를 찾아야 함",
] as const;

const capabilities = [
  {
    title: "Diagnose",
    description: "사업 메시지, 정보 구조, UX/UI, 기술과 운영 환경을 분석합니다.",
  },
  {
    title: "Design",
    description:
      "사업과 사용자가 만나는 방식을 콘텐츠, 화면, 인터랙션과 디자인 시스템으로 구체화합니다.",
  },
  {
    title: "Develop",
    description:
      "프론트엔드, 백엔드와 관리자 시스템을 프로젝트 범위에 맞춰 구현합니다.",
  },
  {
    title: "Launch",
    description:
      "디자인과 실제 구현 결과를 검수하고 반응형, 기능과 주요 오류를 확인한 뒤 출시합니다.",
  },
  {
    title: "Improve",
    description: "운영과 데이터를 바탕으로 다음 개선 과제를 제안합니다.",
  },
] as const;

const workProcess = [
  {
    title: "Review",
    description: "전달 자료를 먼저 검토하고 사전 상담에서 현재 상황과 목표를 확인합니다.",
  },
  {
    title: "Define",
    description: "목표, 일정, 역할, 산출물과 제외 범위를 문서화합니다.",
  },
  {
    title: "Share",
    description: "합의한 주기에 맞춰 진행 상황을 공유하고 결정사항과 변경 요청을 기록합니다.",
  },
  {
    title: "Validate",
    description: "디자인과 실제 구현 결과를 함께 검수합니다.",
  },
  {
    title: "Stabilize",
    description: "합의한 지원 범위에 따라 출시 후 제품과 운영을 안정화합니다.",
  },
  {
    title: "Improve",
    description: "장기 운영을 지원하고 다음 개선 과제를 제안합니다.",
  },
] as const;

const reasons = [
  {
    title: "Business Understanding",
    description: "사업을 이해하고 시작합니다.",
  },
  {
    title: "Close Collaboration",
    description: "고객사와 가까이 소통합니다.",
  },
  {
    title: "Continuous Improvement",
    description: "출시 이후에도 개선을 이어갑니다.",
  },
] as const;

function SectionLabel({ children }: Readonly<{ children: ReactNode }>) {
  return <p className={styles.sectionLabel}>{children}</p>;
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.arrowIcon}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path d="M3 10h13M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TextLink({
  children,
  href,
  inverted = false,
}: Readonly<{
  children: ReactNode;
  href: string;
  inverted?: boolean;
}>) {
  return (
    <Link
      className={`${styles.textLink} ${inverted ? styles.textLinkInverted : ""}`}
      href={href}
    >
      <span>{children}</span>
      <ArrowIcon />
    </Link>
  );
}

function NeutralPreview({
  tall = false,
}: Readonly<{ tall?: boolean }>) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.preview} ${tall ? styles.previewTall : ""}`}
    >
      <div className={styles.previewChrome} aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
      <div className={styles.previewBody} aria-hidden="true">
        <div className={styles.previewHero} />
        <div className={styles.previewRail}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.previewRows}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.shell} ${styles.headerInner}`}>
        <Link className={styles.brand} href="/" aria-label="Won Design Studio 홈">
          <BrandLogo className={styles.brandLogo} priority />
        </Link>
        <nav aria-label="주요 메뉴">
          <ul className={styles.navigation}>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  data-analytics-event={
                    item.href === "/contact" ? "consultation_cta_click" : undefined
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="home-heading">
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <SectionLabel>DIGITAL EXPERIENCE PARTNER</SectionLabel>
          <h1 id="home-heading">
            디자인과 개발 사이에서,
            <br />
            중요한 사업이 흔들리지 않도록.
          </h1>
          <p className={styles.heroDescription}>
            우리는 고객사의 사업을 먼저 이해합니다.
            <br />
            이를 바탕으로 웹사이트와 디지털 제품을 설계하고,
            <br />
            개발과 출시 이후의 운영까지 연결합니다.
          </p>
          <div className={styles.heroActions}>
            <Link
              className={styles.primaryButton}
              href="/contact"
              data-analytics-event="consultation_cta_click"
            >
              프로젝트 상담하기
            </Link>
            <Link className={styles.secondaryButton} href="/work">
              프로젝트 살펴보기
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <NeutralPreview />
        </div>
      </div>
    </section>
  );
}

function Challenge() {
  return (
    <section className={styles.challenge} aria-labelledby="challenge-heading">
      <div className={styles.shell}>
        <SectionLabel>THE CHALLENGE</SectionLabel>
        <h2 id="challenge-heading" className={styles.challengeTitle}>
          디자인과 개발의 품질을
          <br />
          고객사가 직접 판단하고 있지는 않나요?
        </h2>
        <ol className={styles.challengeList}>
          {challenges.map((challenge, index) => (
            <li key={challenge}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{challenge}</p>
            </li>
          ))}
        </ol>
        <p className={styles.challengeClosing}>
          우리는 사업, 디자인과 개발을 하나의 프로젝트로 연결해
          <br />
          고객사가 직접 관리해야 하는 판단과 부담을 줄입니다.
        </p>
      </div>
    </section>
  );
}

function ProjectPreview({ project, tall = false }: { project?: ManagedProject; tall?: boolean }) {
  const media = project?.media[0];
  if (!media) return <NeutralPreview tall={tall} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={styles.managedProjectImage} src={`/api/media/${media.id}`} alt={media.altText} />
  );
}

function FeaturedWork({ project }: { project?: ManagedProject }) {
  const display = project;
  return (
    <section className={styles.featuredWork} aria-labelledby="featured-heading">
      <div className={`${styles.shell} ${styles.featuredGrid}`}>
        <div className={styles.featuredCopy}>
          <SectionLabel>FEATURED WORK</SectionLabel>
          <p className={styles.projectName}>{display?.title ?? "Marketing Catnip"}</p>
          <h2 id="featured-heading">
            {display?.summary ?? "복잡한 B2B 마케팅 콘텐츠를 살아 있는 브랜드 경험으로 전환했습니다."}
          </h2>
          <dl className={styles.projectMeta}>
            <div>
              <dt>Client</dt>
              <dd>{display?.clientName ?? "솔바인드9"}</dd>
            </div>
            <div>
              <dt>Project Type</dt>
              <dd>{display?.type ?? "B2B Content Platform"}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>{display?.scopes.join(" · ") ?? "Planning · IA · UX/UI · Responsive Web · Admin Planning · QA"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{display?.status ?? "Launched"}</dd>
            </div>
          </dl>
          <p className={styles.projectDescription}>
            {display?.approach || "마케팅, CRM, AI, CX 관련 전문 콘텐츠를 체계적으로 전달할 수 있도록 사이트 구조를 설계했습니다. 캐릭터와 픽셀 그래픽, 인터랙션을 활용해 일반적인 B2B 콘텐츠 사이트와 다른 브랜드 경험을 만들었습니다."}
          </p>
          <TextLink href="/work">프로젝트 보기</TextLink>
        </div>
        <div className={styles.featuredMedia}>
          <ProjectPreview project={display} />
          <div className={styles.featuredSecondaryPreview}>
            <ProjectPreview project={display} tall />
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectedWork({ projects }: { projects: ManagedProject[] }) {
  const timeAttack = projects[0];
  const questboard = projects[1];
  return (
    <section className={styles.selectedWork} aria-labelledby="selected-work-heading">
      <div className={styles.shell}>
        <SectionLabel>SELECTED WORK</SectionLabel>
        <h2 id="selected-work-heading" className={styles.visuallyHidden}>
          주요 프로젝트
        </h2>
        <article className={styles.timeAttack}>
          <ProjectPreview project={timeAttack} />
          <div className={styles.selectedCopy}>
            <h3>{timeAttack?.title ?? "TimeAttack"}</h3>
            <p className={styles.selectedStatement}>
              {timeAttack?.summary ?? "보이지 않는 데이터와 컨설팅 역량을 이해할 수 있는 기업 웹사이트로 만들었습니다."}
            </p>
            <p className={styles.selectedMeta}>
              {timeAttack ? `${timeAttack.type} · ${timeAttack.scopes.join(" · ")} · ${timeAttack.status}` : "Corporate Website · Planning · UX/UI · Imweb Development · Launched"}
            </p>
            <TextLink href="/work">프로젝트 보기</TextLink>
          </div>
        </article>
        <article className={styles.questboard}>
          <div className={styles.questboardPreview}>
            <ProjectPreview project={questboard} tall />
          </div>
          <div className={styles.selectedCopy}>
            <h3>{questboard?.title ?? "Questboard"}</h3>
            <p className={styles.selectedStatement}>
              {questboard?.summary ?? "AI 교육 콘텐츠 제작의 복잡한 흐름을 교사 중심의 제품 경험으로 설계했습니다."}
            </p>
            <p className={styles.selectedMeta}>
              {questboard ? `${questboard.type} · ${questboard.scopes.join(" · ")} · ${questboard.status}` : "AI Education Product · Product Planning · UX/UI · Design System · Development Collaboration · Launched"}
            </p>
            <TextLink href="/work">프로젝트 보기</TextLink>
          </div>
        </article>
      </div>
    </section>
  );
}

function SelectedClients({ logos }: { logos: ClientLogo[] }) {
  if (logos.length === 0) return null;
  return (
    <section className={styles.selectedClients} aria-labelledby="selected-clients-heading">
      <div className={styles.shell}>
        <SectionLabel>SELECTED CLIENTS</SectionLabel>
        <h2 id="selected-clients-heading">함께한 고객</h2>
        <ul>
          {logos.map((logo) => (
            <li key={logo.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/media/${logo.id}`} alt={logo.altText} />
              <span>{logo.clientName}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className={styles.capabilities} aria-labelledby="capabilities-heading">
      <div className={styles.shell}>
        <SectionLabel>CAPABILITIES</SectionLabel>
        <h2 id="capabilities-heading">
          문제를 이해하는 일부터
          <br />
          출시 이후의 개선까지 연결합니다.
        </h2>
        <ol className={styles.capabilityList}>
          {capabilities.map((capability) => (
            <li key={capability.title}>
              <div className={styles.capabilityHeading}>
                <h3>{capability.title}</h3>
                <span aria-hidden="true" />
              </div>
              <p>{capability.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function WebsiteDiagnostics() {
  return (
    <section className={styles.diagnostics} aria-labelledby="diagnostics-heading">
      <div className={`${styles.shell} ${styles.diagnosticsGrid}`}>
        <div>
          <SectionLabel>WEBSITE DIAGNOSTICS</SectionLabel>
          <h2 id="diagnostics-heading">
            리뉴얼을 시작하기 전에,
            <br />
            무엇을 바꿔야 하는지부터 명확히 합니다.
          </h2>
        </div>
        <div className={styles.diagnosticsDetails}>
          <p>
            현재 웹사이트의 문제를 충분히 정의하지 않은 채 디자인부터 변경하면
            같은 문제가 반복될 수 있습니다. 사업, 브랜드, 콘텐츠, UX/UI와 기술
            환경을 함께 살펴보고 개선 우선순위와 실행 범위를 정리합니다.
          </p>
          <ol className={styles.diagnosticsSteps}>
            <li>Website Review</li>
            <li>Experience Audit</li>
            <li>Discovery &amp; Roadmap</li>
          </ol>
          <TextLink href="/services" inverted>
            웹사이트 진단 알아보기
          </TextLink>
        </div>
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section className={styles.howWeWork} aria-labelledby="how-we-work-heading">
      <div className={styles.shell}>
        <SectionLabel>HOW WE WORK</SectionLabel>
        <h2 id="how-we-work-heading">
          결과만큼, 함께 일하는 과정도
          <br />
          신뢰할 수 있어야 합니다.
        </h2>
        <ol className={styles.workProcess}>
          {workProcess.map((step) => (
            <li key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
        <p className={styles.processClosing}>
          무엇이 진행되고 있고, 무엇을 결정해야 하는지 고객사가 항상 이해할 수
          있도록 합니다.
        </p>
      </div>
    </section>
  );
}

function WhyWds() {
  return (
    <section className={styles.whyWds} aria-labelledby="why-wds-heading">
      <div className={styles.shell}>
        <SectionLabel>WHY WDS</SectionLabel>
        <h2 id="why-wds-heading">
          디자인은 장식이 아니라,
          <br />
          사업이 전달되고 작동하는 방식을 섬세하게 설계하는 일입니다.
        </h2>
        <div className={styles.reasonGrid}>
          {reasons.map((reason) => (
            <article key={reason.title}>
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className={styles.about} aria-labelledby="about-heading">
      <div className={`${styles.shell} ${styles.aboutGrid}`}>
        <div className={styles.aboutMonogram} aria-hidden="true">
          <BrandLogo
            className={styles.aboutLogo}
            sizes="(max-width: 920px) 55vw, 22rem"
          />
        </div>
        <div className={styles.aboutCopy}>
          <SectionLabel>ABOUT WON DESIGN STUDIO</SectionLabel>
          <h2 id="about-heading">
            디자인을 깊이 들여다볼수록,
            <br />
            그 근원에는 늘 비즈니스가 있었습니다.
          </h2>
          <p>
            원디자인스튜디오는 디자인에서 출발해 사업, 제품과 기술로 역할을
            확장했습니다. 우리는 보기 좋은 결과물을 만드는 데서 멈추지 않습니다.
            고객사의 중요한 아이디어가 실제 웹사이트와 디지털 제품으로 완성되도록
            필요한 구조와 팀을 설계합니다.
          </p>
          <p className={styles.aboutSupporting}>
            좋은 사업이 실행팀의 부재로 멈추지 않도록.
            <br />
            기업이 디자인과 개발에서 같은 시행착오를 반복하지 않도록.
            <br />
            우리는 깊이 이해하고, 끝까지 완성합니다.
          </p>
          <TextLink href="/about">WDS 알아보기</TextLink>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className={styles.finalCta} aria-labelledby="final-cta-heading">
      <div className={`${styles.shell} ${styles.finalCtaGrid}`}>
        <div>
          <SectionLabel>START A PROJECT</SectionLabel>
          <h2 id="final-cta-heading">
            중요한 디지털 프로젝트를
            <br />
            준비하고 있나요?
          </h2>
          <p>
            현재 상황과 전달해주신 자료를 먼저 검토한 뒤, 사전 상담을
            진행합니다. 문의 내용은 다음 영업일 이내에 확인해 안내드립니다.
          </p>
        </div>
        <Link
          className={styles.primaryButton}
          href="/contact"
          data-analytics-event="consultation_cta_click"
        >
          프로젝트 상담하기
        </Link>
      </div>
    </section>
  );
}

function Footer({ hasTerms }: { hasTerms: boolean }) {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.shell} ${styles.footerInner}`}>
        <Link className={styles.footerBrand} href="/" aria-label="Won Design Studio 홈">
          <BrandLogo variant="white" className={styles.footerBrandLogo} />
        </Link>
        <nav aria-label="하단 메뉴">
          <ul className={styles.footerNavigation}>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/privacy">개인정보처리방침</Link>
            </li>
            {hasTerms ? <li><Link href="/terms">이용약관</Link></li> : null}
          </ul>
        </nav>
        <p>© 2026 Won Design Studio. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function HomePage({ projects, clientLogos, hasTerms }: { projects: ManagedProject[]; clientLogos: ClientLogo[]; hasTerms: boolean }) {
  return (
    <div className={styles.page}>
      <Header />
      <main id="main-content">
        <Hero />
        <Challenge />
        <FeaturedWork project={projects[0]} />
        <SelectedWork projects={projects.slice(1, 3)} />
        <SelectedClients logos={clientLogos} />
        <Capabilities />
        <WebsiteDiagnostics />
        <HowWeWork />
        <WhyWds />
        <About />
        <FinalCta />
      </main>
      <Footer hasTerms={hasTerms} />
    </div>
  );
}
