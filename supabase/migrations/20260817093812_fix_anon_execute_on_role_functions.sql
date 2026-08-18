-- Supabase grants EXECUTE to anon on every new function via default
-- privileges, separate from the PUBLIC pseudo-role — "revoke ... from public"
-- alone doesn't remove it. anon must be revoked explicitly. Verified with
-- has_function_privilege('anon', ..., 'execute') after applying: false.
revoke execute on function public.is_moderator() from anon, public;
revoke execute on function public.can_edit_opportunities() from anon, public;
grant execute on function public.is_moderator() to authenticated;
grant execute on function public.can_edit_opportunities() to authenticated;
