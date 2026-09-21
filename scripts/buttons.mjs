import { writeFile, mkdir } from 'node:fs/promises';

await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
for (const [id, label, color, width] of [
  ['telegram', 'Telegram', '#23ad64', 150],
  ['email', 'Email', '#efc331', 120],
  ['work', 'Selected work', '#fb7b2d', 180],
  ['work-ru', 'Проекты', '#fb7b2d', 150],
]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="44" viewBox="0 0 ${width} 44" role="img" aria-label="${label}"><title>${label}</title><rect x=".5" y=".5" width="${width - 1}" height="43" rx="5" fill="${color}" stroke="#191919"/><text x="18" y="28" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#191919">${label}</text><path d="M${width - 30} 28l12-12m-9 0h9v9" fill="none" stroke="#191919" stroke-width="1.8"/></svg>`;
  await writeFile(new URL(`../assets/${id}.svg`, import.meta.url), svg);
}
