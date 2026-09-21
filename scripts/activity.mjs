import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const COLORS = ['#ebedf0', '#b8e4c8', '#72cd96', '#23ad64', '#147441'];
const DAY = 86400000;

export function parseCalendar(html) {
  const days = [...html.matchAll(/<td\b[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"[^>]*>/g)]
    .map(([, date, level]) => ({ date, level: Number(level) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const heading = html.match(/id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const total = Number(heading?.match(/([\d,]+)\s+contributions?\b/)?.[1]?.replaceAll(',', ''));
  if (days.length < 350 || days.length > 371 || new Set(days.map(d => d.date)).size !== days.length || !Number.isSafeInteger(total)) {
    throw new Error('GitHub public calendar format changed; keeping the last valid graphic.');
  }
  days.forEach((d, i) => {
    if (Number.isNaN(Date.parse(d.date)) || (i && Date.parse(d.date) - Date.parse(days[i - 1].date) !== DAY)) {
      throw new Error('Calendar dates are invalid or not consecutive.');
    }
  });
  return { days, total };
}

export function renderCalendar({ days, total }, lang = 'en') {
  const ru = lang === 'ru';
  const first = Date.parse(days[0].date);
  const sunday = first - new Date(first).getUTCDay() * DAY;
  const last = days.at(-1).date;
  const weeks = Math.ceil((Date.parse(last) - sunday + DAY) / (7 * DAY));
  const step = 14;
  const left = 26;
  const gridY = 84;
  const width = weeks * step + left * 2;
  const title = ru ? 'ПУБЛИЧНАЯ АКТИВНОСТЬ / 12 МЕСЯЦЕВ' : 'PUBLIC ACTIVITY / LAST 12 MONTHS';
  const subtitle = ru ? `${total} contributions · обновлено ${last}` : `${total} contributions · updated ${last}`;
  const rects = days.map(({ date, level }) => {
    const offset = (Date.parse(date) - sunday) / DAY;
    return `<rect x="${left + Math.floor(offset / 7) * step}" y="${gridY + offset % 7 * step}" width="10" height="10" rx="2" fill="${COLORS[level]}"><title>${date}: ${ru ? 'уровень активности' : 'activity level'} ${level}/4</title></rect>`;
  }).join('');
  const endX = (weeks - 1) * step;
  const months = days.filter((d, i) => i === 0 || d.date.slice(8) === '01').map(d => {
    const x = left + Math.floor((Date.parse(d.date) - sunday) / DAY / 7) * step;
    const label = new Date(d.date).toLocaleDateString(ru ? 'ru' : 'en', { month: 'short', timeZone: 'UTC' });
    return `<text x="${x}" y="72" class="label">${label}</text>`;
  }).join('');
  // A moving frame does not change the cells or suggest additional activity.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="222" viewBox="0 0 ${width} 222" role="img" aria-labelledby="title desc">
<title id="title">${title}</title><desc id="desc">${subtitle}. ${days[0].date} — ${last}. ${ru ? 'Источник: публичный календарь GitHub.' : 'Source: public GitHub calendar.'}</desc>
<style>text{font-family:Arial,sans-serif;fill:#191919}.label{font-size:10px;fill:#555}.scanner{animation:scan 24s linear infinite alternate}@keyframes scan{from{transform:translateX(0)}to{transform:translateX(${endX}px)}}@media(prefers-reduced-motion:reduce){.scanner{animation:none;transform:translateX(${endX}px)}}</style>
<rect width="100%" height="100%" rx="12" fill="#fff"/><text x="26" y="28" font-size="13" font-weight="700">${title}</text><text x="26" y="48" font-size="12">${subtitle}</text>${months}${rects}
<g class="scanner" fill="none" stroke-width="2"><path d="M29 80h-7v102h7" stroke="#efc331"/><path d="M33 80h7v102h-7" stroke="#ef4c46"/></g>
<text x="26" y="207" class="label">${days[0].date} — ${last}</text><text x="${width - 174}" y="207" class="label">${ru ? 'Меньше' : 'Less'}</text>${COLORS.map((color, i) => `<rect x="${width - 127 + i * 14}" y="198" width="10" height="10" rx="2" fill="${color}"/>`).join('')}<text x="${width - 48}" y="207" class="label">${ru ? 'Больше' : 'More'}</text></svg>`;
}

export async function main() {
  // Never send credentials: the graphic must only reveal what a signed-out visitor sees.
  const response = await fetch('https://github.com/users/vaoaoadim/contributions', {
    headers: { 'User-Agent': 'v-build-public-profile', 'Accept-Language': 'en' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Public calendar returned HTTP ${response.status}`);
  const calendar = parseCalendar(await response.text());
  const directory = new URL('../generated/', import.meta.url);
  await mkdir(directory, { recursive: true });
  await Promise.all(['en', 'ru'].map(lang => writeFile(new URL(lang === 'en' ? 'activity.svg' : 'activity-ru.svg', directory), renderCalendar(calendar, lang))));
  console.log(`Generated ${calendar.days.length} public dates; ${calendar.total} contributions; no private API access.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
