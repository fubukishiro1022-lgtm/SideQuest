# Before you tell the public

The code is ready to deploy. These are the things only you can do.

## Name and legal
- [ ] **Check the name.** "SideQuest" is already used by other products. Search trademark databases for your country and the app-store listings, and be sure you can use it. The name lives in `BRAND` in `assets/app.js`, `index.html`, `manifest.webmanifest`, `sw.js` and the README. Change it before launch if you need to.
- [ ] **Read the privacy notice** in the app (Help → Privacy notice) and `docs/PRIVACY-TEMPLATE.md`. Adapt them to your situation. If you collect or store data on a server later, you will have obligations (in the Philippines, the Data Privacy Act). Get advice from a qualified person.
- [ ] Decide who people contact for support, and add it to the README and `SECURITY.md`.

## Testing on real devices
Only Chromium has been tested automatically. Before launch, run a real session on:
- [ ] An iPhone (Safari), including adding to the Home Screen and spoken call-outs
- [ ] An Android phone (Chrome)
- [ ] A laptop in Firefox and Safari
- [ ] The TV or screen you will use for Live View
- [ ] A session with 20 or more players and slow or no internet

## Setup
- [ ] Deploy (see `docs/DEPLOY.md`) and attach your domain.
- [ ] Confirm the response headers (for example with securityheaders.com) and that the 404 page works.
- [ ] Take a screenshot of the Home Screen icon and splash on one phone.

## For the host on the day
- [ ] Use one phone or tablet as the controller. Keep it charged and the screen awake.
- [ ] Download a backup (History → Backup) after each session. Safari can clear saved data after about a week of not visiting the site.
- [ ] Tell players their names are stored on that device, and how to ask for them to be removed (Players page → open a player → Remove).
