import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const publicPath = z.string().regex(/^\/uploads\/.+\.(avif|webp|png|jpe?g)$/i, '이미지는 /uploads/ 아래의 지원 형식이어야 합니다.');
const published = z.boolean().default(false);
const shortTitle = z.string().min(2).max(72);
const summary = z.string().min(20).max(180);

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/*.md' }),
  schema: z.object({
    title: shortTitle,
    summary,
    client: z.string().min(1).max(80),
    homeHeadline: z.string().min(8).max(90).optional(),
    category: z.string().min(2).max(40),
    services: z.array(z.string().min(1).max(40)).min(1).max(8),
    role: z.string().min(2).max(140),
    published,
    featured: z.boolean().default(false),
    layout: z.enum(['image', 'problem', 'editorial']),
    order: z.number().int().min(0).default(100),
    cover: publicPath,
    coverAlt: z.string().min(8).max(160),
    heroImage: publicPath.optional(),
    heroAlt: z.string().min(8).max(160).optional(),
    heroPosition: z.enum(['center', 'left', 'right']).default('center'),
    displayServices: z.string().min(2).max(80).optional(),
    showcase: publicPath.optional(),
    showcaseAlt: z.string().min(8).max(160).optional(),
    showcaseStyle: z.enum(['image', 'screen', 'device']).default('image'),
    showcaseWidth: z.number().int().positive().optional(),
    showcaseHeight: z.number().int().positive().optional(),
    showcaseTone: z.enum(['paper', 'sky', 'lilac', 'ink']).default('paper'),
    gallery: z.array(z.object({
      src: publicPath,
      alt: z.string().min(8).max(160),
      caption: z.string().max(180).optional(),
    })).max(12).default([]),
    challenge: z.string().min(20).max(500),
    approach: z.string().min(20).max(700),
    outcome: z.string().min(20).max(500),
    disclosure: z.string().max(260).optional(),
    year: z.number().int().min(2000).max(2100).optional(),
  }).refine((data) => !data.showcase || !!(data.showcaseAlt && data.showcaseWidth && data.showcaseHeight), { message: '전용 이미지의 설명과 원본 가로·세로 픽셀을 함께 입력하세요.', path: ['showcase'] })
    .refine((data) => !data.heroImage || !!data.heroAlt, { message: '풀스크린 이미지의 대체 텍스트를 입력하세요.', path: ['heroAlt'] }),
});

const insights = defineCollection({
  loader: glob({ base: './src/content/insights', pattern: '**/*.md' }),
  schema: z.object({
    title: shortTitle,
    summary,
    category: z.enum(['UX/UI', 'Branding', 'Web Strategy', 'Studio Notes']),
    published,
    featured: z.boolean().default(false),
    publishedAt: z.coerce.date(),
    readingMinutes: z.number().int().min(1).max(60),
    author: z.string().min(2).max(60).default('원디자인스튜디오'),
    series: z.string().max(40).optional(),
    cover: publicPath.optional(),
    coverAlt: z.string().min(8).max(160).optional(),
    relatedWork: z.array(z.string()).max(6).default([]),
  }).refine((data) => !data.cover || !!data.coverAlt, { message: '표지가 있으면 대체 텍스트를 입력하세요.', path: ['coverAlt'] }),
});

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.md' }),
  schema: z.object({
    title: shortTitle,
    summary,
    published,
    order: z.number().int().min(0).default(100),
    timeline: z.string().min(2).max(80),
    suitedFor: z.string().min(10).max(240),
    deliverables: z.array(z.string().min(2).max(80)).min(1).max(10),
    relatedWork: z.array(z.string()).max(3).default([]),
  }),
});

const settings = defineCollection({
  loader: glob({ base: './src/content/settings', pattern: '**/*.md' }),
  schema: z.object({
    published,
    siteName: z.string().min(2).max(80),
    description: z.string().min(30).max(180),
    heroEyebrow: z.string().min(2).max(60),
    heroTitle: z.string().min(2).max(80),
    heroAccent: z.string().min(2).max(80),
    heroBody: z.string().min(20).max(220),
    contactEmail: z.email(),
    contactPhone: z.string().max(40).optional(),
    featuredWork: z.array(z.string()).max(6),
    featuredInsights: z.array(z.string()).max(6),
  }),
});

export const collections = { work, insights, services, settings };
