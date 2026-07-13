import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { footerNavigation } from "@/data/navigation";
import { getPublishedLegalDocument } from "@/lib/content/public";
import styles from "./site.module.css";

export async function SiteFooter() {
  const terms = await getPublishedLegalDocument("terms");
  const navigation = terms
    ? [...footerNavigation, { href: "/terms", label: "이용약관" }]
    : footerNavigation;
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerTop}>
        <Link
          className={styles.footerBrand}
          href="/"
          aria-label="Won Design Studio 홈"
        >
          <BrandLogo variant="white" className={styles.footerBrandLogo} />
        </Link>
        <nav className={styles.footerNav} aria-label="하단 메뉴">
          <ul>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.footerCopyright}>
          © 2026 Won Design Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
