# Pathways — Connected Setup Status

## Already completed

- Connected Supabase organisation: **PATHWAYS - ICANLEARNPROGRAM**
- Connected project: **Pathways Career Development**
- Project reference: `zvgragymlezepfrkevdv`
- Region: `eu-west-1`
- Database schema applied
- Starter learning/institution content applied
- Security hardening applied
- Database verified: 13 core tables, 12 learning modules, 6 institution/resource rows

## What remains in Netlify

1. Create/sign in to Netlify using an account you control.
2. Put this source in a private Git repository and connect the repository to Netlify.
3. In Netlify open **Project configuration > Environment variables**.
4. Import the values from `NETLIFY_ENV_TEMPLATE.txt`.
5. In Supabase Dashboard obtain the server-only service-role/secret key and paste it into `SUPABASE_SERVICE_ROLE_KEY` in Netlify. Do not place it in Git or a public file.
6. Generate the counselling encryption secret with `openssl rand -base64 32` and set `COUNSELLOR_NOTES_ENCRYPTION_KEY` in Netlify.
7. Deploy the site.
8. Copy the final Netlify URL into `NEXT_PUBLIC_SITE_URL`, then redeploy.
9. In Supabase Auth URL Configuration set the Site URL to the production Netlify URL. Add `http://localhost:3000/**` for local development if desired.
10. Create the first Auth user in Supabase Authentication > Users, then ask ChatGPT to promote that user to Pathways administrator, OR run the included bootstrap script from a trusted computer with the server-only key.

## First administrator

Use your chosen permanent administrative email. Because an account password was shared in chat during setup, choose a **new unique password** before creating the production administrator.

## Netlify build

The included `netlify.toml` runs `npm run build` with Node 22. Netlify's Next.js support handles the App Router/server routes used by Pathways.

## Advisor review

Supabase security/performance advisors were run after deployment. Fresh-database "unused index" informational messages are expected before real traffic exists. The intentionally client-inaccessible counsellor note table has RLS enabled with no authenticated policy; it is accessed only through the server-side service-role route. The two narrowly scoped SECURITY DEFINER RPCs intentionally permit only ownership-checked module completion and appointment cancellation without granting students broad table update rights.

## Netlify Next.js build setting

This release pins the Netlify build configuration in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `.next`
- Base directory: repository root

Do not set the publish directory to the repository root. If the Netlify UI contains an older conflicting value, this `netlify.toml` setting takes precedence, but it is still recommended to change the UI Publish directory to `.next`.

