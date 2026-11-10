#!/usr/bin/env bash
# Appends a marked 301 redirect block to pixel-pet-pals/.htaccess on the FTP server
# (relative to the FTP home, public_html/matthew/). Pixel Pet Pals moved to
# /matthew/osrs/pixel-pet-pals/; this keeps old URLs, including assets, working.
#
# - Downloads any existing file first. "File not found" (curl exit 78) means empty.
# - If the marker is already present, does nothing (idempotent).
# - Otherwise appends the block to the existing content; never replaces it.
# - DRY_RUN=true prints the would-be file and uploads nothing.
# - Nothing is deleted on the server. This file is not part of FTP-Deploy-Action's
#   state file (that action only syncs osrs/pixel-pet-pals/).
# - FTP credentials come from env (FTP_SERVER, FTP_USERNAME, FTP_PASSWORD) and are
#   handed to curl through a private temp config file, never as command-line args.
#
# Test overrides (not used in the workflow): FTP_PORT (default 21).
set -euo pipefail

: "${FTP_SERVER:?FTP_SERVER is not set}"
: "${FTP_USERNAME:?FTP_USERNAME is not set}"
: "${FTP_PASSWORD:?FTP_PASSWORD is not set}"
DRY_RUN="${DRY_RUN:-true}"
case "$DRY_RUN" in true|false) ;; *) echo "::error::DRY_RUN must be true or false"; exit 1 ;; esac

REMOTE_FILE="pixel-pet-pals/.htaccess"
URL="ftp://${FTP_SERVER}:${FTP_PORT:-21}/${REMOTE_FILE}"
BEGIN='# BEGIN pixel-pet-pals-moved'
END='# END pixel-pet-pals-moved'
RULE='RedirectMatch 301 ^/matthew/pixel-pet-pals/(.*)$ /matthew/osrs/pixel-pet-pals/$1'

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
umask 077

# curl config holds the credentials; escape backslashes and double quotes.
esc() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'; }
printf 'user = "%s:%s"\n' "$(esc "$FTP_USERNAME")" "$(esc "$FTP_PASSWORD")" > "$work/curl.conf"

ftp_get() { # $1 = output file; returns curl's exit code
  curl --silent --show-error --config "$work/curl.conf" --connect-timeout 20 --max-time 60 \
       --output "$1" "$URL"
}

summary() { [ -n "${GITHUB_STEP_SUMMARY:-}" ] && printf '%s\n' "$1" >> "$GITHUB_STEP_SUMMARY" || true; }

rc=0
ftp_get "$work/existing" || rc=$?
if [ "$rc" -eq 0 ]; then
  state="exists"
elif [ "$rc" -eq 78 ]; then
  state="missing"; : > "$work/existing"
else
  echo "::error::Could not read ${REMOTE_FILE} over FTP (curl exit $rc). Not changing anything."
  exit 1
fi
echo "Server file ${REMOTE_FILE}: ${state} ($(wc -c < "$work/existing") bytes)"
if [ -s "$work/existing" ]; then
  echo "----- existing ${REMOTE_FILE} -----"; cat "$work/existing"; echo "----- end existing -----"
fi

if grep -qxF "$BEGIN" "$work/existing"; then
  echo "Marker '${BEGIN}' already present. Nothing to do."
  summary "- \`${REMOTE_FILE}\` already has the redirect block; nothing changed."
  exit 0
fi

# Merge: existing content (kept byte for byte), a newline if it lacks one, a blank
# separator line when there is existing content, then the block.
cp "$work/existing" "$work/merged"
if [ -s "$work/merged" ]; then
  [ "$(tail -c1 "$work/merged" | od -An -c | tr -d ' ')" = '\n' ] || printf '\n' >> "$work/merged"
  printf '\n' >> "$work/merged"
fi
printf '%s\n%s\n%s\n' "$BEGIN" "$RULE" "$END" >> "$work/merged"

echo "----- would-be ${REMOTE_FILE} (dry_run=${DRY_RUN}) -----"; cat "$work/merged"; echo "----- end -----"

if [ "$DRY_RUN" = true ]; then
  echo "Dry run: nothing uploaded."
  summary "- Dry run: would $( [ "$state" = exists ] && echo append the redirect block to the existing || echo create ) \`${REMOTE_FILE}\`. Nothing uploaded."
  exit 0
fi

curl --silent --show-error --config "$work/curl.conf" --connect-timeout 20 --max-time 60 \
     --upload-file "$work/merged" "$URL"

# Read back and compare, so a partial upload is noticed.
ftp_get "$work/readback"
if ! cmp -s "$work/merged" "$work/readback"; then
  echo "::error::Read-back of ${REMOTE_FILE} differs from what was uploaded. Check the server file."
  exit 1
fi
echo "Uploaded and verified ${REMOTE_FILE}."
summary "- Uploaded \`${REMOTE_FILE}\` ($( [ "$state" = exists ] && echo appended to existing || echo created )), read-back verified."
