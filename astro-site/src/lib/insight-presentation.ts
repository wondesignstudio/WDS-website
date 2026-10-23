import type { CollectionEntry } from 'astro:content';

// Editorial covers are independent from portfolio assets. No cover means a
// text-only article, even if the editor has attached related projects.
export function insightImage(entry: CollectionEntry<'insights'>) {
  if (!entry.data.cover) return undefined;
  return { src: entry.data.cover, alt: entry.data.coverAlt! };
}
