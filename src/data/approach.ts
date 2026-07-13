export const approachSteps = [
  {
    index: "01",
    title: "철학",
    description:
      "우리는 화면을 만들기 전에 사업과 사용자를 이해합니다. 디자인과 개발을 따로 보지 않고 하나의 결과로 연결합니다.",
  },
  {
    index: "02",
    title: "사전 검토",
    description:
      "전달해주신 자료를 먼저 검토하고 사전 상담을 통해 현재 상황과 프로젝트 목표를 확인합니다.",
  },
  {
    index: "03",
    title: "범위와 책임",
    description:
      "목표, 일정, 역할, 산출물과 제외 범위를 문서화해 프로젝트의 기준을 명확히 합니다.",
  },
  {
    index: "04",
    title: "커뮤니케이션",
    description:
      "합의한 주기에 맞춰 진행 상황을 공유하고, 결정사항과 변경 요청을 기록합니다.",
  },
  {
    index: "05",
    title: "디자인 검토",
    description:
      "사업 목표와 사용자 흐름을 기준으로 디자인 의도와 주요 결정을 함께 검토합니다.",
  },
  {
    index: "06",
    title: "개발 검증",
    description:
      "디자인과 실제 구현 결과의 차이를 확인하고 주요 기능과 반응형 동작을 검증합니다.",
  },
  {
    index: "07",
    title: "품질 검수와 출시",
    description:
      "기능, 반응형, 접근성과 주요 오류를 확인한 뒤 출시합니다.",
  },
  {
    index: "08",
    title: "안정화",
    description:
      "합의한 지원 범위에 따라 출시 후 주요 오류와 운영 이슈를 확인하고 안정화를 지원합니다.",
  },
  {
    index: "09",
    title: "운영과 개선",
    description:
      "운영 과정과 데이터를 바탕으로 다음 개선 과제를 제안합니다.",
  },
] as const;

export const projectDocuments = [
  "프로젝트 일정",
  "역할과 책임 표",
  "주간 진행 보고",
  "회의록과 결정사항",
  "디자인 리뷰",
  "개발 진행 현황",
  "품질 검수 결과",
  "변경 요청 기록",
  "인수인계 문서",
  "월간 운영 보고서",
] as const;

export const collaborationTools = [
  ["이메일", "공식 커뮤니케이션"],
  ["Slack", "일상 업무와 긴급 논의"],
  ["Notion", "프로젝트 기준 문서"],
  ["Figma", "디자인과 피드백"],
] as const;
