import { readFile, readdir, writeFile } from 'node:fs/promises';

// Pages normalizes published directory pages to a trailing slash. After
// unpublishing, intercept that old cached URL before static asset lookup and
// send it to its now-absent canonical path (which returns the site's real 404).
const redirectsUrl = new URL('../dist/_redirects', import.meta.url);
const base = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8');
const rules = [];
for (const collection of ['work', 'insights']) {
  const directory = new URL(`../src/content/${collection}/`, import.meta.url);
  for (const filename of (await readdir(directory)).filter(name => name.endsWith('.md'))) {
    const source = await readFile(new URL(filename, directory), 'utf8');
    const frontmatter = source.split('---')[1] ?? '';
    if (/^published:\s*true\s*$/m.test(frontmatter)) continue;
    const route = `/${collection}/${filename.slice(0, -3)}`;
    rules.push(`${route}/ ${route} 301`, `${route}/index.html ${route} 301`);
  }
}
await writeFile(redirectsUrl, `${base.trimEnd()}\n\n# Generated: revoke old directory URLs for unpublished content.\n${rules.join('\n')}\n`);
console.log(`Generated ${rules.length} unpublished URL redirects.`);
