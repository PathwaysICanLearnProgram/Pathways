# Netlify dependency fix

This release fixes the Netlify dependency-installation error:

`npm error notarget No matching version found for typescript@5.9.0`

## Corrected dependency

`package.json` now pins:

```json
"typescript": "5.8.3"
```

The project does not include a stale `package-lock.json`, so Netlify will resolve dependencies from the corrected `package.json` during the next clean build.

## Netlify settings

- Base directory: blank in the Netlify UI (the included `netlify.toml` uses `base = "."`)
- Build command: `npm run build`
- Publish directory: `.next`
- Node: 22

Use **Clear cache and deploy site** / **Retry without cache** if Netlify offers that option, so the failed dependency metadata is not reused.
