# Publishing checklist

1. `npm test` — green.
2. Bump `version` in `package.json`, add a CHANGELOG entry, update README if the API contract changed.
3. `npm pack --dry-run` — only `index.js`, `index.d.ts`, `README.md`, `CHANGELOG.md`, `package.json`.
4. Commit, tag `v<version>`, push: `git push main master --tags`.
5. `npm publish --access public` (needs `npm login`; 2FA may ask for an OTP).
6. `npm view @monostate/browsernative-client version`.
