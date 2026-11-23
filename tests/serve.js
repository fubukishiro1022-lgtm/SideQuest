/* Tiny static server for local development and tests.
   It sends the same security headers as vercel.json so you test what visitors get. */
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8' };
function productionHeaders() {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
    const all = v.headers.find(h => h.source === '/(.*)');
    return Object.fromEntries(all.headers.map(h => [h.key, h.value]));
  } catch (e) { return {}; }
}
function start(port = 0) {
  const H = productionHeaders();
  const srv = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (u.endsWith('/')) u += 'index.html';
    const f = path.join(root, u);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404, { ...H, 'Content-Type': MIME['.html'] });
      return res.end(fs.readFileSync(path.join(root, '404.html')));
    }
    res.writeHead(200, { ...H, 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(port, () => r({ srv, port: srv.address().port })));
}
module.exports = { start };
if (require.main === module) {
  start(+process.env.PORT || 3000).then(({ port }) => console.log('SideQuest is running at http://localhost:' + port));
}
