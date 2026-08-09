# Documentation

| Document | Audience | Covers |
|---|---|---|
| [USER-GUIDE.md](USER-GUIDE.md) | Office staff | How to prepare, approve, pay and record a voucher, in plain language |
| [PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md) | Assessors and developers | Problem, scope, architecture, security audit, AI implementation, deployment |

PDF copies of both are in [`pdf/`](pdf/).

## Rebuilding the PDFs

```bash
php docs/build-pdf.php
```

That writes an HTML file beside each Markdown source. Render them with headless
Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="docs/pdf/user-guide.pdf" \
  "file://$PWD/docs/USER-GUIDE.html"
```

Delete the intermediate `.html` files afterwards — they are generated output
and are not tracked.

## Live system

<https://govpay.win>

Sign-in credentials are shown on the sign-in page while `DEMO_MODE=true`.
