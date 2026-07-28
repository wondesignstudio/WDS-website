export const services = [
  {
    id: "website-diagnostics",
    index: "01",
    title: "웹사이트 진단",
    description:
      "웹사이트의 사업 메시지, 콘텐츠 구조, UX/UI, 기술과 운영 환경을 분석합니다.",
  },
  {
    id: "corporate-website",
    index: "02",
    title: "기업 웹사이트",
    description:
      "기업의 사업과 브랜드를 이해할 수 있는 구조로 재설계하고 실제 웹사이트로 구현합니다.",
  },
  {
    id: "digital-product",
    index: "03",
    title: "디지털 제품",
    description:
      "웹 기반 제품의 정보 구조, 사용자 흐름, UX/UI, 디자인 시스템과 개발 협업을 수행합니다.",
  },
  {
    id: "operation-improvement",
    index: "04",
    title: "운영과 개선",
    description:
      "출시 이후 콘텐츠, 기능, 성능과 사용자 경험을 운영하고 개선합니다.",
  },
] as const;

export const coreCapabilities = [
  "브랜드 디자인",
  "기업 웹사이트",
  "랜딩페이지",
  "웹 기반 제품 UX/UI",
  "프론트엔드 개발",
  "백엔드 개발",
  "관리자 시스템",
  "유지보수 및 운영",
] as const;

export const optionalCapabilities = [
  "사업 및 서비스 기획",
  "브랜드 전략",
  "데이터 분석",
  "AI 기능 개발",
] as const;

export const excludedCapabilities = [
  "반복적인 콘텐츠 제작 대행",
  "상시 마케팅 배너 제작",
  "무제한 수정",
  "계약에 포함되지 않은 상시 긴급 대응",
] as const;
