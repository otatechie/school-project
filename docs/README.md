# Documentation

| Document | For whom | Covers |
|---|---|---|
| [USER-GUIDE.md](USER-GUIDE.md) | Finance officers, approvers, administrators | Signing in, the voucher lifecycle, roles, approving and paying, the ledger, memos, reports, administration, FAQ |
| [TECHNICAL.md](TECHNICAL.md) | Developers | Stack, setup, data model, authorization, services, AI features, routes, frontend conventions, testing, known gaps |
| [MVP-GUIDE.md](MVP-GUIDE.md) | Both | The original condensed overview |

## Formats

Markdown is the source of truth. Rendered copies are generated from it:

- `docs/pdf/` — print-ready A4 PDFs
- `docs/html/` — self-contained HTML (no external assets)

## Rebuilding

Edit the Markdown, then:

```bash
./docs/build.sh
```

Requires `node` and Google Chrome (run headless to print the PDFs). If Chrome
lives elsewhere, pass its path:

```bash
CHROME="/path/to/chrome" ./docs/build.sh
```

Never edit files in `docs/html/` or `docs/pdf/` — the next build overwrites them.
