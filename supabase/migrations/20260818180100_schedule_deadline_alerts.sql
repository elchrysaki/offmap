-- Daily deadline-alert run — daily rather than weekly (like the link
-- checker) because a 3-day alert window needs day-granularity or students
-- could miss the window entirely between runs.
select cron.schedule(
  'send-deadline-alerts-daily',
  '0 7 * * *', -- 07:00 UTC every day
  $$
  select net.http_post(
    url := 'https://uddfpfdekdltftrmvbqh.supabase.co/functions/v1/send-deadline-alerts',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZGZwZmRla2RsdGZ0cm12YnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NTQyMDUsImV4cCI6MjEwMjMzMDIwNX0.4xzPQyvtq0n31XZWmml36HUPJOcyp9B2VX9Yz47Iatk',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
