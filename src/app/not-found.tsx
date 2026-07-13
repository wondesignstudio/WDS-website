import Link from "next/link";
import { ArrowIcon, SiteFrame } from "@/components/site";
import styles from "@/components/site/site.module.css";

export default function NotFound() {
  return (
    <SiteFrame>
      <main id="main-content" className={styles.notFound}>
        <div className={styles.container}>
          <div className={styles.notFoundGrid}>
            <p className={styles.notFoundCode} aria-hidden="true">
              404
            </p>
            <div className={styles.notFoundContent}>
              <h1>요청하신 페이지를 찾을 수 없습니다.</h1>
              <p>
                주소가 변경되었거나 페이지가 삭제되었을 수 있습니다. 홈으로
                돌아가거나 프로젝트를 살펴보세요.
              </p>
              <div className={styles.notFoundActions}>
                <Link className={styles.textLink} href="/">
                  홈으로 돌아가기
                  <ArrowIcon />
                </Link>
                <Link className={styles.textLink} href="/work">
                  프로젝트 살펴보기
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </SiteFrame>
  );
}
