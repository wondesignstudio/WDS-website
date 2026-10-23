import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

// Explicitly selected, locally inspected images only. No crop or AI edits.
const root = process.argv[2];
if (!root) throw new Error('Pass the local portfolio source directory.');
const folders = await readdir(root);
const groups = {
  'social-campaigns': { directory: 'sns 광고 이미지', exclude: ['견적서리뷰.jpg', '트래블비아-시안-1_1.jpg'] },
  'selected-identities': { directory: '로고', include: ['Logo_Mockup-디케이플랜.jpg', 'Logo_Mockup-미미애견-로고.jpg', 'Logo_Mockup-암뮤니티.jpg', 'Logo_Mockup-첨벙.jpg', '미미공방로고.jpg', '키즈차일드.jpg', '호캠-목업.jpg'] },
  'studio-goods': { directory: '굿즈' },
};
for (const [slug, config] of Object.entries(groups)) {
  const directory = path.join(root, folders.find(name => name.normalize('NFC') === config.directory));
  const files = (await readdir(directory)).filter(name => /\.(jpg|png)$/i.test(name))
    .filter(name => !config.exclude?.includes(name.normalize('NFC')))
    .filter(name => !config.include || config.include.includes(name.normalize('NFC')));
  const images = [];
  for (let index = 0; index < files.length; index++) {
    const output = `${slug}-${String(index + 1).padStart(2, '0')}.webp`;
    await sharp(path.join(directory, files[index])).rotate().resize({ width: 1920, height: 2400, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(`public/uploads/work/${output}`);
    images.push({ src: `/uploads/work/${output}`, source: files[index].normalize('NFC') });
  }
  const background = slug === 'studio-goods' ? '#171715' : '#f4f2ed';
  if (slug === 'selected-identities') {
    for (const variant of [1, 2, 3]) {
      const output = `${slug}-${String(images.length + 1).padStart(2, '0')}.webp`;
      await sharp(path.join(directory, 'LangFlash', `LangFlash-${variant}.jpg`)).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 88 }).toFile(`public/uploads/work/${output}`);
      images.push({ src: `/uploads/work/${output}`, source: `LangFlash-${variant}.jpg` });
    }
  }
  await sharp(`public${images[0].src}`).resize({ width: 1920, height: 1080, fit: 'contain', background }).flatten({ background }).webp({ quality: 88 }).toFile(`public/uploads/work/${slug}-cover.webp`);
  console.log(JSON.stringify({ slug, images }));
}
