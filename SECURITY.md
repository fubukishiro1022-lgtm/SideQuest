# Security

## Reporting a problem

Please report security issues privately rather than in a public issue. Use GitHub's "Report a vulnerability" button on the Security tab of this repository, or email the maintainer listed on the repository page. Include steps to reproduce.

## What to know

- SideQuest runs entirely in the browser. There is no server, database or account system, and the app sends nothing anywhere.
- The club password only protects the login screen on the device. Anyone who can use the same browser profile can read the stored data. Do not treat it as a security boundary.
- All names and text are escaped before they are shown. Data coming from backup files is cleaned before use.
- The Content-Security-Policy allows inline scripts (`'unsafe-inline'`) because the interface uses inline event handlers. Replacing them with event listeners would let the policy be tightened. This is on the roadmap.
