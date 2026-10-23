#!/usr/bin/env bash
# Runs ON THE SERVER. GitHub Actions calls it over SSH after the checks pass.
# You can also run it by hand: bash ~/class-poll/deploy.sh
#
# set -e stops at the first failing command, so a failed install never gets as far
# as restarting the app with half-updated files.
set -euo pipefail

cd ~/class-poll

# --ff-only refuses to merge. The server only ever receives what is on GitHub; if
# someone edited files on the server by hand, this fails loudly instead of mixing.
git pull --ff-only

# ci installs exactly what package-lock.json says. --omit=dev skips tooling the
# running app does not need.
npm ci --omit=dev

# .env is not in git, so a deploy never touches it.
sudo systemctl restart classpoll
echo "Deployed $(git rev-parse --short HEAD)"
