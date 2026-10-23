import type { APIRoute } from 'astro';
import { getPublishedInsights, getPublishedWork } from '../lib/content';

export const GET: APIRoute = async () => {
  const [work, insights] = await Promise.all([getPublishedWork(), getPublishedInsights()]);
  const payload = [
    ...work.map((entry) => ({ type: 'work', slug: entry.id, title: entry.data.title, summary: entry.data.summary })),
    ...insights.map((entry) => ({ type: 'insights', slug: entry.id, title: entry.data.title, summary: entry.data.summary })),
  ];
  return new Response(JSON.stringify(payload), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
