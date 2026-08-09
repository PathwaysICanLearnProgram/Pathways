#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to the Supabase direct Postgres connection string}"
mkdir -p backups
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="backups/pathways-$STAMP.dump"
echo "Created backups/pathways-$STAMP.dump"
