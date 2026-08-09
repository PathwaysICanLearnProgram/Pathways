# Pathways live-site crash fix

Target site: `https://icanlearnprogrampathways.netlify.app`

This release adds:

- safe built-in fallbacks for the connected Supabase public URL and publishable key;
- guarded login/session calls so a network/configuration error renders a message instead of crashing React;
- a portal profile fallback using the existing RLS-protected `profiles` table;
- application and global error boundaries;
- a lightweight `/api/health` configuration check;
- the production Netlify URL in the environment templates;
- the existing `.next` Netlify build/publish configuration.

## Required Netlify server-only variables

These still must be configured in Netlify for administrative functions and encrypted counsellor notes:

- `SUPABASE_SERVICE_ROLE_KEY`
- `COUNSELLOR_NOTES_ENCRYPTION_KEY`

Do not place either value in source code or in a `NEXT_PUBLIC_` variable.

## Recommended public variables

Although this release has safe fallbacks, keep these in Netlify:

- `NEXT_PUBLIC_SUPABASE_URL=https://zvgragymlezepfrkevdv.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<the Pathways publishable key>`
- `NEXT_PUBLIC_SITE_URL=https://icanlearnprogrampathways.netlify.app`
- `NEXT_PUBLIC_ENABLE_GOOGLE=false`
- `NEXT_PUBLIC_ENABLE_MICROSOFT=false`

## Important current database state

The connected Supabase project currently has no Auth users/profiles. The first administrator account still needs to be created in Supabase Auth and promoted/activated before the staff portal can be used.
