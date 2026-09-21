import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCalendar, renderCalendar } from './activity.mjs';

const days = Array.from({ length: 365 }, (_, i) => ({ date: new Date(Date.UTC(2025, 8, 22) + i * 86400000).toISOString().slice(0, 10), level: i % 5 }));
const fixture = `<h2 id="js-contribution-activity-description">1,234 contributions in the last year</h2>` + days.map(d => `<td data-date="${d.date}" data-level="${d.level}"></td>`).join('');

test('parses actual public calendar markup and preserves levels', () => {
  assert.deepEqual(parseCalendar(fixture), { days, total: 1234 });
});
test('fails closed on bad responses, missing dates and duplicate cells', () => {
  assert.throws(() => parseCalendar('<html>Access denied</html>'));
  assert.throws(() => parseCalendar(fixture + '<td data-date="2025-09-22" data-level="1"></td>'));
  assert.throws(() => parseCalendar(fixture.replace('2025-10-01', '2027-10-01')));
});
test('exports accessible, self-contained motion-safe SVG in both languages', () => {
  for (const lang of ['en', 'ru']) {
    const svg = renderCalendar({ days, total: 1234 }, lang);
    assert.match(svg, /prefers-reduced-motion:reduce/);
    assert.match(svg, /1234 contributions/);
    assert.match(svg, /aria-labelledby="title desc"/);
    assert.equal((svg.match(/activity level|уровень активности/g) || []).length, 365);
    assert.doesNotMatch(svg, /<script|<foreignObject|https?:\/\/(?!www.w3.org)/);
  }
});
