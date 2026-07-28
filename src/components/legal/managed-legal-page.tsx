import type { ReactNode } from "react";

import { AnalyticsPreferenceReset } from "@/components/analytics/analytics-preference-reset";
import { PageHero, SiteFrame } from "@/components/site";
import styles from "@/components/site/site.module.css";
import type { LegalDocument } from "@/lib/content/types";

type LegalBlock =
  | { type: "section"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseLegalContent(content: string): LegalBlock[] {
  const lines = content.split(/\r?\n/);
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "section", text: line.slice(3).trim() });
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "subheading", text: line.slice(4).trim() });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function ManagedLegalPage({
  document,
  analyticsControls = false,
}: {
  document: LegalDocument;
  analyticsControls?: boolean;
}) {
  const blocks = parseLegalContent(document.content);
  const groups: Array<{ title: string; content: ReactNode[] }> = [];

  for (const block of blocks) {
    if (block.type === "section") {
      groups.push({ title: block.text, content: [] });
      continue;
    }
    if (groups.length === 0) groups.push({ title: "안내", content: [] });
    const group = groups[groups.length - 1];
    if (block.type === "subheading") {
      group.content.push(<h3 key={`${group.title}-h-${group.content.length}`}>{block.text}</h3>);
    } else if (block.type === "paragraph") {
      group.content.push(<p key={`${group.title}-p-${group.content.length}`}>{block.text}</p>);
    } else {
      group.content.push(
        <ul key={`${group.title}-l-${group.content.length}`}>
          {block.items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}
        </ul>,
      );
    }
  }

  return (
    <SiteFrame>
      <main id="main-content" className={styles.pageMain}>
        <PageHero title={document.title} description={document.summary || "적용 중인 운영 기준을 안내합니다."} />
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.privacyGrid}>
              <aside className={styles.privacyAside}>
                <p>
                  시행일 {document.effectiveAt ?? "미정"}
                  <br />
                  방침 버전 {document.version}
                </p>
              </aside>
              <div className={styles.privacyContent}>
                {groups.map((group) => (
                  <section className={styles.privacySection} key={group.title}>
                    <h2>{group.title}</h2>
                    {group.content}
                  </section>
                ))}
                {analyticsControls ? (
                  <section className={styles.privacySection}>
                    <h2>선택 분석 설정</h2>
                    <p>브라우저에 저장된 선택 분석 동의를 지우고 다시 선택할 수 있습니다.</p>
                    <AnalyticsPreferenceReset />
                  </section>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
