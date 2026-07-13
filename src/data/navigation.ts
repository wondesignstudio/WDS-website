export const primaryNavigation = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/approach", label: "Approach" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNavigation = [
  ...primaryNavigation,
  { href: "/privacy", label: "개인정보처리방침" },
] as const;
