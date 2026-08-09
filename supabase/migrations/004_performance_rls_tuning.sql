-- Performance and RLS tuning applied after Supabase advisor review.
create index if not exists action_plans_created_by_idx on public.action_plans(created_by);
create index if not exists counsellor_notes_author_idx on public.counsellor_notes(author_id);
create index if not exists learning_modules_created_by_idx on public.learning_modules(created_by);
create index if not exists module_assignments_assigned_by_idx on public.module_assignments(assigned_by);
create index if not exists module_assignments_module_idx on public.module_assignments(module_id);
create index if not exists portal_settings_updated_by_idx on public.portal_settings(updated_by);

drop policy if exists student_details_staff_all on public.student_details;
create policy student_details_staff_insert on public.student_details for insert to authenticated
with check (private.is_staff());
create policy student_details_staff_update on public.student_details for update to authenticated
using (private.is_staff()) with check (private.is_staff());
create policy student_details_staff_delete on public.student_details for delete to authenticated
using (private.is_staff());

drop policy if exists appointments_student_insert on public.appointments;
drop policy if exists appointments_staff_insert on public.appointments;
create policy appointments_insert on public.appointments for insert to authenticated
with check (
  private.current_profile_active()
  and (((select auth.uid()) = student_id) or private.is_staff())
);
