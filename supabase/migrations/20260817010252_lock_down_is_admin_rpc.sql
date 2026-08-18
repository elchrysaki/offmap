-- is_admin() is meant only for use inside RLS policies, not as a public API
-- endpoint. Postgres grants EXECUTE to PUBLIC by default on function creation,
-- which exposed it at /rest/v1/rpc/is_admin to anon callers.
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
