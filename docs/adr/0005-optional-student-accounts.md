# ADR 0005: Optional student accounts

Status: accepted. Supersedes 0003.

Guest-first remains the default: browsing, saving, and submitting all continue
to work with zero friction and no account. What changes is that a student
account is no longer prohibited — it's an opt-in upgrade, not a requirement.

An account exists for exactly one reason: syncing saved opportunities across
devices. It does not add profiles, feeds, recommendations, notifications,
ratings, comments, or any student-to-student visibility — those stay out of
scope until their own ADR. Signing up requires self-declared 16+ age
confirmation (no parental-consent flow) and, for email/password, a verified
email address before a profile row is created. OAuth (Microsoft, Apple, and
Google once legal pages are live) is an alternative front door to the same
account, not a different tier of it.

Saved opportunities for guests keep using local, device-only storage exactly
as before. Signing in merges any local saves into the account once; from then
on the server is the source of truth for that account.
