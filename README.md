# Pathways — Production Career Development Portal

Pathways is a standalone, cloud-deployable career-development and guidance portal for students from Upper Primary through Form 5. It is designed for deployment on **Netlify** with **Supabase Cloud** providing PostgreSQL, authentication and managed database services.

## What is included

- Admin-controlled student and counsellor accounts
- Email/password login and secure password recovery
- Optional Google and Microsoft sign-in
- Admin/counsellor/student roles
- Row Level Security for student data
- AES-256-GCM encrypted private counsellor notes handled server-side only
- Application audit events plus Supabase authentication audit logs
- Upper Primary → Form 5 career-development roadmap
- 18-question career-interest profile and guided SWOT
- Subject marks/preferences linked to career clusters and useful subject areas
- Career exploration and favourites
- Assignable learning modules
- University vs TVET, work/study, gap year, entrepreneurship, leaving school, interview, CV, application letter/video and emotional transition modules
- Copyright-aware external Dean Graziosi mindset resource assignment
- Internal counselling appointment requests
- Optional Google Calendar Appointment Schedule or Microsoft Bookings link
- Google Calendar / Outlook “add confirmed appointment” links
- Institution and official-resource directory
- Action plans and progress tracking
- Responsive student and staff portals

## Architecture

Browser → Netlify/Next.js → Supabase Auth + PostgreSQL

Normal application records are accessed with the signed-in user token and protected by PostgreSQL Row Level Security. Privileged account administration and private counsellor notes use Next.js Route Handlers on the server. `SUPABASE_SERVICE_ROLE_KEY` and `COUNSELLOR_NOTES_ENCRYPTION_KEY` must only exist in Netlify server environment variables.

## 1. Create the Supabase project

1. Create a new Supabase project.
2. In **SQL Editor**, run in this order:
   - `supabase/migrations/001_pathways_schema.sql`
   - `supabase/migrations/002_seed_content.sql`
3. From **Project Settings → API**, copy:
   - Project URL
   - Publishable key
   - Service-role key (server only)
4. Generate the counsellor-note encryption key locally:

```bash
openssl rand -base64 32
```

Do not put the service-role key or encryption key into source control.

## 2. Configure local environment

Copy `.env.example` to `.env.local` and fill in the values.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## 3. Bootstrap the first administrator

After the schema is installed, run:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
export PATHWAYS_ADMIN_EMAIL="admin@example.com"
export PATHWAYS_ADMIN_NAME="Pathways Administrator"
export PATHWAYS_ADMIN_PASSWORD="Use-A-Strong-Unique-Password!"
npm run bootstrap-admin
```

After this, sign in through Pathways and create student accounts from **Students → New student**. Temporary passwords are shown once and students are forced to set their own password.

For a controlled school portal, disable open public email sign-up in Supabase Auth. OAuth users who are not approved remain inactive until an administrator activates them.

## 4. Deploy to Netlify

1. Put this folder in a private GitHub/GitLab repository, or use Netlify’s manual/Git workflow.
2. In Netlify, create a new site from the repository.
3. Netlify will use `netlify.toml`; the build command is `npm run build`.
4. Add these environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `COUNSELLOR_NOTES_ENCRYPTION_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://YOUR-SITE.netlify.app`
   - `NEXT_PUBLIC_ENABLE_GOOGLE=false` initially
   - `NEXT_PUBLIC_ENABLE_MICROSOFT=false` initially
5. Deploy.
6. Visit `/api/health`. A healthy install returns `database: connected`.

## 5. Configure Supabase Auth URLs

In Supabase Auth URL configuration set the production site URL to your Netlify domain and allow redirects to:

- `https://YOUR-SITE.netlify.app/auth/callback`
- `https://YOUR-SITE.netlify.app/update-password`
- `http://localhost:3000/auth/callback` for development
- `http://localhost:3000/update-password` for development

For production password recovery, configure a reputable SMTP provider in Supabase so password-reset email delivery is under your organisation’s control.

## 6. Optional Google sign-in

Create a Google OAuth web application and use the Supabase callback URL shown in the Google provider configuration. Enable Google in Supabase Auth, then set `NEXT_PUBLIC_ENABLE_GOOGLE=true` in Netlify.

Pathways does not require Google to operate.

## 7. Optional Microsoft sign-in

Create a Microsoft Entra application, configure the Supabase Auth callback URL, place the client ID/secret in Supabase’s Azure/Microsoft provider configuration, then set `NEXT_PUBLIC_ENABLE_MICROSOFT=true` in Netlify.

Pathways does not require Microsoft to operate.

## 8. Calendar / counselling integration

The system always supports internal appointment requests. In **Admin → Settings**, you can additionally paste either:

- a Google Calendar Appointment Schedule booking URL, or
- a Microsoft Bookings page URL.

Once a counsellor confirms an internal appointment, students can add it to Google Calendar or Outlook from Pathways.

## Backups

Supabase provides managed database backups according to the project plan. For an additional independent export, install PostgreSQL client tools and run:

```bash
DATABASE_URL="postgresql://..." ./scripts/backup.sh
```

Keep exported backups encrypted and outside the public website repository.

## Security notes before real student use

- Keep the Git repository private if it contains organisation-specific configuration.
- Never expose the Supabase service-role key or the counsellor encryption key to browser code.
- Turn on MFA for Netlify, Supabase, Google Cloud and Microsoft admin accounts.
- Use unique staff passwords and review staff access regularly.
- Configure a custom SMTP sender for production password recovery.
- Review Supabase Auth audit logs and the in-app Pathways audit log.
- Define a retention policy for counselling notes and student records.
- Obtain any consent/guardian permissions required by your school policy and local law, especially for minors.
- Do not store unnecessary medical or highly sensitive information in career counselling notes.
- Verify current university/TVET admission requirements at the official institution before advising a student.

## Updating university links and career modules

Staff can add new institutions/resources and create additional learning modules from the portal. This keeps changing admission information outside the application source code.

## Technology

- Next.js 16.2.11
- React 19
- Supabase Auth + PostgreSQL + RLS
- Netlify Next.js/OpenNext deployment
- Node.js AES-256-GCM for counsellor-note encryption

## Netlify Next.js build setting

This release pins the Netlify build configuration in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `.next`
- Base directory: repository root

Do not set the publish directory to the repository root. If the Netlify UI contains an older conflicting value, this `netlify.toml` setting takes precedence, but it is still recommended to change the UI Publish directory to `.next`.
