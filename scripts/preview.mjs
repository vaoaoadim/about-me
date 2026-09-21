import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
await mkdir(path.join(root, '.preview'), { recursive: true });
for (const lang of ['en', 'ru']) {
  const name = lang === 'en' ? 'README.md' : 'README.ru.md';
  const text = await readFile(path.join(root, name), 'utf8');
  let html = execFileSync('gh', ['api', 'markdown', '--input', '-'], { input: JSON.stringify({ text, mode: 'gfm' }), encoding: 'utf8' });
  html = html.replaceAll('https://raw.githubusercontent.com/vaoaoadim/vaoaoadim/activity/', '/generated/').replaceAll('src="assets/', 'src="/assets/');
  // A local approximation for responsive checks; the live GitHub page is checked separately.
  await writeFile(path.join(root, '.preview', `${lang}.html`), `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>v.build profile preview</title><style>body{margin:0;background:#f6f8fa;color:#1f2328;font:16px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}main{box-sizing:border-box;max-width:900px;margin:24px auto;padding:32px;background:white;border:1px solid #d1d9e0;border-radius:6px}img{max-width:100%;height:auto}a img[height]{height:44px;width:auto}a{color:#0969da;text-decoration:none}h1,h2{border-bottom:1px solid #d1d9e0;padding-bottom:.3em}h1{font-size:2em}h2{font-size:1.5em;margin-top:28px}h3{font-size:1.25em}p{margin:16px 0}summary{cursor:pointer}sub{font-size:12px}hr{border:0;height:1px;background:#d1d9e0}@media(max-width:600px){main{margin:0;padding:16px;border:0;border-radius:0}h1{font-size:26px}}</style><main>${html}</main></html>`);
}
if (!process.argv.includes('--export-only')) createServer(async (req, res) => {
  const route = req.url === '/' ? '/.preview/en.html' : req.url.split('?')[0];
  const file = path.resolve(root, '.' + decodeURIComponent(route));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const data = await readFile(file);
    const type = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(file)] || 'text/plain';
    res.writeHead(200, { 'Content-Type': type }); res.end(data);
  } catch { res.writeHead(404).end(); }
}).listen(4318, '127.0.0.1', () => console.log('Profile preview: http://127.0.0.1:4318'));
