# Pathways Security Model

## Secrets
Only these variables are browser-visible: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and the two optional provider-button flags. `SUPABASE_SERVICE_ROLE_KEY` and `COUNSELLOR_NOTES_ENCRYPTION_KEY` are server-only.

## Roles
- **Student:** own assessments, subjects, actions, assignments and appointments.
- **Counsellor:** student pathway records, modules, assignments, appointments and encrypted notes.
- **Admin:** counsellor permissions plus account creation/activation, password resets, portal settings and audit access.

Authorization is enforced in PostgreSQL RLS and again in privileged server routes.

## Counsellor notes
Private note text is encrypted with AES-256-GCM before insertion into PostgreSQL. The database stores ciphertext, IV and authentication tag. The encryption key is stored only in the server environment. Students receive no table privilege or RLS policy for `counsellor_notes`.

Rotate the encryption key only with a planned re-encryption migration; changing it without migrating existing notes makes them unreadable.

## Audit
Application data changes generate metadata-only audit entries. Note content, passwords and assessment contents are not copied into the audit table. Authentication events are also recorded by Supabase Auth.

## Limitations
This repository provides secure application controls, but legal compliance depends on deployment settings, staff practices, consent, retention rules, vendor plans and local requirements. Complete an organisation-specific privacy/security review before storing real minors’ records.
