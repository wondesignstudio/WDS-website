import { access, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../dist/', import.meta.url);
const required = [
  'index.html',
  'work/index.html',
  'work/school-sync/index.html',
  'insights/index.html',
  'insights/before-redesign/index.html',
  '_redirects',
  'contact/index.html',
  'search-index.json',
  'sitemap-index.xml',
];

await Promise.all(required.map((path) => access(new URL(path, root))));

const unpublishedRoutes = [];
for (const collection of ['work', 'insights']) {
  const directory = new URL(`../src/content/${collection}/`, import.meta.url);
  for (const name of (await readdir(directory)).filter((file) => file.endsWith('.md'))) {
    const source = await readFile(new URL(name, directory), 'utf8');
    const frontmatter = source.split('---')[1] ?? '';
    if (!/^published:\s*true\s*$/m.test(frontmatter)) unpublishedRoutes.push(`/${collection}/${name.replace(/\.md$/, '')}`);
  }
}
const forbidden = unpublishedRoutes.map((route) => `${route.slice(1)}/index.html`);
forbidden.push('journal/index.html', 'lab/index.html');
for (const path of forbidden) {
  try { await access(new URL(path, root)); throw new Error(`Unpublished route was built: ${path}`); }
  catch (error) { if (String(error).includes('Unpublished route')) throw error; }
}

const search = JSON.parse(await readFile(new URL('search-index.json', root), 'utf8'));
const leaked = search.some((item) => unpublishedRoutes.includes(`/${item.type}/${item.slug}`.replace(/\/$/, '')));
if (leaked) throw new Error('Unpublished content leaked into search-index.json');
if (search.some(item => !['work', 'insights'].includes(item.type))) throw new Error('Retired collection in search index');
const cms = await readFile(new URL('../../.pages.yml', import.meta.url), 'utf8');
if (/name: (journal|lab)\b|featuredJournal|featuredLab|collection: (journal|lab)\b/.test(cms)) throw new Error('Retired CMS collection remains');
if (!cms.includes('name: insights') || !cms.includes('name: featuredInsights')) throw new Error('Insights CMS configuration missing');
const insightDir = new URL('../src/content/insights/', import.meta.url);
for (const name of (await readdir(insightDir)).filter(file => file.endsWith('.md'))) {
  const source = await readFile(new URL(name, insightDir), 'utf8');
  const cover = source.match(/^cover:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1]?.trim();
  if (!cover) continue;
  const {width,height} = await sharp(fileURLToPath(new URL(`../public${cover}`,import.meta.url))).metadata();
  if (!width || !height || width < 1200 || Math.abs(width/height-1.6) > .05) throw new Error(`Insight cover must be 1200px+ and 16:10: ${cover}`);
}

const workFiles = await readdir(new URL('work/', root));
if (workFiles.length < 5) throw new Error('Expected published work routes were not generated.');

const workContentDirectory = new URL('../src/content/work/', import.meta.url);
const workContentFiles = (await readdir(workContentDirectory)).filter((name) => name.endsWith('.md'));
const coverPaths = new Set();
for (const filename of workContentFiles) {
  const source = await readFile(new URL(filename, workContentDirectory), 'utf8');
  const cover = source.match(/^cover:\s*["']?([^"'\n]+)["']?\s*$/m)?.[1];
  if (cover) coverPaths.add(cover.trim());
}

for (const coverPath of coverPaths) {
  const imageUrl = new URL(`../public${coverPath}`, import.meta.url);
  const { width, height } = await sharp(fileURLToPath(imageUrl)).metadata();
  const ratio = width && height ? width / height : 0;
  if (!width || !height || width < 1600 || height < 900 || ratio < 1.7 || ratio > 1.85) {
    throw new Error(`Cover image must be at least 1600x900 and approximately 16:9: ${coverPath} (${width}x${height})`);
  }
}

console.log(`Validated ${required.length} required outputs, unpublished filtering, ${search.length} search entries, and ${coverPaths.size} cover images.`);

// Validate every generated page, including new service-to-project recommendations.
async function outputFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? outputFiles(new URL(`${entry.name}/`, directory), `${prefix}${entry.name}/`)
    : [`${prefix}${entry.name}`]));
  return nested.flat();
}
const htmlFiles = (await outputFiles(root)).filter((path) => path.endsWith('.html'));
let internalLinks = 0;
for (const path of htmlFiles) {
  const html = await readFile(new URL(path, root), 'utf8');
  if (unpublishedRoutes.some((route) => html.includes(route))) {
    throw new Error(`Unpublished content leaked into ${path}`);
  }
  if (/href="\/(journal|lab)(\/|")/.test(html)) throw new Error(`Retired navigation in ${path}`);
  for (const match of html.matchAll(/href="(\/(?!\/)[^"]*)"/g)) {
    const pathname = decodeURIComponent(match[1].split(/[?#]/)[0]).replace(/^\//, '');
    const target = /\.[a-z0-9]+$/i.test(pathname) ? pathname : `${pathname.replace(/\/$/, '')}${pathname ? '/' : ''}index.html`;
    await access(new URL(target, root)).catch(() => { throw new Error(`Broken local link in ${path}: ${match[1]}`); });
    const fragment = match[1].split('#')[1];
    if (fragment && target.endsWith('.html')) {
      const targetHtml = await readFile(new URL(target, root), 'utf8');
      if (!targetHtml.includes(`id="${decodeURIComponent(fragment)}"`)) throw new Error(`Missing anchor in ${path}: ${match[1]}`);
    }
    internalLinks++;
  }
}
const homeHtml = await readFile(new URL('index.html', root), 'utf8');
// The feed is scoped to Insights: home retains its existing row layout.
if (homeHtml.includes('class="insight-feed"') || homeHtml.includes('class="feed-card')) throw new Error('Insights feed leaked into the home page');
if (/<img\b[^>]*src="\/uploads\/editorial\//.test(homeHtml)) throw new Error('Editorial covers must not change the home text rows');
const feedHtml = await readFile(new URL('insights/index.html', root), 'utf8');
const feedLinks = [...feedHtml.matchAll(/class="feed-card-link" href="([^"]+)"/g)].map(match => match[1]);
if (new Set(feedLinks).size !== feedLinks.length) throw new Error('Duplicate article in Insights feed');
if (feedLinks.length !== search.filter(item => item.type === 'insights').length) throw new Error('Published article missing from Insights feed');
for (const path of htmlFiles.filter(path => path.startsWith('insights/') && path !== 'insights/index.html')) {
  const html = await readFile(new URL(path, root), 'utf8');
  if (!html.includes('class="reader-body"')) throw new Error(`Missing reading layout: ${path}`);
  for (const [,fragment] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${decodeURIComponent(fragment)}"`)) throw new Error(`Broken article contents link: ${path}#${fragment}`);
  }
}
// Images and icon requests are not covered by href checks above.
for (const path of htmlFiles) {
  const html = await readFile(new URL(path, root), 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*\bsrc="(\/(?!\/)[^"]+)"/g)) {
    if (path.startsWith('insights/') && coverPaths.has(match[1])) {
      throw new Error(`Project cover reused as editorial image in ${path}: ${match[1]}`);
    }
    await access(new URL(match[1].slice(1), root)).catch(() => {
      throw new Error(`Missing image in ${path}: ${match[1]}`);
    });
  }
}
if (homeHtml.includes('data-hero')) {
  if (!homeHtml.includes('data-work-reveal') || !homeHtml.includes('fetchpriority="high"')) throw new Error('Immersive home structure missing');
  if (homeHtml.includes('generated_images')) throw new Error('Generated concept image must not ship');
}
for (const filename of workContentFiles) {
  const source = await readFile(new URL(filename, workContentDirectory), 'utf8');
  const hero = source.match(/^heroImage:\s*(\/[^\n]+)$/m)?.[1]?.trim();
  if (!hero) continue;
  if (!/^heroAlt:\s*\S.+$/m.test(source)) throw new Error(`Missing hero alt: ${filename}`);
  const { width, height } = await sharp(fileURLToPath(new URL(`../public${hero}`, import.meta.url))).metadata();
  if (!width || !height || width < 1600 || height < 900) throw new Error(`Hero needs a high-resolution original: ${hero}`);
}
for (const path of (await outputFiles(root)).filter((file) => file.endsWith('.xml'))) {
  const xml = await readFile(new URL(path, root), 'utf8');
  if (unpublishedRoutes.some((route) => xml.includes(route))) throw new Error(`Unpublished route leaked into ${path}`);
  if (/wondesign\.studio\/(journal|lab)(\/|<)/.test(xml)) throw new Error(`Retired route in ${path}`);
}
const redirects = await readFile(new URL('_redirects', root),'utf8');
for (const [from, to] of [['/approach', '/about'], ['/work/timeattack', '/work/time-attack'], ['/work/marketing-catnip', '/work'], ['/work/questboard', '/work']]) {
  for (const suffix of ['', '/']) {
    if (!redirects.split('\n').includes(`${from}${suffix} ${to} 301`)) throw new Error(`Missing legacy redirect: ${from}${suffix}`);
  }
}
const headers = await readFile(new URL('_headers', root), 'utf8');
for (const path of ['/insights', '/insights/*', '/work*', '/search-index.json', '/sitemap*.xml']) {
  const block = headers.split(/\n\s*\n/).find(block => block.split('\n').includes(path));
  if (!block?.includes('Cache-Control: no-store') || !block.includes('CDN-Cache-Control: no-store')) throw new Error(`Missing publication cache protection: ${path}`);
}
for (const line of redirects.split('\n').filter(line => line.startsWith('/'))) {
  const [,to,status] = line.split(/\s+/);
  if(status !== '301') throw new Error('Migration redirect must be permanent');
  await access(new URL(`${to.slice(1)}/index.html`,root));
}
if (/class="hero-nav|class="hero-signature|class="work-stage/.test(homeHtml)) throw new Error('Superseded Agentic layout remains in home output');
console.log(`Validated ${htmlFiles.length} HTML pages and ${internalLinks} local links; unpublished recommendations are excluded.`);
