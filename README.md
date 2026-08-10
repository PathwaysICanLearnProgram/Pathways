# Pathways Career Portal

A standalone career-development portal with two protected sides:

- an **Admin / Counsellor portal** for running the programme, and
- a **Student / Client portal** for the participants.

It is a self-contained Next.js application backed by an online PostgreSQL database
(Supabase). Nothing about it is specific to a single host — it runs on Netlify, on
any Next.js-compatible host, or locally.

## What the Admin / Counsellor portal does

| Area | Capability |
| --- | --- |
| Overview | Participant, document and module counts, outstanding counselling requests, recent activity |
| Students & Clients | Create student **or client** logins, generate one-time temporary passwords, force a first-login password change, reset passwords, activate/deactivate accounts, edit stage, career focus and graduation year |
| Participant record | Career profile scores, SWOT, subject results, action plan, assigned learning and documents, encrypted private counsellor notes |
| Documents | Upload files, or link Google Drive / Dropbox / any web URL; edit; publish and unpublish; delete; assign to everyone or to named participants with a personal message and a due date |
| Learning Library | Create and update modules, publish/unpublish, assign to one participant or everyone |
| Counselling | Review requests, confirm times, respond, change status |
| Universities & TVET | Maintain the institution list students see |
| Branding & Settings | Portal name, organisation, counsellor details, welcome message, logo upload, and primary / accent / background / sidebar colours |
| Audit Log | The 100 most recent administration and security events |

## What the Student / Client portal does

Overview, career-development roadmap, career assessment, SWOT, subjects and careers,
Learning Hub, My Documents, personal action plan, counselling and appointments, and
universities & TVET — each account seeing only its own private record.

Participants cannot register themselves. Every account is created by an administrator.

## Branding

Branding is stored in the database, not in the code. Saving it in **Branding & Settings**
immediately changes the login screen, the admin portal and the student/client portal,
because all three read the same settings row and apply the colours as CSS variables.

## Deploying it standalone

1. **Create the database.** In a Supabase project, open the SQL editor and run
   [`supabase/schema.sql`](supabase/schema.sql). It is safe to re-run on an existing
   project — it only adds what is missing. Optionally run
   [`supabase/seed.sql`](supabase/seed.sql) to load starter learning modules and
   institutions.
2. **Set environment variables** (see `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — public
   - `SUPABASE_SERVICE_ROLE_KEY` — server only, never prefixed with `NEXT_PUBLIC_`
   - `COUNSELLOR_NOTES_ENCRYPTION_KEY` — 32 bytes, base64 (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` — the deployed URL, no trailing slash
3. **Create the first administrator:**
   ```bash
   PATHWAYS_ADMIN_EMAIL=you@example.com PATHWAYS_ADMIN_PASSWORD='a-long-password' \
     npm run bootstrap-admin
   ```
4. **Build and run:** `npm install && npm run build && npm start`, or deploy the
   repository to Netlify (`netlify.toml` is already configured — no custom build
   step, no packed sources).

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

`npm run typecheck` runs the TypeScript check. `/api/health` reports which
environment variables the running deployment can see, without revealing them.

## Security notes

- Row Level Security is enforced on every table; participants can only read their own rows.
- Private counsellor notes are encrypted with AES-256-GCM before storage and are only
  ever decrypted by the server API for staff.
- Administrator-only actions (creating accounts, resetting passwords) run through server
  routes that verify the caller's role against the database, never in the browser.
- Uploaded documents live in a private storage bucket and are served through short-lived
  signed URLs.
