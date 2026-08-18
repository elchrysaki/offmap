-- Tracks whether a deadline alert has already gone out for this save, so
-- the daily job never emails the same student twice about the same
-- opportunity (CLAUDE.md §7 How it works: "one email when it matters,
-- never a weekly digest").
alter table saved_opportunity
  add column last_alert_sent_at timestamptz;
