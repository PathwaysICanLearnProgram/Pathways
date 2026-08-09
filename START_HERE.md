# PATHWAYS CONNECTED BUILD

The Supabase database for this package has already been connected and initialized. **Read `CONNECTED_SETUP_STATUS.md` first.**

# START HERE — Put Pathways Online

This package is ready for **Netlify + Supabase Cloud**. You do not need a school server.

## Accounts to create

Use accounts you personally control and enable MFA on each one.

1. **Supabase** — database + authentication.
2. **Netlify** — website hosting.
3. **Optional Google Cloud** — only if you want Google sign-in.
4. **Optional Microsoft Entra / Microsoft 365** — only if you want Microsoft sign-in or Microsoft Bookings.

A sensible ownership pattern is to use one permanent organisation-owner email for Netlify/Supabase billing and recovery, then give named staff their own Pathways accounts. Do not share one administrator password among staff.

## Fastest deployment sequence

1. Create Supabase project.
2. Run `supabase/migrations/001_pathways_schema.sql`.
3. Run `supabase/migrations/002_seed_content.sql`.
4. Copy your Supabase URL, publishable key and service-role key.
5. Generate a 32-byte encryption key: `openssl rand -base64 32`.
6. Put this code in a private Git repository.
7. Connect the repository to Netlify.
8. Add the variables from `.env.example` in Netlify Environment Variables.
9. Deploy.
10. Run `npm run bootstrap-admin` once from a trusted computer to create your first Pathways administrator.
11. Sign in and configure **Admin → Settings**.
12. Create a test student account and test the full student journey before adding real students.

Read `README.md`, `SECURITY.md` and `DEPLOYMENT_CHECKLIST.md` before live use.

## Netlify Next.js build setting

This release pins the Netlify build configuration in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `.next`
- Base directory: repository root

Do not set the publish directory to the repository root. If the Netlify UI contains an older conflicting value, this `netlify.toml` setting takes precedence, but it is still recommended to change the UI Publish directory to `.next`.

