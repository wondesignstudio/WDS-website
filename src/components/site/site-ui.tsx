import type { ReactNode } from "react";
import Link from "next/link";
import type { ManagedProject } from "@/lib/content/types";
import styles from "./site.module.css";

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11.5 4.5L17 10L11.5 15.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type PageHeroProps = {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  tone?: "plain" | "accent";
};

export function PageHero({
  title,
  description,
  aside,
  tone = "plain",
}: PageHeroProps) {
  const toneClass = {
    plain: "",
    accent: styles.pageHeroAccent,
  }[tone];

  return (
    <section className={`${styles.pageHero} ${toneClass}`}>
      <div className={styles.container}>
        <div className={styles.pageHeroGrid}>
          <h1 className={styles.pageTitle}>{title}</h1>
          <div className={styles.pageHeroSupport}>
            {description ? (
              <p className={styles.pageDescription}>{description}</p>
            ) : null}
            {aside}
          </div>
        </div>
      </div>
    </section>
  );
}

type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  label?: string;
  inverted?: boolean;
};

export function SectionHeading({
  title,
  description,
  label,
  inverted = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`${styles.sectionHeading} ${inverted ? styles.sectionHeadingInverted : ""}`}
    >
      {label ? <p className={styles.sectionLabel}>{label}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

type ProjectCardProps = {
  project: ManagedProject;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const toneClass =
    project.visualTone === "orange"
      ? styles.projectVisualOrange
      : project.visualTone === "black"
        ? styles.projectVisualBlack
        : styles.projectVisualWhite;

  return (
    <article className={styles.projectCard}>
      <div className={`${styles.projectVisual} ${toneClass}`}>
        {project.media[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.projectVisualImage} src={`/api/media/${project.media[0].id}`} alt={project.media[0].altText} />
        ) : (
          <>
            <span className={styles.projectVisualIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.projectVisualTitle}>{project.title}</span>
            <span className={styles.projectVisualType}>{project.type}</span>
          </>
        )}
      </div>
      <div className={styles.projectCardBody}>
        <div>
          <p className={styles.projectMeta}>
            {project.type} · {project.status}
          </p>
          <h2 className={styles.projectCardTitle}>{project.title}</h2>
          <p className={styles.projectSummary}>{project.summary}</p>
        </div>
        <div className={styles.projectCardFooter}>
          <ul className={styles.inlineList} aria-label="수행 범위">
            {project.scopes.map((scope) => (
              <li key={scope}>{scope}</li>
            ))}
          </ul>
          {project.detailPublished ? (
            <Link
              className={styles.textLink}
              href={`/work/${project.slug}`}
              aria-label={`${project.title} 프로젝트 자세히 보기`}
            >
              프로젝트 자세히 보기
              <ArrowIcon />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type ContactBandProps = {
  title?: ReactNode;
  description?: ReactNode;
};

export function ContactBand({
  title = (
    <>
      중요한 디지털 프로젝트를
      <br />
      준비하고 있나요?
    </>
  ),
  description =
    "현재 상황과 전달해주신 자료를 먼저 검토한 뒤, 사전 상담을 진행합니다. 문의 내용은 다음 영업일 이내에 확인해 안내드립니다.",
}: ContactBandProps) {
  return (
    <section className={styles.contactBand}>
      <div className={styles.container}>
        <div className={styles.contactBandGrid}>
          <h2>{title}</h2>
          <div>
            <p>{description}</p>
            <Link
              className={styles.primaryButtonLight}
              href="/contact"
              data-analytics-event="consultation_cta_click"
            >
              프로젝트 상담하기
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
