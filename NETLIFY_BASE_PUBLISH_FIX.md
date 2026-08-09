# Pathways — Netlify Base / Publish Fix

This release fixes the deployment error:

> Your publish directory cannot be the same as the base directory of your site.

## Correct paths

- Base directory: project root (`.`) — in the Netlify UI, leave Base directory EMPTY.
- Package directory: leave EMPTY.
- Build command: `npm run build`
- Publish directory: `.next`

The included `netlify.toml` explicitly sets `base = "."` and `publish = ".next"`.

## Important Netlify UI cleanup

Before redeploying, open:

Project configuration → Build & deploy → Continuous deployment → Build settings → Configure

Set:

- Base directory: EMPTY
- Package directory: EMPTY
- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: EMPTY unless Netlify populated its own framework value automatically

Save.

If a separately installed Next.js plugin is shown under Plugins, remove the manually installed/pinned `@netlify/plugin-nextjs`. Current Netlify Next.js support uses the automatically maintained OpenNext adapter; this project does not include a pinned plugin.

Then go to Deploys and choose **Retry without cache** or upload this clean source folder while logged in.

## Verify after deployment

Open:

- https://icanlearnprogrampathways.netlify.app/
- https://icanlearnprogrampathways.netlify.app/api/health
