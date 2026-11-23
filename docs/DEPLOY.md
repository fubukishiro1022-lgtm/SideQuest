# Deploying SideQuest

SideQuest is a static site. There is no build step and no server code: the repository root is the website.

For organizer accounts and shared player queue links, configure the optional Supabase project first using [the Supabase setup guide](SUPABASE-SETUP.md). The site remains statically hosted; Supabase provides its authentication and database.

## Vercel (recommended)

1. Push this folder to a new GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository.
3. Set **Framework Preset** to **Other**. Leave **Build Command** and **Install Command** empty, and set **Output Directory** to `.` (the repository root).
4. Deploy. `vercel.json` adds the security headers and caching rules automatically.
5. Optional: add your own domain under **Settings → Domains**.

From the command line instead: `npx vercel` (preview) and `npx vercel --prod`.

## Netlify or Cloudflare Pages

Publish the repository root with no build command. The `_headers` file contains the same security and caching headers.

## GitHub Pages

Settings → Pages → deploy from the `main` branch, root folder. Everything works because all paths are relative. GitHub Pages cannot send custom headers, so the Content-Security-Policy from `vercel.json` will not be applied there.

## After deploying: quick check

- Open the site on a phone and a laptop. Install it (browser menu → Add to Home Screen / Install).
- Turn on airplane mode and reload. It should still open.
- Create a club, run a short session, end it, and download a backup.
- Visit a made-up address such as `/nope`. You should see the 404 page.

## Releasing a new version

1. Update `CHANGELOG.md`.
2. Bump the version in `package.json`, `APP_VER` in `assets/app.js` and `VERSION` in `sw.js`. Changing `VERSION` makes installed copies refresh.
3. Run `npm test`, commit, and push. Vercel deploys automatically.
