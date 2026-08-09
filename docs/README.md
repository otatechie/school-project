# Documentation

| Document | Audience | Covers |
|---|---|---|
| [USER-GUIDE.md](USER-GUIDE.md) | Office staff | How to prepare, approve, pay and record a voucher, in plain language |
| [PROJECT-DOCUMENTATION.md](PROJECT-DOCUMENTATION.md) | Assessors and developers | Problem, scope, architecture, security, AI implementation, deployment |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Whoever deploys | Dokploy setup and the 502 checklist |

PDF copies of the guide and the documentation are in [`pdf/`](pdf/).

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

Delete the intermediate `.html` files afterwards; they are generated output
and are not tracked.

## Examination PDFs

```bash
php docs/build-submissions.php
```

Writes, for each group member listed in [contributions.php](contributions.php):

- `submissions/Group07_<ID>_Capstone_Documentation.pdf`
- `submissions/Group07_<ID>_User_Manual.pdf`
- `contributions/Group07_<ID>_Contribution.pdf` (their section 17 alone, for review)

The technical chapters are shared; section 17 differs per student. The
division of labour in `contributions.php` is a proposal read from the shape of
the codebase. Each member must confirm or correct their own entry before
submitting; edit the file and re-run the script.

## Live system

<https://govpay.win>

Sign-in credentials are shown on the sign-in page while `DEMO_MODE=true`.
