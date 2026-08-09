-- Pathways production schema for Supabase/PostgreSQL
-- Run with the Supabase CLI or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

-- Internal helper functions live in a non-exposed schema.
create schema if not exists private;
revoke all on schema private from public;

DO $$ BEGIN
  create type public.app_role as enum ('admin','counsellor','student');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  create type public.school_stage as enum ('Upper Primary','Form 1','Form 2','Form 3','Form 4','Form 5');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'student',
  active boolean not null default false,
  force_password_change boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create table if not exists public.student_details (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stage public.school_stage not null default 'Form 1',
  career_focus text,
  graduation_year integer check (graduation_year between 2020 and 2100),
  counsellor_id uuid references public.profiles(id) on delete set null,
  guardian_name text,
  guardian_email text,
  updated_at timestamptz not null default now()
);
create index if not exists student_details_counsellor_idx on public.student_details(counsellor_id);

create table if not exists public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('profile','swot')),
  payload jsonb not null default '{}'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assessment_results_student_idx on public.assessment_results(student_id, kind, created_at desc);

create table if not exists public.subject_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_name text not null,
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  enjoyment smallint check (enjoyment is null or enjoyment between 1 and 5),
  confidence smallint check (confidence is null or confidence between 1 and 5),
  notes text,
  updated_at timestamptz not null default now(),
  unique(student_id, subject_name)
);
create index if not exists subject_results_student_idx on public.subject_results(student_id);

create table if not exists public.career_favourites (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  career_name text not null,
  career_cluster text,
  notes text,
  created_at timestamptz not null default now(),
  unique(student_id, career_name)
);

create table if not exists public.action_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  status text not null default 'open' check (status in ('open','in_progress','done')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists action_plans_student_idx on public.action_plans(student_id, status);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title text not null,
  summary text not null default '',
  content_md text not null default '',
  external_url text,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.module_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  status text not null default 'assigned' check (status in ('assigned','started','completed')),
  due_date date,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, module_id)
);
create index if not exists module_assignments_student_idx on public.module_assignments(student_id, status);

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution_type text not null,
  country text not null default 'Botswana',
  website_url text not null,
  admissions_url text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_settings (
  id boolean primary key default true check (id = true),
  portal_name text not null default 'Pathways',
  organisation_name text not null default 'Pathways Career Development',
  counsellor_name text not null default 'Career Counsellor',
  counsellor_email text,
  booking_provider text not null default 'internal' check (booking_provider in ('internal','google','microsoft','external')),
  booking_url text,
  welcome_message text not null default 'Explore your strengths, understand your options and plan your next step with guidance.',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);
insert into public.portal_settings(id) values (true) on conflict (id) do nothing;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  counsellor_id uuid references public.profiles(id) on delete set null,
  requested_start timestamptz,
  confirmed_start timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes between 15 and 180),
  topic text not null,
  student_message text,
  staff_response text,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists appointments_student_idx on public.appointments(student_id, created_at desc);
create index if not exists appointments_counsellor_idx on public.appointments(counsellor_id, status, requested_start);

-- Counsellor notes intentionally store ciphertext only. The application server performs AES-256-GCM encryption.
create table if not exists public.counsellor_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  created_at timestamptz not null default now()
);
create index if not exists counsellor_notes_student_idx on public.counsellor_notes(student_id, created_at desc);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_created_idx on public.audit_events(created_at desc);
create index if not exists audit_events_actor_idx on public.audit_events(actor_id, created_at desc);

-- Utility functions ---------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.current_profile_active()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.active = true);
$$;

create or replace function private.is_staff()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.active = true and p.role in ('admin','counsellor'));
$$;

create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.active = true and p.role = 'admin');
$$;

-- RLS policies may call these helpers, but they are not exposed through the Data API.
grant usage on schema private to authenticated;
revoke all on function private.current_profile_active() from public, anon;
revoke all on function private.is_staff() from public, anon;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.current_profile_active() to authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, email, full_name, role, active, force_password_change)
  values (
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)),
    'student',
    false,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure private.handle_new_auth_user();

create or replace function private.audit_row_change()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare row_data jsonb; rid text;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  rid := coalesce(row_data->>'id', row_data->>'user_id', row_data->>'student_id');
  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), lower(tg_op), tg_table_name, rid, jsonb_build_object('source','database_trigger'));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- Trigger helpers are internal-only.
revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
revoke all on function private.audit_row_change() from public, anon, authenticated;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

create or replace function public.complete_my_module(p_assignment_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not private.current_profile_active() then raise exception 'inactive account'; end if;
  update public.module_assignments
     set status='completed', completed_at=now()
   where id=p_assignment_id and student_id=(select auth.uid());
  if not found then raise exception 'assignment not found'; end if;
end;
$$;

revoke all on function public.complete_my_module(uuid) from public, anon;
grant execute on function public.complete_my_module(uuid) to authenticated;

create or replace function public.cancel_my_appointment(p_appointment_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not private.current_profile_active() then raise exception 'inactive account'; end if;
  update public.appointments set status='cancelled', updated_at=now()
   where id=p_appointment_id and student_id=(select auth.uid()) and status in ('requested','confirmed');
  if not found then raise exception 'appointment not found or cannot be cancelled'; end if;
end;
$$;
revoke all on function public.cancel_my_appointment(uuid) from public, anon;
grant execute on function public.cancel_my_appointment(uuid) to authenticated;

-- Updated-at triggers
DO $$
declare t text;
begin
  foreach t in array array['profiles','student_details','assessment_results','subject_results','action_plans','learning_modules','institutions','portal_settings','appointments'] loop
    execute format('drop trigger if exists %I on public.%I', 'touch_'||t, t);
    execute format('create trigger %I before update on public.%I for each row execute function private.touch_updated_at()', 'touch_'||t, t);
  end loop;
end $$;

-- Audit triggers (contents are deliberately not copied into audit metadata)
DO $$
declare t text;
begin
  foreach t in array array['profiles','student_details','assessment_results','subject_results','career_favourites','action_plans','learning_modules','module_assignments','institutions','portal_settings','appointments'] loop
    execute format('drop trigger if exists %I on public.%I', 'audit_'||t, t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function private.audit_row_change()', 'audit_'||t, t);
  end loop;
end $$;

-- Row Level Security --------------------------------------------------------
DO $$
declare t text;
begin
  foreach t in array array['profiles','student_details','assessment_results','subject_results','career_favourites','action_plans','learning_modules','module_assignments','institutions','portal_settings','appointments','counsellor_notes','audit_events'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Clear policies on repeatable setup.
DO $$ declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname='public' and tablename in
    ('profiles','student_details','assessment_results','subject_results','career_favourites','action_plans','learning_modules','module_assignments','institutions','portal_settings','appointments','counsellor_notes','audit_events')
  loop execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename); end loop;
end $$;

create policy profiles_select on public.profiles for select to authenticated
using (private.current_profile_active() and ((select auth.uid()) = id or private.is_staff()));
create policy profiles_admin_update on public.profiles for update to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy student_details_select on public.student_details for select to authenticated
using (private.current_profile_active() and ((select auth.uid()) = user_id or private.is_staff()));
create policy student_details_staff_all on public.student_details for all to authenticated
using (private.is_staff()) with check (private.is_staff());

create policy assessments_select on public.assessment_results for select to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy assessments_insert on public.assessment_results for insert to authenticated
with check (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy assessments_update on public.assessment_results for update to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()))
with check (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy assessments_delete on public.assessment_results for delete to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));

create policy subjects_select on public.subject_results for select to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy subjects_insert on public.subject_results for insert to authenticated
with check (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy subjects_update on public.subject_results for update to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()))
with check (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy subjects_delete on public.subject_results for delete to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));

create policy favourites_all on public.career_favourites for all to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()))
with check (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));

create policy actions_all on public.action_plans for all to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()))
with check (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));

create policy modules_read on public.learning_modules for select to authenticated
using (private.current_profile_active() and (is_published or private.is_staff()));
create policy modules_staff_insert on public.learning_modules for insert to authenticated with check (private.is_staff());
create policy modules_staff_update on public.learning_modules for update to authenticated using (private.is_staff()) with check (private.is_staff());
create policy modules_staff_delete on public.learning_modules for delete to authenticated using (private.is_staff());

create policy assignments_read on public.module_assignments for select to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy assignments_staff_insert on public.module_assignments for insert to authenticated with check (private.is_staff());
create policy assignments_staff_update on public.module_assignments for update to authenticated using (private.is_staff()) with check (private.is_staff());
create policy assignments_staff_delete on public.module_assignments for delete to authenticated using (private.is_staff());

create policy institutions_read on public.institutions for select to authenticated
using (private.current_profile_active() and (active or private.is_staff()));
create policy institutions_staff_insert on public.institutions for insert to authenticated with check (private.is_staff());
create policy institutions_staff_update on public.institutions for update to authenticated using (private.is_staff()) with check (private.is_staff());
create policy institutions_staff_delete on public.institutions for delete to authenticated using (private.is_staff());

create policy settings_read on public.portal_settings for select to authenticated using (private.current_profile_active());
create policy settings_admin_update on public.portal_settings for update to authenticated using (private.is_admin()) with check (private.is_admin());

create policy appointments_read on public.appointments for select to authenticated
using (private.current_profile_active() and ((select auth.uid()) = student_id or private.is_staff()));
create policy appointments_student_insert on public.appointments for insert to authenticated
with check (private.current_profile_active() and ((select auth.uid()) = student_id));
create policy appointments_staff_insert on public.appointments for insert to authenticated with check (private.is_staff());
create policy appointments_staff_update on public.appointments for update to authenticated using (private.is_staff()) with check (private.is_staff());

-- No authenticated policy is created for counsellor_notes. Server-side service role only.
create policy audit_admin_read on public.audit_events for select to authenticated using (private.is_admin());

-- Privileges. RLS remains the final row-level guard.
grant usage on schema public to authenticated;
grant select on public.profiles, public.student_details, public.assessment_results, public.subject_results,
  public.career_favourites, public.action_plans, public.learning_modules, public.module_assignments,
  public.institutions, public.portal_settings, public.appointments, public.audit_events to authenticated;
grant insert, update, delete on public.assessment_results, public.subject_results, public.career_favourites, public.action_plans to authenticated;
grant insert, update, delete on public.learning_modules, public.module_assignments, public.institutions to authenticated;
grant update on public.profiles, public.student_details, public.portal_settings, public.appointments to authenticated;
grant insert on public.student_details, public.appointments to authenticated;
revoke all on public.counsellor_notes from anon, authenticated;
revoke all on public.audit_events from anon;
