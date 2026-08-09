-- Security hardening applied to the connected Pathways Supabase project.
alter function private.touch_updated_at() set search_path = pg_catalog;

-- These two narrow RPCs are intentionally SECURITY DEFINER because students do not
-- receive broad UPDATE privileges on the underlying tables. Each RPC checks the
-- signed-in user's active account and row ownership before changing data.
revoke all on function public.complete_my_module(uuid) from public, anon;
revoke all on function public.cancel_my_appointment(uuid) from public, anon;
grant execute on function public.complete_my_module(uuid) to authenticated;
grant execute on function public.cancel_my_appointment(uuid) to authenticated;
