# Architecture

A deliberately small, framework-free app. All code is in `assets/app.js` (one classic script) and `assets/styles.css`.

## Files

| Path | Purpose |
|---|---|
| `index.html` | Page shell: loads the stylesheet, the QR library and `assets/app.js` |
| `assets/app.js` | The whole app. Sections are marked with `// ---------- name ----------` |
| `assets/styles.css` | Styles, `@font-face` rules, light and dark themes (CSS variables on `:root`) |
| `sw.js` | Service worker: offline use |
| `manifest.webmanifest`, `icons/` | Install as an app |
| `fonts/`, `vendor/` | Self-hosted fonts (SIL OFL) and the QR generator (MIT) |
| `vercel.json`, `_headers` | Security and caching headers |
| `tests/` | Dev server and end-to-end tests |

## Sections of `assets/app.js`

Core helpers and storage wrapper, login and accounts, game logic (players, courts, matching), session flow, modals, overlays (Live View, kiosk), views (setup, live, results, history, players), the match intro animation, backup and restore, the release basics (migration, error log, help, privacy, tour), and the second-screen Live View. Search for the marker comments to jump around.

## State

One global object `S` holds the current club's session and roster. Its persisted fields are listed in `PERSIST`. It is saved to `localStorage` after every `draw()`.

| Storage key | Contents |
|---|---|
| `sq_clubs` | Club accounts: name, salt and password hash (PBKDF2). Never the password |
| `sq_me` | The club that is logged in |
| `sq_state_<club>` | Roster, courts, Up Next, settings, undo history |
| `sq_hist_<club>` | Finished sessions (last 25) |
| `sq_life_<club>` | All-time player stats |
| `sq_bk_<club>` | Time of the last backup |
| `sq_theme`, `sq_priv_ok`, `sq_tour_*` | Preferences and "already seen" flags |
| `sq_errlog` | Last 20 errors (no personal data) |

`migrate()` repairs old or damaged saves and `scrub()` removes unsafe characters from names. Both run on every load, backup restore and second-screen update.

## Matching

`smartPick()` builds the next match. The order of rules is:

1. **Equal matches first.** Players with the fewest matches played are required; others fill the remaining spots.
2. **Mode second.** Balanced minimises the star difference between teams, Social Mix minimises repeat partners and opponents, Skill Separated minimises the star spread, Winners / Losers groups by last result.
3. **Repeats and waiting time** break ties.

Locked partners are treated as one unit. An optional rule limits matches in a row.

## Second screen

`#tv` opens a read-only Live View. It listens to the browser's `storage` event, so it works in another window of the same browser. It never writes data.

## Ideas for the future

- Replace inline `onclick` handlers with event listeners, then remove `'unsafe-inline'` from the CSP.
- Split `app.js` into modules.
- An optional server for accounts, shared Live View and phone check-in.
