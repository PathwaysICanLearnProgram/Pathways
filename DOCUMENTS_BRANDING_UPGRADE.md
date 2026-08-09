# Pathways Documents & Branding Upgrade

## What this release adds

### Admin / Counsellor Documents workspace
- Upload application forms, class schedules, university/TVET material, CV/application resources, images and general student documents.
- Add Google Drive, Dropbox or other web sharing links without connecting an entire cloud-drive account.
- Choose visibility: all students, assigned students only, or staff only.
- Assign a document to a specific student with a personal message and optional due date.
- Review and remove recent student document assignments.
- Remove obsolete documents from the library.

### Student My Documents workspace
- Students only see documents available to everyone or specifically assigned to them.
- Personal counsellor messages and suggested completion dates appear with assigned documents.
- Uploaded files are opened through short-lived signed links from the private document bucket.

### Editable branding
- Admin can upload a custom Pathways logo from Settings.
- The logo appears on the login screen, Admin/Counsellor portal and Student portal.
- Portal name changes also appear on the login screen.

## Supabase status
The live connected Pathways Supabase project has already been upgraded with:
- `portal_documents`
- `document_assignments`
- `portal_branding`
- `portal_settings.logo_url`
- `portal_settings.logo_path`
- Private Storage bucket: `pathways-documents` (25 MB/file limit)
- Public branding bucket: `pathways-branding` (5 MB/logo limit)
- RLS policies for staff/student document access

No manual SQL migration is required for the currently connected production database. The migrations are still included in this package for backup/reproducibility.

## Netlify redeploy
Deploy this project exactly like the currently working Pathways release.

Required project root files include:
- `package.json`
- `netlify.toml`
- `next.config.ts`
- `app/`
- `components/`
- `lib/`
- `supabase/`

Existing Netlify environment variables should remain unchanged.

After deployment:
1. Sign in as Admin.
2. Open **Settings** and upload your logo.
3. Open **Documents**.
4. Add a test document and choose **Only students I assign**.
5. Assign it to a test student with a personal message.
6. Sign in as that student and open **My Documents**.

## Google Drive and Dropbox
There are two supported workflows:
1. Use **Google Drive link** or **Dropbox link** and paste a sharing URL.
2. Use **Upload file** and select a file through your device's file picker. On devices where Drive/Dropbox are available through the system Files picker, you can choose files from those providers there.

The first workflow avoids granting Pathways broad access to your cloud-drive account.
