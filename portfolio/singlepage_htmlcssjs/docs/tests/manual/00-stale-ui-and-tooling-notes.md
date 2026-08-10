# Stale UI and tooling notes

## Seeing the old website?

The static server must be running from the portfolio folder:

```bash
cd portfolio/singlepage_htmlcssjs
npm run serve
# open http://127.0.0.1:4173
```

Do **not** rely on `file://` opens for ES modules + service worker.

### Clear stale service worker cache

1. Open DevTools → Application → Service Workers → **Unregister**.
2. Application → Cache Storage → delete `vrb-portfolio-v1` / `v2` if present.
3. Hard refresh (Ctrl+Shift+R).

`sw.js` now uses cache name `vrb-portfolio-v3` and **network-first** for HTML/JS so resume content updates appear without sticking on the old shell.

## Playwright MCP status (this session)

- No Playwright MCP server was registered in Cursor.
- `cursor-ide-browser` was listed but exposed **no callable tools**.
- Playwright CLI Chromium failed with: `error while loading shared libraries: libnspr4.so`.

Workaround used for verification: live HTTP checks + Vitest jsdom e2e + source/resume review. Two isolated verification agents were launched (`best-of-n-runner` worktrees) with instructions to write the same report paths; parent authored the reports from evidence when Chromium could not launch.

## Related reports

- [verification-engineer-a-resume-content.md](./verification-engineer-a-resume-content.md)
- [verification-engineer-b-ux-requirements.md](./verification-engineer-b-ux-requirements.md)
