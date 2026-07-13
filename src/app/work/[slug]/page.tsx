import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, ContactBand, SiteFrame } from "@/components/site";
import { RichText } from "@/components/content/rich-text";
import styles from "@/components/site/site.module.css";
import { getPublishedProject } from "@/lib/content/public";
import { createPageMetadata } from "@/lib/metadata";

type WorkDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);

  if (!project || !project.detailPublished) {
    return {
      ...createPageMetadata({
        title: "프로젝트를 찾을 수 없습니다",
        description: "요청한 프로젝트 페이지를 찾을 수 없습니다.",
        path: "/work",
      }),
      robots: { index: false, follow: false },
    };
  }

  return createPageMetadata({
    title: `${project.title} | 프로젝트`,
    description: project.summary,
    path: `/work/${project.slug}`,
  });
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);

  if (!project || !project.detailPublished) {
    notFound();
  }

  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
      <section className={styles.projectDetailHero}>
        <div className={styles.container}>
          <div className={styles.projectDetailHeroTop}>
            <span>{project.type}</span>
            <span>{project.status}</span>
          </div>
          <h1 className={styles.projectDetailTitle}>{project.title}</h1>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.projectOverviewGrid}>
            <h2>{project.summary}</h2>
            <ul className={styles.projectOverviewMeta}>
              <li>
                <strong>프로젝트</strong>
                <span>{project.type}</span>
              </li>
              <li>
                <strong>수행 범위</strong>
                <span>{project.scopes.join(" · ")}</span>
              </li>
              <li>
                <strong>상태</strong>
                <span>{project.status}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionDark} aria-label="프로젝트 상세 내용">
        <div className={styles.container}>
          {[
            ["고객의 과제", project.challenge],
            ["원디자인스튜디오의 역할", project.roleDescription],
            ["접근 방식", project.approach],
            ["결과", project.outcome],
          ].filter(([, value]) => value).map(([title, value]) => (
            <article className={styles.detailNarrative} key={title}>
              <h2>{title}</h2>
              <RichText content={value} className={styles.detailNarrativeContent} />
            </article>
          ))}
        </div>
      </section>

      {project.media.length > 0 ? (
        <section className={styles.section} aria-label="프로젝트 이미지">
          <div className={styles.container}>
            <div className={styles.projectMediaFlow}>
              {project.media.map((media) => (
                <figure key={media.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/media/${media.id}`} alt={media.altText} />
                  {media.caption ? <figcaption>{media.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Link className={styles.nextProject} href="/work">
        <div className={styles.container}>
          <span>프로젝트 목록</span>
          <strong>
            더 많은 프로젝트
            <ArrowIcon />
          </strong>
        </div>
      </Link>

        <ContactBand />
      </main>
    </SiteFrame>
  );
}
