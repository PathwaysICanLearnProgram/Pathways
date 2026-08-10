-- Pathways Career Portal — complete database schema (Supabase / PostgreSQL)
--
-- This file is idempotent: run it on a brand-new project to create the portal
-- from scratch, or run it against the existing production project to add the
-- v1.2.0 additions (participant type, branding colours, document library)
-- without disturbing existing data.
--
-- Run in: Supabase dashboard → SQL editor → New query → Run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- helpers --

create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select active and role in ('admin','counsellor') from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select active and role = 'admin' from public.profiles where id = auth.uid()), false)
$$;


-- --------------------------------------------------------------- profiles --

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'student' check (role in ('admin','counsellor','student')),
  active boolean not null default true,
  force_password_change boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Called by the portal once a participant has set their own password, so the
-- forced-password-change screen is cleared without a round trip to the API.
create or replace function public.complete_password_change()
returns void language sql security definer set search_path = public as $$
  update public.profiles set force_password_change = false where id = auth.uid();
$$;

grant execute on function public.complete_password_change() to authenticated;


-- -------------------------------------------------- participants & records --

create table if not exists public.student_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stage text not null default 'Form 1',
  career_focus text,
  graduation_year integer,
  counsellor_id uuid references public.profiles(id) on delete set null,
  participant_type text not null default 'student' check (participant_type in ('student','client')),
  updated_at timestamptz not null default now()
);
alter table public.student_details add column if not exists participant_type text not null default 'student';

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('profile','swot')),
  payload jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subject_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_name text not null,
  score integer,
  enjoyment integer,
  confidence integer,
  notes text,
  created_at timestamptz not null default now(),
  unique (student_id, subject_name)
);

create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------- learning library --

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'Self discovery',
  title text not null,
  summary text not null default '',
  content_md text not null default '',
  external_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.module_assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  status text not null default 'assigned',
  due_date date,
  completed_at timestamptz,
  assigned_at timestamptz not null default now(),
  unique (module_id, student_id)
);

-- ------------------------------------------------------------- documents --

create table if not exists public.portal_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'General',
  source_type text not null default 'upload' check (source_type in ('upload','google_drive','dropbox','external')),
  external_url text,
  storage_path text,
  file_name text,
  visibility text not null default 'assigned_students' check (visibility in ('assigned_students','all_students','staff_only')),
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.document_assignments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.portal_documents(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  student_message text,
  due_date date,
  assigned_at timestamptz not null default now(),
  unique (document_id, student_id)
);

-- --------------------------------------------- counselling & institutions --

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  requested_start timestamptz,
  confirmed_start timestamptz,
  duration_minutes integer not null default 45,
  topic text not null default 'Career guidance',
  student_message text,
  staff_response text,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution_type text not null default 'University',
  country text not null default 'Botswana',
  website_url text not null default '',
  admissions_url text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.counsellor_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------- settings and branding --

create table if not exists public.portal_settings (
  id boolean primary key default true check (id),
  portal_name text not null default 'Pathways',
  organisation_name text not null default '',
  counsellor_name text not null default 'Pathways counsellor',
  counsellor_email text,
  booking_provider text not null default 'internal',
  booking_url text,
  welcome_message text not null default 'Welcome back to your career-development journey.',
  logo_url text,
  logo_path text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.portal_settings add column if not exists primary_color text not null default '#0d766e';
alter table public.portal_settings add column if not exists accent_color text not null default '#c58a2b';
alter table public.portal_settings add column if not exists background_color text not null default '#f4f6f3';
alter table public.portal_settings add column if not exists sidebar_color text not null default '#102b31';

insert into public.portal_settings (id) values (true) on conflict (id) do nothing;

-- The login screen is unauthenticated, so branding is exposed through a view
-- that contains only presentation fields — never counsellor contact details.
-- Replace whatever an earlier release left behind, table or view.
do $$
begin
  if exists (select 1 from pg_class where relname = 'portal_branding' and relnamespace = 'public'::regnamespace and relkind = 'v') then
    execute 'drop view public.portal_branding';
  elsif exists (select 1 from pg_class where relname = 'portal_branding' and relnamespace = 'public'::regnamespace and relkind = 'r') then
    execute 'drop table public.portal_branding cascade';
  end if;
end $$;

create view public.portal_branding as
  select id, portal_name, logo_url, primary_color, accent_color, background_color, sidebar_color
  from public.portal_settings;

grant select on public.portal_branding to anon, authenticated;

-- ---------------------------------------------------------------- row-level --

alter table public.profiles enable row level security;
alter table public.student_details enable row level security;
alter table public.assessment_results enable row level security;
alter table public.subject_results enable row level security;
alter table public.action_plans enable row level security;
alter table public.learning_modules enable row level security;
alter table public.module_assignments enable row level security;
alter table public.portal_documents enable row level security;
alter table public.document_assignments enable row level security;
alter table public.appointments enable row level security;
alter table public.institutions enable row level security;
alter table public.counsellor_notes enable row level security;
alter table public.audit_events enable row level security;
alter table public.portal_settings enable row level security;

do $$
declare policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and policyname like 'pathways_%'
  loop
    execute format('drop policy %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end $$;

create policy pathways_profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy pathways_profiles_staff_write on public.profiles for update using (public.is_staff()) with check (public.is_staff());

create policy pathways_details_read on public.student_details for select using (user_id = auth.uid() or public.is_staff());
create policy pathways_details_write on public.student_details for all using (public.is_staff()) with check (public.is_staff());

create policy pathways_assessments_own on public.assessment_results for all
  using (student_id = auth.uid() or public.is_staff()) with check (student_id = auth.uid() or public.is_staff());
create policy pathways_subjects_own on public.subject_results for all
  using (student_id = auth.uid() or public.is_staff()) with check (student_id = auth.uid() or public.is_staff());
create policy pathways_actions_own on public.action_plans for all
  using (student_id = auth.uid() or public.is_staff()) with check (student_id = auth.uid() or public.is_staff());
create policy pathways_appointments_own on public.appointments for all
  using (student_id = auth.uid() or public.is_staff()) with check (student_id = auth.uid() or public.is_staff());

create policy pathways_modules_read on public.learning_modules for select using (is_published or public.is_staff());
create policy pathways_modules_write on public.learning_modules for all using (public.is_staff()) with check (public.is_staff());

create policy pathways_module_assignments_read on public.module_assignments for select using (student_id = auth.uid() or public.is_staff());
create policy pathways_module_assignments_update on public.module_assignments for update
  using (student_id = auth.uid() or public.is_staff()) with check (student_id = auth.uid() or public.is_staff());
create policy pathways_module_assignments_staff on public.module_assignments for all using (public.is_staff()) with check (public.is_staff());

create policy pathways_documents_read on public.portal_documents for select using (
  public.is_staff() or (
    active and (
      visibility = 'all_students'
      or (visibility = 'assigned_students' and exists (
        select 1 from public.document_assignments a
        where a.document_id = portal_documents.id and a.student_id = auth.uid()
      ))
    )
  )
);
create policy pathways_documents_write on public.portal_documents for all using (public.is_staff()) with check (public.is_staff());

create policy pathways_document_assignments_read on public.document_assignments for select using (student_id = auth.uid() or public.is_staff());
create policy pathways_document_assignments_write on public.document_assignments for all using (public.is_staff()) with check (public.is_staff());

create policy pathways_institutions_read on public.institutions for select using (active or public.is_staff());
create policy pathways_institutions_write on public.institutions for all using (public.is_staff()) with check (public.is_staff());

-- Private notes are only ever read through the server API (service role).
create policy pathways_notes_staff on public.counsellor_notes for all using (public.is_staff()) with check (public.is_staff());

create policy pathways_audit_read on public.audit_events for select using (public.is_staff());

create policy pathways_settings_read on public.portal_settings for select using (auth.uid() is not null);
create policy pathways_settings_write on public.portal_settings for update using (public.is_staff()) with check (public.is_staff());

-- --------------------------------------------------------------- storage --

insert into storage.buckets (id, name, public)
values ('pathways-documents', 'pathways-documents', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('pathways-branding', 'pathways-branding', true)
on conflict (id) do nothing;

do $$
declare policy_record record;
begin
  for policy_record in
    select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'pathways_%'
  loop
    execute format('drop policy %I on storage.objects', policy_record.policyname);
  end loop;
end $$;

create policy pathways_documents_storage_staff on storage.objects for all
  using (bucket_id = 'pathways-documents' and public.is_staff())
  with check (bucket_id = 'pathways-documents' and public.is_staff());

create policy pathways_documents_storage_assigned on storage.objects for select
  using (bucket_id = 'pathways-documents' and exists (
    select 1 from public.portal_documents d
    join public.document_assignments a on a.document_id = d.id
    where d.storage_path = storage.objects.name and a.student_id = auth.uid()
  ));

create policy pathways_documents_storage_public_docs on storage.objects for select
  using (bucket_id = 'pathways-documents' and exists (
    select 1 from public.portal_documents d
    where d.storage_path = storage.objects.name and d.active and d.visibility = 'all_students'
  ));

create policy pathways_branding_storage_read on storage.objects for select using (bucket_id = 'pathways-branding');
create policy pathways_branding_storage_write on storage.objects for all
  using (bucket_id = 'pathways-branding' and public.is_staff())
  with check (bucket_id = 'pathways-branding' and public.is_staff());
