import { getCollection, getEntry } from 'astro:content';

export async function getPublishedWork() {
  return (await getCollection('work', ({ data }) => data.published))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getPublishedInsights() {
  return (await getCollection('insights', ({ data }) => data.published))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export async function getPublishedServices() {
  return (await getCollection('services', ({ data }) => data.published))
    .sort((a, b) => a.data.order - b.data.order);
}

export async function getSiteSettings() {
  const entry = await getEntry('settings', 'site');
  if (!entry?.data.published) throw new Error('Published site settings are required.');
  return entry.data;
}

export function selectByIds<T extends { id: string }>(entries: T[], ids: string[]) {
  const rank = new Map(ids.map((id, index) => [id, index]));
  return entries.filter((entry) => rank.has(entry.id)).sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
}
