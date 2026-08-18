-- Weekly check for published listings whose applications haven't opened yet.
-- Uses the anon key only to satisfy the Edge Function's verify_jwt requirement
-- (proves the caller has a valid Supabase-issued token) — the function itself
-- uses its own SUPABASE_SERVICE_ROLE_KEY secret internally for DB access, so
-- the powerful key never needs to live in the cron job definition.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'check-application-links-weekly',
  '0 6 * * 1', -- Monday 06:00 UTC
  $$
  select net.http_post(
    url := 'https://uddfpfdekdltftrmvbqh.supabase.co/functions/v1/check-application-links',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZGZwZmRla2RsdGZ0cm12YnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTQyMDUsImV4cCI6MjEwMjMzMDIwNX0.4xzPQyvtq0n31XZWmml36HUPJOcyp9B2VX9Yz47Iatk',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
