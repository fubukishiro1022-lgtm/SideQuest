/* End-to-end tests (Playwright + axe-core). Run with: npm test */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const { start } = require('./serve');
const ROOT = path.resolve(__dirname, '..');
let bad = 0;
const ck = (label, ok) => { if (!ok) bad++; console.log((ok ? 'PASS ' : 'FAIL ') + label); };
const SEEN = { sq_priv_ok: '1', sq_tour_setup: '1', sq_tour_live: '1' };
const club = (slug = 'test-club', extra = {}) => ({ ...SEEN, sq_me: JSON.stringify(slug), sq_clubs: JSON.stringify({ [slug]: { name: 'Test Club', email: '', h: 'x', salt: 's', alg: 'p2', ...extra } }) });

(async () => {
  const { srv, port } = await start(0);
  const URL = 'http://localhost:' + port + '/';
  const browser = await chromium.launch();
  async function open(opts = {}) {
    const { hash = '', vp = { width: 1280, height: 800 }, pre = null } = opts;
    const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
    const pg = await ctx.newPage();
    const errs = [], external = [], csp = [];
    pg.on('pageerror', e => errs.push(e.message));
    pg.on('console', m => { if (/Content Security Policy/i.test(m.text())) csp.push(m.text()); });
    pg.on('request', r => { if (!r.url().startsWith(URL) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
    await pg.addInitScript(pre => {
      window.__clip = [];
      try { Object.defineProperty(navigator, 'clipboard', { value: { writeText: async t => { window.__clip.push(t); } }, configurable: true }); } catch (e) {}
      if (pre && !localStorage.getItem('__pre')) { for (const [k, v] of Object.entries(pre)) localStorage.setItem(k, v); localStorage.setItem('__pre', '1'); }
    }, pre);
    await pg.goto(URL + hash);
    await pg.waitForTimeout(500);
    return { ctx, pg, errs, external, csp, E: (f, a) => pg.evaluate(f, a) };
  }
  const scan = async (P, label) => {
    await P.pg.addScriptTag({ content: axeSrc });
    await P.pg.waitForTimeout(1500);
    const r = await P.E(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })).violations.map(v => v.id));
    ck('accessibility scan clean: ' + label + (r.length ? ' (' + r + ')' : ''), r.length === 0);
  };

  console.log('--- project files');
  const need = ['index.html', 'assets/app.js', 'assets/styles.css', 'manifest.webmanifest', 'sw.js', 'vercel.json', '404.html', 'robots.txt', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'vendor/qrcode.js', 'README.md', 'LICENSE', 'package.json'];
  ck('all required files exist', need.every(f => fs.existsSync(path.join(ROOT, f))));
  const man = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ck('manifest icons all exist', man.icons.every(i => fs.existsSync(path.join(ROOT, i.src))));
  ck('vercel.json is valid and has a CSP', !!JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).headers[0].headers.find(h => h.key === 'Content-Security-Policy'));
  const code = ['index.html', 'assets/app.js', 'assets/styles.css', 'sw.js'].map(f => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
  ck('no sample names or leftover demo data in the code', !/Kyle|Tomas|Yves|Migo|Mika Cruz|BGC|Paddle|sidequest123|sidequest\.app|PickleQ|KortOS/.test(code));
  ck('no claude.ai-only code left', !/claude\.use|window\.claude|cdnjs|googleapis|gstatic/.test(code));

  console.log('--- a brand-new visitor');
  let P = await open();
  ck('login screen: no overstated features, no seeded account', await P.E(() => { const t = document.querySelector('#root').textContent; return t.includes('Create your club') && !/payments|analytics|bookings/i.test(t) && Object.keys(clubs).length === 0; }));
  ck('there is no email field and no fake password reset', await P.E(() => !document.querySelector('#ae') && !document.querySelector('#root').textContent.includes('Recovery')));
  await P.E(() => { am = 'old'; auth(); });
  await P.pg.click('text=Forgot password?');
  ck('"Forgot password?" is honest (no email is sent)', await P.E(() => document.querySelector('.md').textContent.includes('can’t be emailed')));
  await P.E(() => closeM());
  await P.pg.click('text=Try the demo'); await P.pg.waitForTimeout(500);
  ck('demo mode: banner, privacy notice first', await P.E(() => me === 'demo-club' && !!document.querySelector('.demobar') && document.querySelector('.md').textContent.includes('Privacy notice')));
  ck('privacy notice says nothing leaves the device', await P.E(() => document.querySelector('.md').textContent.includes('Nothing is sent to a server')));
  await P.pg.click('text=I understand'); await P.pg.waitForTimeout(900);
  ck('guided tour starts (3 steps) with the spotlight on screen', await P.E(() => { const t = document.querySelector('#tour'); return !!t && t.textContent.includes('STEP 1 OF 3') && t.querySelector('.tspot').getBoundingClientRect().width > 50; }));
  await P.pg.keyboard.press('Escape'); await P.pg.waitForTimeout(150);
  await P.pg.reload(); await P.pg.waitForTimeout(600);
  ck('no notice or tour again after a reload', await P.E(() => !document.querySelector('#tour') && !(document.querySelector('#mdl') && document.querySelector('#mdl').innerHTML)));
  await P.E(() => { document.documentElement.dataset.theme = 'light'; ls.set('sq_theme', 'light'); });
  await P.pg.reload(); await P.pg.waitForTimeout(500);
  ck('theme choice is remembered', await P.E(() => document.documentElement.dataset.theme === 'light'));
  ck('no requests left this site, and no CSP violations', P.external.length === 0 && P.csp.length === 0);

  console.log('--- creating a club');
  P = await open({ hash: '#club-the-court-crew' });
  ck('a club link pre-fills the login', await P.E(() => am === 'old' && document.querySelector('#as').value === 'the-court-crew'));
  await P.E(() => { am = 'new'; auth(); });
  await P.E(() => { $('#an').value = 'Court Crew'; $('#as').value = 'court-crew'; $('#ap').value = 'a-long-password-1'; return go(); });
  await P.pg.waitForTimeout(600);
  ck('club created with just a name, link and password', await P.E(() => me === 'court-crew' && clubs['court-crew'].alg === 'p2' && clubs['court-crew'].h.length === 64 && !JSON.stringify(clubs).includes('a-long-password-1')));
  await P.E(() => { closeM(); const t = document.querySelector('#tour'); if (t) t.remove(); });
  await P.E(() => { am = 'old'; out(); });
  await P.E(() => { $('#as').value = 'court-crew'; $('#ap').value = 'wrong-password'; return go(); });
  ck('wrong password refused', await P.E(() => me === null && $('#e-p').textContent.includes('Wrong password')));
  await P.E(() => { $('#ap').value = 'a-long-password-1'; return go(); }); await P.pg.waitForTimeout(500);
  ck('right password logs in', await P.E(() => me === 'court-crew'));

  console.log('--- links, security, damaged data');
  const K = await open({ pre: club() });
  await K.E(() => { clubs['test-club'].name = '<img src=x onerror="window.__xss=1">Evil'; S.ov = 'kiosk'; draw(); }); await K.pg.waitForTimeout(250);
  ck('a malicious club name is shown as text (kiosk)', await K.E(() => !document.querySelector('#ovl img') && !window.__xss && document.querySelector('#ovl').textContent.includes('<img')));
  await K.E(() => { S.ov = null; draw(); }); await K.pg.click('.chip button');
  ck('copy-link copies the real page address', await K.E(() => window.__clip.at(-1) === baseUrl() + '#club-test-club'));
  await K.E(() => qrM()); await K.pg.waitForTimeout(250);
  ck('QR code is drawn locally (no library from the internet)', await K.E(() => !!document.querySelector('#qr svg') && document.querySelector('.md .mono').textContent === baseUrl() + '#kiosk'));
  await K.E(() => closeM());
  const old = { pl: [{ id: 0, n: 'Old A', r: 3, st: 'play' }, { id: 1, n: 'Old B', st: 'weird' }, { id: 2, n: 'Old C', r: 4, st: 'in', pr: 99 }], courts: [{ m: { a: [0, 1], b: [2, 77], t: 1 } }], un: [{ m: { a: [5], b: [6] }, pin: true }], phase: 'nonsense', id: 0 };
  const D = await open({ pre: { ...club(), 'sq_state_test-club': JSON.stringify(old) } });
  const rep = await D.E(() => ({ phase: S.phase, pl: S.pl.map(p => [p.st, p.pr, p.g]), c: S.courts.map(c => c.m), u: S.un.map(u => u.m) }));
  ck('an old or damaged save loads and is repaired', D.errs.length === 0 && rep.phase === 'setup' && rep.pl[0][0] === 'in' && rep.pl[1][0] === 'out' && rep.pl[2][1] === null && rep.c.every(m => m === null) && rep.u.every(m => m === null));
  await D.E(() => { add('Private Person', 3, false); draw(); setTimeout(() => { throw new Error('boom test 123'); }, 0); }); await D.pg.waitForTimeout(300);
  await D.E(() => diagM()); await D.pg.waitForTimeout(200);
  const dg = await D.E(() => document.querySelector('#dgt').value);
  ck('problem report has version + error but no player names', dg.includes('1.0.0') && dg.includes('boom test 123') && !dg.includes('Private Person'));
  await D.E(() => closeM());
  await D.pg.click('nav.side button:has-text("Help")'); await D.pg.waitForTimeout(250);
  ck('Help dialog is there', await D.E(() => document.querySelectorAll('.md details').length >= 7 && !document.querySelector('.md').textContent.includes('pilot')));
  await D.pg.click('.md .btn:has-text("Delete all data")'); await D.pg.waitForTimeout(200);
  await D.pg.fill('#wpc', 'nope'); await D.pg.click('.md .btn.rd');
  ck('delete-everything needs the club link name typed in', await D.E(() => me === 'test-club'));
  await D.pg.fill('#wpc', 'test-club'); await D.pg.click('.md .btn.rd'); await D.pg.waitForTimeout(450);
  ck('delete removes everything and returns to login', await D.E(() => me === null && !('test-club' in clubs) && Object.keys(localStorage).filter(k => k.includes('test-club')).length === 0));

  console.log('--- running a session');
  const C = await open({ pre: club() });
  await C.E(() => { S.sound = false; S.anim = false; S.scores = true; ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].forEach((n, i) => { const p = add(n, [3, 4, 2, 5, 1, 3][i], false); checkIn(p.id); }); startS(); sendUN(0); const i = S.courts.findIndex(c => c.m); scAdj(i, 'a', 11); scAdj(i, 'b', 6); });
  ck('live scoring shows a confirm button at 11–6', await C.E(() => document.querySelector('.cc.on').textContent.includes('wins 11–6')));
  await C.pg.click('.cc.on .btn:has-text("confirm")'); await C.pg.waitForTimeout(250);
  ck('result recorded with points', await C.E(() => S.pl.filter(p => p.g == 1).length == 4 && S.pl.some(p => p.pf == 11)));
  await C.E(() => undoLast());
  ck('undo restores the match', await C.E(() => S.pl.every(p => p.g == 0) && S.courts.some(c => c.m)));
  await C.E(() => { done(S.courts.findIndex(c => c.m), 'a', 11, 6); endGo(); closeM(); });
  await C.pg.click('.nv[data-t="History"]'); await C.pg.waitForTimeout(250);
  ck('history lists the finished session', await C.E(() => document.querySelectorAll('.hrow').length == 1));
  const [bk] = await Promise.all([C.pg.waitForEvent('download'), C.pg.click('text=Download backup')]);
  const bkJson = JSON.parse(fs.readFileSync(await bk.path(), 'utf8'));
  ck('backup downloads as a real file and holds the roster', /^sidequest-backup-.*\.json$/.test(bk.suggestedFilename()) && bkJson.state.pl.length === 6 && bkJson.history.length === 1);
  await C.pg.click('.hrow'); await C.pg.waitForTimeout(250);
  const [csv] = await Promise.all([C.pg.waitForEvent('download'), C.pg.click('text=Export results (CSV)')]);
  const csvText = fs.readFileSync(await csv.path(), 'utf8');
  ck('results download as a CSV', csv.suggestedFilename().endsWith('.csv') && csvText.includes('Player') && csvText.includes('Points for'));
  await C.pg.click('.nv[data-t="Players"]'); await C.pg.waitForTimeout(250);
  ck('Players page shows all-time stats', await C.E(() => document.querySelectorAll('.prow').length == 6));
  await C.E(() => { tab = 'Queue'; draw(); });
  await C.E(() => { const t = document.querySelector('#tour'); if (t) t.remove(); });

  console.log('--- offline use');
  const O = await open();
  await O.E(() => navigator.serviceWorker.ready.then(() => true)); await O.pg.waitForTimeout(1500);
  await O.ctx.setOffline(true);
  await O.pg.reload(); await O.pg.waitForTimeout(800);
  ck('the app opens with no internet connection', await O.E(() => document.querySelector('#root').textContent.includes('Create your club')));
  await O.ctx.setOffline(false);

  console.log('--- accessibility');
  for (const [label, fn] of [['login screen', null], ['help dialog', () => helpM()], ['privacy dialog', () => privacyM(true)]]) { const A = await open(); if (fn) await A.E(fn); await scan(A, label); }
  const L = await open({ pre: club() });
  await L.E(() => { S.sound = false; S.anim = false; ['A', 'B', 'C', 'D', 'E'].forEach(n => { const p = add(n, 3, false); checkIn(p.id); }); startS(); });
  await scan(L, 'live session');
  ck('no runtime errors on any page', [P, K, C, L].every(x => x.errs.length === 0));

  await browser.close(); srv.close();
  console.log(bad ? '\n' + bad + ' FAILED' : '\nALL PASSED');
  process.exit(bad ? 1 : 0);
})();
