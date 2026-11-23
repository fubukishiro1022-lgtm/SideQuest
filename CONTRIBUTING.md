# Contributing

Thanks for helping. SideQuest is a plain HTML, CSS and JavaScript project with no build step.

## Set up

```bash
npm install
npx playwright install chromium
npm start          # http://localhost:3000
npm test           # end-to-end tests and accessibility scans
```

## Ground rules

- **No real personal data.** Never put real names, emails or phone numbers in code, tests, screenshots or issues.
- **Keep it dependency-free at runtime.** The app must not load anything from other sites. Fonts and libraries live in `fonts/` and `vendor/`.
- **Phone first.** Check every change at 390 px wide, and with the keyboard only.
- **Add a test** for behaviour you change (see `tests/run.js`).
- **Update `CHANGELOG.md`.** When you ship a new version, also bump `APP_VER` in `assets/app.js`, `VERSION` in `sw.js` and `package.json`.

## Code layout

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
