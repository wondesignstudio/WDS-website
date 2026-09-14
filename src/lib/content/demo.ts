// Explicit opt-in, development only: never publish demo assets in production.
export function isDemoPreview() {
  return process.env.NODE_ENV === "development" && process.env.WDS_DEMO_PREVIEW === "1";
}

export function demoSvg(id: string): string | null {
  const match = /^demo-(logo|screen)-(\d)-(\d)$/.exec(id);
  if (!match) return null;
  const [, kind, project, variant] = match;
  const index = Number(project);
  const names = ["FORM / LAB", "MONO WORKS", "FIELD NOTES", "OBJECT", "NORTH", "STILL"];
  if (kind === "logo") return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180" viewBox="0 0 480 180"><text x="240" y="103" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" font-weight="700" letter-spacing="-2">${names[index % names.length]}</text><text x="240" y="141" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#777">FICTIONAL LOGO / DEMO</text></svg>`;
  const dark = index === 1;
  const bg = dark ? "#171717" : "#eeede9";
  const ink = dark ? "#fff" : "#191919";
  const panel = dark ? "#292929" : "#fff";
  const title = ["Ideas into impact.", "A clearer perspective.", "Make room to learn."][index % 3];
  const tiles = Array.from({ length: 6 }, (_, i) => {
    const x = 90 + (i % 3) * 346;
    const y = 510 + Math.floor(i / 3) * 145;
    return `<rect x="${x}" y="${y}" width="324" height="124" rx="8" fill="${panel}"/><rect x="${x + 18}" y="${y + 20}" width="68" height="68" rx="${index === 2 ? 34 : 4}" fill="${i === Number(variant) ? "#ff5c00" : dark ? "#494949" : "#d9d8d2"}"/><text x="${x + 106}" y="${y + 47}" fill="${ink}" font-family="Arial" font-size="19">${["Research", "Strategy", "Design", "Build", "Review", "Launch"][i]}</text><rect x="${x + 106}" y="${y + 66}" width="175" height="8" fill="${dark ? "#555" : "#ddd"}"/></svg-placeholder>`;
  }).join("").replaceAll("</svg-placeholder>", "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="840" viewBox="0 0 1200 840"><rect width="1200" height="840" fill="${bg}"/><text x="65" y="62" fill="${ink}" font-family="Arial" font-size="22" font-weight="700">${names[index]}</text><text x="810" y="62" fill="${ink}" font-family="Arial" font-size="16">Explore　 Studio　 Contact</text><text x="90" y="167" fill="${ink}" font-family="Arial" font-size="16" letter-spacing="3">LAYOUT PREVIEW / 0${Number(variant) + 1}</text><text x="85" y="252" fill="${ink}" font-family="Arial" font-size="64" font-weight="700" letter-spacing="-3">${title}</text><text x="90" y="302" fill="${ink}" font-family="Arial" font-size="22">A fictional interface for checking image scale and composition.</text><rect x="90" y="346" width="170" height="48" rx="24" fill="#ff5c00"/><text x="119" y="377" fill="#111" font-family="Arial" font-size="16">Explore project ↗</text><circle cx="1010" cy="340" r="95" fill="${dark ? "#444" : "#d4d3cd"}"/><circle cx="1052" cy="320" r="60" fill="${dark ? "#777" : "#aaa99f"}"/>${tiles}<text x="90" y="815" fill="${ink}" font-family="Arial" font-size="15">DEMO IMAGE — NOT ACTUAL CLIENT WORK</text></svg>`;
}
