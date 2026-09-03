#!/usr/bin/env bash
# Publish dist/ to the gh-pages branch.
#
# Why this exists: .github/workflows/deploy.yml is the intended deploy path, but
# it cannot run while the GitHub account is billing-locked ("The job was not
# started because your account is locked due to a billing issue"). The legacy
# Pages branch builder is not billing-gated, so we build locally and push the
# result. Delete this script once Actions runs again.

set -euo pipefail

REPO_URL="$(git config --get remote.origin.url)"
BRANCH="gh-pages"
SRC_SHA="$(git rev-parse --short HEAD)"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

if [ -n "$(git status --porcelain)" ]; then
  echo "refusing to deploy: working tree is dirty" >&2
  git status --short >&2
  exit 1
fi

# PAGES_BASE makes vite emit /umbra-society/ asset paths, matching the
# project-pages subpath. Without it the built HTML points at / and 404s.
PAGES_BASE=1 npm run build

cp -R dist/. "$STAGE"/
touch "$STAGE/.nojekyll"

git -C "$STAGE" init -q
git -C "$STAGE" checkout -qb "$BRANCH"
git -C "$STAGE" add -A
git -C "$STAGE" -c user.email="deploy@local" -c user.name="deploy" \
  commit -q -m "Deploy $SRC_SHA"
git -C "$STAGE" remote add origin "$REPO_URL"
git -C "$STAGE" push -qf origin "$BRANCH"

echo "pushed $BRANCH from $SRC_SHA"

# The branch push alone does not always trigger a rebuild; ask explicitly.
if command -v gh >/dev/null; then
  SLUG="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
  gh api -X POST "repos/$SLUG/pages/builds" --silent
  echo "requested Pages build for $SLUG"
fi
