export type ProjectVisualTone = "orange" | "black" | "white";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  type: string;
  scopes: readonly string[];
  status: "출시";
  detailPublished: boolean;
  visualTone: ProjectVisualTone;
};

export const projects: readonly Project[] = [
  {
    slug: "marketing-catnip",
    title: "Marketing Catnip",
    summary:
      "복잡한 B2B 마케팅 콘텐츠를 살아 있는 브랜드 경험으로 전환했습니다.",
    type: "B2B 콘텐츠 플랫폼",
    scopes: [
      "기획",
      "정보 구조",
      "UX/UI",
      "반응형 웹",
      "관리자 기획",
      "품질 검수",
    ],
    status: "출시",
    detailPublished: true,
    visualTone: "orange",
  },
  {
    slug: "timeattack",
    title: "TimeAttack",
    summary:
      "보이지 않는 데이터와 컨설팅 역량을 이해할 수 있는 기업 웹사이트로 만들었습니다.",
    type: "기업 웹사이트",
    scopes: ["기획", "UX/UI", "아임웹 개발"],
    status: "출시",
    detailPublished: true,
    visualTone: "black",
  },
  {
    slug: "questboard",
    title: "Questboard",
    summary:
      "AI 교육 콘텐츠 제작의 복잡한 흐름을 교사 중심의 제품 경험으로 설계했습니다.",
    type: "AI 교육 제품",
    scopes: ["제품 기획", "UX/UI", "디자인 시스템", "개발 협업"],
    status: "출시",
    detailPublished: true,
    visualTone: "white",
  },
] as const;

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
