# Deploying the Pixel Pet Pals site with GitHub Actions (manual FTP deploy)

Workflow: `.github/workflows/deploy-ftp.yml` ("Deploy Pixel Pet Pals site (FTP)").
It is modeled on Sweetie Stats' deploy workflow. It only runs when started by hand
(`workflow_dispatch`); never on push, PR or schedule. It uploads the **contents of
`site/`** at one explicitly chosen commit to `public_html/matthew/pixel-pet-pals/`
(https://mrruth.com/matthew/pixel-pet-pals/). There's no upgrade step: the site is
static and has no database.

## Secrets (one-time, per repo)

Add these at https://github.com/mruth8/pixel-pet-pals/settings/secrets/actions.
They are the same values as in sweetie-stats and team-balancer, but GitHub secrets
are per repo:

| secret | value |
|---|---|
| `FTP_SERVER` | `ftp.mrruth.com` |
| `FTP_USERNAME` | `matthew@mrruth.com` (its root is `public_html/matthew/`) |
| `FTP_PASSWORD` | that FTP account's password |

## How to run

Actions → "Deploy Pixel Pet Pals site (FTP)" → Run workflow:

- `ref` (required): commit SHA (short is fine) or tag. Branch names are refused. The
  commit must contain `site/index.html`.
- `dry_run` (default **true**): lists what would be uploaded or deleted, changes nothing.

Only one run at a time (concurrency group `deploy-ftp-pixel-pet-pals`). Timeout
15 min. Token permission: `contents: read`.

## Mapping

`git archive <sha> site/`: `site/X` goes to `pixel-pet-pals/X` on the server.
Nothing outside `site/` is uploaded: no `relay/`, `mock-sender/`, `widget/` source,
`packs/` source, `docs/`, `test/`, `design/` or `node_modules/`.

The guard step **fails the job** if the tree contains:
- `*config*.php` except samples
- `data/`, `backups/`, `state/`, `secrets/` or `private/`
- `*.sqlite*`, `*.db`, `.env*`, `*.csv`, `upgrade.key`, `*.key`, `*.pem`, `*.p12` or `.htpasswd*`
- `roster*`, `credentials*`, `.npmrc`, `.netrc`, `*.log` or `*.bak`
- `node_modules/` or `.git`
- anything that looks like a token or key: GitHub, Slack, AWS, a private key block, or a Discord webhook URL

The FTP step's `exclude` list repeats these as a second line of defence.

## How sync works

SamKirkland/FTP-Deploy-Action (pinned `v4.4.0`) keeps its own state file,
`pixel-pet-pals/.ftp-deploy-sync-state-pixel-pet-pals.json`, and compares against it:
- New or changed files are uploaded.
- Files that were in the previous state but are no longer in `site/` are deleted.
- It never lists or cleans the server, so anything it didn't upload is never touched,
  and nothing outside `pixel-pet-pals/` is either. `dangerous-clean-slate` is not used.

Caution: `exclude` only filters the local tree. If a file that has already been
deployed is later excluded, the next run **deletes** it on the server.

## Live check (real runs only, single attempt)

The workflow fetches `https://mrruth.com/matthew/pixel-pet-pals/index.html` once and
compares its sha256 with the deployed `site/index.html`. A mismatch is a warning, not
a retry.

## First-run plan

The site is **not live yet**: `/matthew/pixel-pet-pals/` returned 404 on 2026-10-12.
There's nothing on the server to match, so the first real run is a fresh upload.

1. **Get `site/` onto `main`.** As of 2026-10-12, `main` (`e392351`) has no `site/`.
   The static page is on branch `site-progress-page` (`563e170`: 206 files, about 1.2 MB).
   The workflow refuses a commit without `site/index.html`. It can deploy any SHA,
   including `563e170`, but deploying a merged `main` commit is cleaner.
2. **Dry run** with that SHA. Check that the file list contains only `site/` contents
   (`index.html`, `widget.html`, `site.css`, `shared/`, `widget/`, `packs/`).
3. **Real run** with the same SHA. It creates `pixel-pet-pals/`, uploads everything
   once and writes the state file. The live check should show index.html matching.
4. **Later deploys** upload only changed files.
