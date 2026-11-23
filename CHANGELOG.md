# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/).

## 1.0.0

First public release.

### Sessions
- Check-in page before a session starts, with search, import by pasting a list, and star levels (Beginner to Pro).
- Four matching modes (Balanced, Social Mix, Skill Separated, Winners / Losers), all giving players an equal number of matches, with repeat-matchup avoidance, locked partners, rest, singles and an optional limit on matches in a row.
- Live courts, one Up Next, send to court, call players (spoken), edit lineups, undo (results, cancel, remove).
- Optional live scoring with play-to targets and a match time limit with warnings.
- Match intro animation, a full-screen Live View for a TV, and a check-in kiosk.

### Data
- Everything is stored in the browser. Session survives refresh and is repaired if saved data is damaged.
- History with a results page and CSV export, all-time player stats with star suggestions, and backup / restore as a file.

### Quality
- Works offline once opened (service worker) and installs as an app (web manifest).
- Fonts and the QR code library are bundled. The page makes no requests to other sites.
- Strict Content-Security-Policy and security headers, escaping of all names, accessibility scans clean (WCAG 2.1 AA rules).
- Privacy notice, in-app help and guided tour, problem report with no personal data, and a "delete all data" button.
