"use client";

import { resetAnalyticsConsent } from "./analytics-consent";

import styles from "./analytics-preference-reset.module.css";

export function AnalyticsPreferenceReset() {
  return (
    <button className={styles.button} type="button" onClick={resetAnalyticsConsent}>
      선택 분석 다시 설정하기
    </button>
  );
}
