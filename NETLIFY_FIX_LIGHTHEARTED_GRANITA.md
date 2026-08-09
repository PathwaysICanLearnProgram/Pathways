# Pathways — Netlify deployment fix

Project: `lighthearted-granita-90986f`

## Required Build Settings

- Base directory: leave blank / repository root
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `22`

The supplied `netlify.toml` now contains:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "22"
  NEXT_TELEMETRY_DISABLED = "1"
```

## In Netlify

1. Open the Pathways project.
2. Go to Project configuration → Build & deploy → Continuous deployment → Build settings.
3. Select Configure.
4. Make sure Publish directory is `.next` (not `/`, the repository root, or `/opt/build/repo`).
5. Keep Build command as `npm run build`.
6. Save.
7. Deploy again.

## Required Environment Variables

Before production use, ensure the Netlify project has all values from `NETLIFY_ENV_TEMPLATE.txt`.

Do not put `SUPABASE_SERVICE_ROLE_KEY` or `COUNSELLOR_NOTES_ENCRYPTION_KEY` in source code or in this file.
