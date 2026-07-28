import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";
import { getPublishedLegalDocument, listPublishedProjects } from "@/lib/content/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, terms] = await Promise.all([
    listPublishedProjects(),
    getPublishedLegalDocument("terms"),
  ]);
  const routes = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    { path: "/work", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/approach", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.9, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    ...(terms ? [{ path: "/terms", priority: 0.3, changeFrequency: "yearly" as const }] : []),
  ];

  const publishedProjects = projects
    .filter((project) => project.detailPublished)
    .map((project) => ({
      path: `/work/${project.slug}`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    }));

  return [...routes, ...publishedProjects].map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    priority: route.priority,
    changeFrequency: route.changeFrequency,
  }));
}
