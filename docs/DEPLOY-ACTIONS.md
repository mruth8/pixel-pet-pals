# Deploying the Pixel Pet Pals site with GitHub Actions (manual FTP deploy)

Workflow: `.github/workflows/deploy-ftp.yml` ("Deploy Pixel Pet Pals site (FTP)").
It is modeled on Sweetie Stats' deploy workflow. It only runs when started by hand
(`workflow_dispatch`); never on push, PR or schedule. It uploads the **contents of
`site/`** at one explicitly chosen commit to `public_html/matthew/osrs/pixel-pet-pals/`
(https://mrruth.com/matthew/osrs/pixel-pet-pals/). There's no upgrade step: the site is
static and has no database.

The site moved from `/matthew/pixel-pet-pals/` to `/matthew/osrs/pixel-pet-pals/`.
The old folder is left in place, and an optional mode of the same workflow installs a
301 redirect there (see "Old-path redirect" below).

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

- `ref` (required unless `install_old_path_redirect` is true): commit SHA (short is
  fine) or tag. Branch names are refused. The commit must contain `site/index.html`.
- `dry_run` (default **true**): lists what would be uploaded or deleted, changes nothing.
- `install_old_path_redirect` (default **false**): runs the redirect job below instead of
  the site deploy. It respects `dry_run`.

Only one run at a time (concurrency group `deploy-ftp-pixel-pet-pals`). Timeout
15 min. Token permission: `contents: read`.

## Mapping

`git archive <sha> site/`: `site/X` goes to `osrs/pixel-pet-pals/X` on the server.
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
`osrs/pixel-pet-pals/.ftp-deploy-sync-state-osrs-pixel-pet-pals.json`, and compares against it:
- New or changed files are uploaded.
- Files that were in the previous state but are no longer in `site/` are deleted.
- It never lists or cleans the server, so anything it didn't upload is never touched,
  and nothing outside `osrs/pixel-pet-pals/` is either. `dangerous-clean-slate` is not used.

Caution: `exclude` only filters the local tree. If a file that has already been
deployed is later excluded, the next run **deletes** it on the server.

## Live check (real runs only, single attempt)

The workflow fetches `https://mrruth.com/matthew/osrs/pixel-pet-pals/index.html` once and
compares its sha256 with the deployed `site/index.html`. A mismatch is a warning, not
a retry.

## Old-path redirect

Run the workflow with `install_old_path_redirect` = true (and `dry_run` true first). It skips
the site deploy and instead edits one server file, `pixel-pet-pals/.htaccess` (the OLD
folder, relative to the FTP home `public_html/matthew/`), using
`.github/scripts/install-old-path-redirect.sh`:

1. Downloads the existing file over FTP. "File not found" is treated as empty. Any other
   FTP error stops the job with nothing changed.
2. If the line `# BEGIN pixel-pet-pals-moved` is already there, it does nothing.
3. Otherwise it appends this block to the existing content (never replaces it):

   ```
   # BEGIN pixel-pet-pals-moved
   RedirectMatch 301 ^/matthew/pixel-pet-pals/(.*)$ /matthew/osrs/pixel-pet-pals/$1
   # END pixel-pet-pals-moved
   ```
4. `dry_run` true prints the existing and would-be file and uploads nothing. A real run
   uploads, reads the file back, and compares it with what was uploaded. Then it checks
   once that the old URL answers 301 to the new one (a warning if not, no retry).

Nothing is deleted. The file is outside the site deploy's `server-dir` and state file, so a
later site sync never removes or overwrites it. FTP credentials reach the script only
through the step's environment and a private temp curl config, never command-line arguments.

To undo it, delete the block between the two marker lines by hand.

## First deploy to the new folder

`osrs/pixel-pet-pals/` has no state file, so the first real run is a full upload there. The
old folder `pixel-pet-pals/` is not touched and keeps serving the old copy until the redirect
is installed.

1. **Dry run** with the chosen SHA. Check that the file list contains only `site/` contents
   (`index.html`, `widget.html`, `site.css`, `shared/`, `widget/`, `packs/`) and that the
   target is `osrs/pixel-pet-pals/`.
2. **Real run** with the same SHA. It uploads everything once and writes the new state file.
   The live check should show index.html matching.
3. **Redirect**: run with `install_old_path_redirect` true, dry run first, then real.
4. **Later deploys** upload only changed files.
