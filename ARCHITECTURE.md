# Pathways Architecture

```text
Student / Staff browser
        |
        | HTTPS
        v
Netlify-hosted Next.js application
        |
        +-------------------------+
        |                         |
        v                         v
Supabase Auth               Next.js secure routes
(email/password,            (admin user creation,
Google/Microsoft)            encrypted counsellor notes)
        |                         |
        +------------+------------+
                     v
              Supabase PostgreSQL
              + Row Level Security
              + application audit log
              + encrypted note ciphertext
```

## Independence

Pathways is not tied to a school server. Netlify can be replaced by another Next.js-compatible host. Supabase uses PostgreSQL, so the data can be exported/migrated. Google/Microsoft are optional connectors and are not required for core login or data storage.

## Student access boundary

Students can access only their own permitted records through RLS. They cannot query private counsellor notes. Staff permissions are role-based and administrator-only actions use protected server routes where necessary.
