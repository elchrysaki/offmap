# CLAUDE.md — OffMap

Read this fully at the start of every session. It is the contract for this repository.

---

## 1. What OffMap is

> OffMap lists selective, time-bounded programmes that a student can apply to, that have an official organiser, a real application route, and a benefit beyond a CV line.

**Deliberately excluded:** ordinary jobs, degree scholarships, generic MOOCs, one-hour webinars. If a feature or a listing pushes toward those categories, stop and say so.

**The product thesis, in one line:** the opportunities students actually get into — including the ones that never make it online.

**v1 in one sentence:** a filterable directory of selective student opportunities where every listing states its deadline, its funding and its eligibility, and where a student can be told before it matters to them.

The audience is broad — students who want more than the default path. The listing set is narrow. Never widen the listing set to match the audience.

---

## 2. Non-negotiables

These are settled. Do not propose alternatives; flag a conflict if code would break one.

1. **Students never pay.** No paywall, no premium tier, no `plan` column, no copy anywhere mentioning upgrades. Revenue comes from organisations, later.
2. **Student data is never sold or exposed.** No student name, email, or list leaves OffMap. No student-to-student visibility of any kind — no messaging, comments, or public profiles.
3. **Paid placement is always labelled and never affects organic ranking.** Partner spotlight is a separate module with a fixed slot count and the plain-text label _Paid placement_. Closing soon and Near you contain zero paid entries, ever.
4. **Never publish an inference.** See §6.
5. **Nothing publishes without funding, eligibility and `last_verified_at`.** Enforced by the `publish_gate` CHECK constraint on `opportunity` — confirmed live against the hosted database 20 Aug 2026, not just documented here.
6. **An expired listing must never reach a client.** Enforced by RLS, not a component filter — confirmed live 20 Aug 2026 (see §5).
7. **Server-side rendering for all listing, archive and detail pages.** SEO is the only channel that compounds. Client-side rendering of the catalogue is a product failure, not a performance one.
8. **Accounts are 16+, self-declared.** No parental-consent flow is ever built. Under-16s browse freely with no account and no alerts.
9. **Decorative colour is allowed throughout the product, including the core browse/card register** — not status-only (reversed 17 Aug 2026). Vermilion and pink still mean exactly one thing each and nothing else; see §7.
10. **One source of truth: Supabase.** Not the repo, not a spreadsheet, not a second table.

---

## 3. Stack

| Layer                   | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                | Next.js (App Router, TypeScript). `next@16.2.6`, `react@19.2.8`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Styling                  | Tailwind v4, design tokens as CSS custom properties in `src/app/globals.css`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Components               | Hand-rolled. Radix primitives allowed **only** for dialog, popover, select, and combobox, for keyboard and screen-reader behaviour — this is still unexercised policy, not current implementation: no `@radix-ui/*` package is installed yet. Other notable deps actually in use: `three` + `d3-geo` (the hand-rolled globe on the landing page, `components/shell/globe.tsx`, ~880 lines), `framer-motion` (a handful of shell-register interactions), `@vercel/analytics` + `@vercel/speed-insights`. No component library — the 2px borders and hard offset shadows fight every default theme.                                                                                                    |
| Hosting                  | Vercel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Database, auth, storage  | Supabase, region `eu-central-1` (Frankfurt) — permanent. Project "OffMap Website", ref `uddfpfdekdltftrmvbqh`, Postgres 17.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Email                    | Resend, EU region. From `alerts@contact.offmap.gr`, reply-to `hello@offmap.gr`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Map (October)            | MapLibre + Protomaps or MapTiler free tier. **Never Mapbox**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Submission & review      | Web dashboard only. Ambassadors and moderators sign in at `/admin` (email/password) and create, edit, publish, or reject listings directly against Supabase. **No GitHub involvement for ambassadors or moderators** — GitHub is source control for Elena's own code, nothing else.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Student auth             | Supabase Auth. Guest-first stays the default (ADR 0005) — an account is an _opt-in_ upgrade that exists only to sync saved opportunities across devices. **Exception (19 Aug 2026):** `/submit` requires a signed-in account; signed-out visitors are redirected to `/sign-in?next=/submit` (RLS insert policy is `authenticated`-only, `supabase/migrations/20260819171716_require_auth_for_lead_submission.sql`). Email/password or OAuth (Microsoft, Apple live; Google code-complete but flagged off — see §15). Password-reset emails link with `?token_hash=...&type=recovery` directly rather than through Supabase's own `/verify` redirect, because email-client link-scanners were silently pre-fetching and burning those single-use tokens; `/reset-password` handles the token via `verifyOtp`. Self-declared 16+, no parental-consent flow. `profiles.role` (`ambassador`/`moderator`/null) is never self-assignable through any signup path. |
| AI verification          | **Gemini `gemini-3.6-flash`**, via `@google/genai`'s **Interactions API** (`ai.interactions.create` — not the classic `generateContent`, which 404s on new API keys for this model shape). Two tools: `url_context` (fetch the given source URL first) and `google_search` (fallback only, if that link is broken or unrelated). Two call sites, both funneling through the single shared function `runAiResearchForOpportunity` in `src/lib/admin/ai-research.ts`: the admin "Verify with AI" button (single-row and bulk) and the weekly `check-application-links` Edge Function. Confirmed at code level, 20 Aug 2026: neither call site writes a gate field directly — see §6.                                                                                                                                                                                                                                                                                                                                             |

**App strategy is Route D:** one backend, two front ends. Rules live in the database so a future native client inherits them rather than reimplementing them. PWA before public launch. No Capacitor, no React Native, no Expo — that branch is archived.

---

## 4. Repository layout

```
CLAUDE.md
supabase/
  migrations/                 numbered, forward-only, never edited after apply — 16 applied
  seed.sql                    taxonomy rows only, never listings
  functions/
    check-application-links/  weekly Gemini check for missing apply_url, pg_cron Monday 06:00 UTC
    send-deadline-alerts/     daily Resend sender for the three per-save notify flags, pg_cron 07:00 UTC — not an AI call
src/
  proxy.ts                    Next.js middleware equivalent — refreshes the Supabase session on every request
  app/
    (public)/                 server components. page.tsx (landing — hero/reel/ambassador spotlights are still
                               hardcoded mock content, not DB-driven), browse (the real dashboard: filters, effort
                               ladder, listing rows), opportunities/[id] (detail), community (editorial, also has
                               mock ambassador cards), contact (a bare mailto link, no form), get-app (PWA install,
                               fully built), licenses (placeholder text), privacy/terms (render docs/legal/*.md via
                               a literal path each), profile (auth-aware, renders the saved-opportunity board),
                               submit (account-gated intake form). No /about yet.
    (auth)/                   sign-in, sign-up, forgot-password, reset-password, confirm-age (OAuth-only fallback),
                               callback (the single landing spot for both email-confirmation and OAuth), onboarding
    admin/                    ambassador/moderator dashboard: queue (page.tsx), new listing, edit/publish/reject
                               (opportunities/[id]/), single-row + bulk "Verify with AI"
  components/
    core/                     quiet register — opportunity-row (the `<lg` browse layout), opportunity-card (the
                               `lg:` and up desktop grid, landed 20 Aug — see §7), countdown-numeral,
                               not-online-stamp, effort-ladder, taxonomy-filter (generic pill bar behind 7 of
                               browse's 9 filter controls), save-button (gained a `compact` prop for cards),
                               country-filter, type-filter, sign-in-banner, auth-save-sync, service-worker-register
    shell/                    loud register — site-header, site-footer, bottom-nav, tablet-menu, hero,
                               how-it-works, opportunities-reel, ticker, network-globe/globe, radial-reveal-button,
                               reveal, empty-state, sign-in-form, sign-up-form, reset-password-form, submit-form,
                               onboarding-flow, saved-board, account-settings (email/password change, sign-out),
                               country-intro (one-time full-screen country/Global picker, first `/browse` visit),
                               browse-tour (3-step first-visit walkthrough, same one-time pattern)
  lib/
    ai/                       verify-opportunity.ts — the Gemini call itself
    admin/                    ai-research.ts — the one shared write path both "Verify with AI" call sites use;
                               this is where §6's gate-field boundary actually lives in code
    supabase/                 server client, browser client, generated types
    queries/                  server-only data access (admin-opportunities, current-user, merge-local-saves,
                               opportunities — now resolves the taxonomy pill filters through their junction
                               tables, profile — now also exposes a signed-in student's onboarding field picks as
                               a default-filter source, saved-opportunities, submit-lead, taxonomy)
    local-saved.ts            guest (signed-out) saved-opportunity storage, device-local
    colors.ts, countries.ts, format.ts, legal-doc.tsx, opportunity-publish-gate.ts, profile-labels.ts
docs/                         pillar docs + ADRs — almost entirely stale (pre-Supabase Payload/Expo/OpenAI stack).
                               Don't trust anything under docs/ over this file or the actual code. See §15.
.github/
  workflows/                  ci.yml — install → format:check → tsc --noEmit → next build against the real app
```

**`apps/` and `packages/` (design, taxonomy, contracts) are fully deleted from disk**, not merely unreferenced — confirmed 20 Aug 2026. `pnpm-workspace.yaml` still declares a `packages/*` glob pointing at nothing; harmless, trivial cleanup.

**Migrations are forward-only.** Once applied to the hosted project, a migration is never edited. Fix by adding a new one.

**Reads and writes normally go through `lib/queries/`, not straight from a component.** In practice a handful of interactive client components — `SaveButton`, `OnboardingFlow`'s `finishOnboarding`, `SavedBoard` — call the RLS-scoped browser Supabase client directly rather than routing through `lib/queries/`. That's an accepted exception, not drift: RLS enforces the same boundary either way for a simple insert/update/delete. Keep it narrow — route anything more than that through `lib/queries/` so RLS assumptions stay in one place.

**Multiple Claude Code sessions may be active on this repo at once, and regularly are.** Run `ListAgents` before making schema, `/admin`, or opportunity-row-shape changes, and check recent migrations/`docs/adr/` for decisions another session may have already made. §14's "one tool touches the codebase at a time" rule is aspirational, not descriptive — Elena is aware and actively managing it.

---

## 5. Database rules

**Taxonomy is data, not schema.** `type` and `field` are lookup tables with `label_en`, `label_el`, `sort_order`. Adding a category is an `INSERT`, never a migration. Only closed sets that will never grow or need translation are Postgres enums: `format`, `reach`, `review_state`, `funding`, `prep_time`, `source_type`, `deadline_precision`, `profile_role`, `profile_status`, `experience_level`, `saved_status`.

**Several taxonomies are genuinely multi-select**, not single-FK — a listing can be both "Engineering" and "Policy". `field`, `academic_level`, `geo_scope` (includes `worldwide`), `audience_group`, and `funding_feature` each get their own `opportunity_<taxonomy>` junction table, RLS'd to follow the parent `opportunity` row's own visibility rules. A parallel pair, `profile_field`/`profile_goal`, does the same for a student's own onboarding preferences.

**`opportunity` also carries a set of free-text detail columns** beyond the core gate fields: `host_city`, `eligible_countries`, `funding_details`, `audience_notes`, `specific_majors`, `application_requirements`, `additional_information`, `expected_application_season`. These render as the detail page's collapsible sections; none of them are gate fields.

**Derived values are never stored.** Computed in Postgres, exposed through the `opportunity_public` view:

- `days_remaining` — from `deadline_at`
- `status` — open / closing_soon / opens_soon / rolling / closed, from the dates
- the effort-ladder rung — from `reach` + `country` + `prep_time`

A stored `status` column that must be kept in sync with a deadline _is_ the EAGxBerkeley bug. Never reintroduce one.

**Dates keep `_raw` and normalized.** `deadline_raw` preserves what the source page literally said. `deadline_precision` (`exact` / `month` / `unknown` / `rolling`) stops "closes in March" becoming a fake exact date. There is **no display date column** — the UI formats one way: `9 August 2026`.

**The publish gate is a CHECK constraint** (`publish_gate`, confirmed live: `review_state <> 'published' OR (funding, eligibility, reach, prep_time, last_verified_at, official_url, apply_url are all not null)`). No client, no pipeline, and no manual insert can bypass it. If a task requires relaxing that constraint, stop and ask.

**Required fields differ by state:**

|        | `lead` requires         | `published` requires |
| ------ | ----------------------- | --------------------- |
| Fields | `official_url` + `type` | everything above       |

An ambassador sends a link and a type. Everything else is OffMap's job.

**RLS is on for every table from creation.** Confirmed live 20 Aug 2026: the `published and not expired` policy on `opportunity` (`anon, authenticated`, `SELECT`) reads exactly `review_state = 'published' AND (deadline_at IS NULL OR deadline_at >= now())` — expiry is enforced at the data layer, not in a view or a component filter. Note the implication: a published row with `deadline_at` left null is treated as never-expiring, which is only correct for `rolling` (or not-yet-open) listings — keep that pairing consistent when writing data, including during the §12 step 8 migration.

**Known database hygiene items** (from a live Supabase advisor scan, 20 Aug 2026 — none urgent, none block launch, worth a batch cleanup pass before the row count grows past a handful):

- Leaked-password protection is off in Auth settings (a one-click enable, checks new passwords against HaveIBeenPwned).
- The `pg_net` extension lives in the `public` schema instead of its own.
- `rls_auto_enable()` is still callable by `anon` via `/rest/v1/rpc/rls_auto_enable`. Its two siblings, `is_moderator()` and `can_edit_opportunities()`, were already locked down to `authenticated`-only in migrations `20260817010252_lock_down_is_admin_rpc.sql` and `20260817093812_fix_anon_execute_on_role_functions.sql` — this one was missed by that pass.
- Several RLS policies re-evaluate `auth.<fn>()` per row instead of `(select auth.<fn>())` — a standard Postgres RLS performance pattern, cheap fix, matters at scale not at today's row counts.
- `opportunity` and its taxonomy junction tables carry overlapping permissive policies for `authenticated` (ambassador + moderator + public-visibility policies all apply to the same action and all get evaluated) — a consolidation opportunity, not a correctness bug.

---

## 6. The never-publish-an-inference rule

The only thing OffMap sells is that someone checked. This rule protects it.

- Every field drafted by the pipeline carries a confidence flag.
- **Anything not literally on the source page renders empty, not guessed.** Empty is honest; a guess is a lie with a deadline attached.
- `excluded_claims` and `missing_information` are recorded, not filled.
- **Deadlines and funding always get human eyes.** Everything else can be a fast skim.
- An AI that writes "fully funded" onto a programme that isn't destroys the product. Treat that as the highest-severity bug class in this repo.
- **Concrete implementation, confirmed at code level 20 Aug 2026:** both AI call sites — the admin "Verify with AI" button/bulk flow and the weekly `check-application-links` function — funnel through `runAiResearchForOpportunity` (`src/lib/admin/ai-research.ts`), which only ever writes `ai_research` (jsonb), `ai_research_at`, `apply_url_candidate`, `apply_url_candidate_note`, and — only for the admin flow, and only while a row is still `lead` — bumps `review_state` to `in_review`. It never touches `apply_url`, `funding`, `deadline_at`, `eligibility`, or any other gate field. A moderator reads the AI findings and copies what's correct into the real fields by hand. If you're ever tempted to make either call site write straight to a gate field "since it's usually right," that's this rule's failure mode exactly.

If you are writing code that fills a gap with a plausible value, you are writing the bug this rule exists to prevent.

---

## 7. Design system

**The one rule everything follows: the shell is loud, the core is quiet.**

- **Shell** — landing, `/about`, empty states, `/submit`, share cards. Full collage: halftone, cut-paper shapes, tape, saturated blocks, rotated stickers. `/submit` is a "organising something selective, or know someone who is?" contact-style form — a signed-in student account is required (§3), but it's still not the authenticated _ambassador_ tool at `/admin`. It writes a `lead` row into the same review queue ambassadors work from; it cannot set `review_state` or bypass the publish gate (enforced by a restrictive RLS `with check`, not just app logic).
- **Core** — browse, rows, cards, detail, filters, alerts. Cream, ink base, plus category colour. No texture, no collage.

A 16-year-old with nine days to a deadline needs the quiet register. Giving it to them _is_ the personality. Decorative/category colour is allowed in the core register (non-negotiable #9) — what stays fixed: vermilion means deadline urgency and nowhere else, pink means the NOT ONLINE stamp and nowhere else, and the countdown numeral / stamp / effort ladder keep their exact functional meaning. Category colour (one of `--cobalt`/`--marigold`/`--violet`/`--teal`/`--lime`, mapped consistently per `type_id`) is additive on rows and cards for scannability — never a replacement for the status colours.

### Tokens

```css
--paper: #f5efe3; /* page ground */
--card: #faf6ea; /* card and panel surface */
--ink: #141210; /* text and borders */
--muted: #8a7f6b; /* meta text */
--rule: #ded4c2; /* hairlines */

--vermilion: #f0421c; /* DEADLINES ONLY — never decorative, never a category */
--pink: #f5399b; /* the NOT ONLINE stamp only */

--lime: #c9e547; /* field tiles and filters only */
--cobalt: #2b57e0;
--marigold: #ffc01e;
--violet: #8b4fe0;
--teal: #0fb3a1;
```

`globals.css` also defines derived, unnamed-in-spec tokens worth knowing about: `--border-width` (2px), `--shadow-offset`/`--shadow-offset-sm` (the ink hard-shadow), `--shadow-offset-paper`/`--shadow-offset-paper-sm` (the paper-coloured variant for ink-filled buttons), `--radius-card` (18px), `--radius-panel` (28px), `--radius-pill` (20px), `--radius-stamp` (3px) — these are the implementation of the rules below, not a deviation from them.

Vermilion appears only within 14 days of a deadline, so its meaning is learned in one visit. Category colour may appear on a listing row as a small type tag — kept to one flat token colour per type, no gradients, doesn't touch the deadline-numeral colour logic.

Borders 2px `--ink`. Hard offset shadow `5px 5px 0`, no blur, no gradients. Radius: 18px cards, 20px pills, 3px stamps and tiles.

### Type

- **Fraunces** (variable, `SOFT 70 / WONK 1`, weight 800–900) — display and countdown numerals. Never below 20px, never all-caps beyond four words.
- **Archivo** (variable) — body, UI, buttons, forms. At `wdth 72`, uppercase with 0.13em tracking for eyebrows and small labels.
- **Bungee** — stamps and stickers only. Loads last.

Subset to Latin, preload the two variable files, no layout shift on swap.

**Open dependency: Archivo has no Greek.** Any live Greek string in the UI needs a Greek-capable face. Unresolved — flag it rather than silently substituting a fallback. Not urgent while live copy is still English/placeholder throughout the site (see §15).

### The three signature elements

1. **The countdown numeral.** Every listing leads with days remaining, Fraunces 30–46px, fixed-width left column so numerals form a vertical spine down the page. Vermilion 1–13 days, ink 14–60, muted 61+. `rolling` renders `ROLLING`; `opens_soon` renders `OPENS MAR`. **The slot is never empty** — the rhythm never breaks.
2. **The NOT ONLINE stamp.** Bungee 10px, pink ground, cream text, rotated -3deg. Fires on `reach: local`, nowhere else. The product thesis compressed into one mark.
3. **The effort ladder as primary navigation**, above type and field filters:

| Rung         | Filter logic                                               |
| ------------ | ------------------------------------------------------------ |
| Coffee break | `reach: local` + own country + `prep_time: under_an_hour`   |
| Weekend trip | `reach: national` + `prep_time: a_weekend`                  |
| Aim higher   | `reach: international`                                       |
| Off path     | `reach: local` in a country other than the user's            |

**Open discrepancy (20 Aug 2026):** the desktop-redesign commits below reordered `/browse` so the effort ladder now renders *after* the full filter block (country, type, and 7 taxonomy pill bars), not above it as this rule says. That's either an intentional reprioritization now that browse has 9 filter controls instead of 2, or a regression against "primary navigation" — worth a real decision, not a silent fix either direction.

### Component rules

- **Row** (`/browse`, below the `lg` breakpoint): numeral column 56px right-aligned · title Fraunces 16px · meta Archivo 13px muted reading `funding · eligibility · location, format` · stamp right if local. 1.5px hairline separator. No card, no border, no shadow. Matches this exactly (`components/core/opportunity-row.tsx`).
- **Card** (`/browse` at `lg:` and up, plus the "new in your sector" section): category pill top-left, quiet Save top-right, numeral column left, title Fraunces 21px, organiser and location beneath, hairline, two-column grid with condensed-caps `FUNDING` / `WHO CAN APPLY`. Bottom row: provenance left, stamp right. **Live as of 20 Aug 2026** (`components/core/opportunity-card.tsx`, wired into a responsive 2–3 column grid by the desktop-redesign commits) — its Save control is now the real `SaveButton` via a new `compact` prop (icon + label only, no pill chrome, no notify bell), replacing the static placeholder this file used to flag. Row and card are the same data at two breakpoints of the same page now, not "row vs. a separate featured module."
- **Card rule, non-negotiable:** answers when it closes, what it costs, who can apply — without a click. No description on a card or row.
- **Provenance line on every card and detail page:** _"Verified 9 August by Elena"_ or _"Submitted by Nikos. Verified 9 August."_
- **Empty state:** shell register, _"Nothing here yet. Tell me when there is."_ plus one **Alert me** button — the design intent is a subscription prompt on every empty result. **Not yet built as designed:** the live empty state shows this copy, but its button currently just says alerts aren't live yet and writes nothing. There is no `filter_alert` table and never was one built — drop that specific mechanism from future planning. The real alert infrastructure that does exist is per-save notify flags on `saved_opportunity` (`notify_opens`/`notify_start_writing`/`notify_closing`, see §12 step 7) — when this gets built, it should almost certainly reuse that instead of inventing a parallel table.
- **Zero-count categories are hidden**, not shown as empty chips.

### No raster assets

Halftone is a CSS `radial-gradient`. Cut-paper shapes are inline SVG polygons. Tape and torn edges are rotated divs. Nothing in the visual system requires an image file — it costs €0 and keeps the product fast on the low-end Android the median user is holding.

### Do not build

Cartographic sage, topographic palettes, expedition imagery, terminal/mono aesthetics, emoji categories, handwriting fonts, gamified language (quests, levels, adventures), "all fields worldwide" or any coverage claim, an "Other Opportunities" category. Each was considered and killed for a reason.

---

## 8. Copy rules

Active voice, plain verbs, sentence case. A button's label matches the confirmation it produces — **Save opportunity** produces _Saved_. Errors say what happened and how to fix it, without apologising. One date format everywhere: `9 August 2026`. Never claim coverage; claim verification.

---

## 9. Where to go fast, where to slow down

> **AI is cheap for code that fails loudly and expensive for code that fails silently.** A broken page is visible in one second. A broken RLS policy looks like a working website right up until someone reads another student's data.

**Go fast:** scaffolding, browse, filters, detail pages, admin queues, converting existing files into rows, first drafts of migration SQL.

**Slow down and explain before writing:** RLS policies, auth flows, anything touching the users table, the publish-gate constraint, the archive job.

**Never do without asking first:**

- Relax or drop a CHECK constraint
- Disable RLS on any table, even temporarily
- Edit an already-applied migration
- Add a dependency that pulls in a design system or UI kit
- Add a `plan`, `tier`, `price` or `premium` column
- Store a derived value
- Add a second place where listings live
- Commit a key, token, or `.env` file

---

## 10. Accessibility and quality floor

Unannounced, not a feature. Responsive down to 360px. Visible keyboard focus. `prefers-reduced-motion` respected. WCAG AA contrast verified — **check the lime and marigold tiles specifically**, they are the two that fail. Every interactive element reachable by keyboard. The admin review queue is keyboard-driven: approve, reject, request info.

---

## 11. Definition of done

A change is not done until:

- [ ] It renders server-side where it is public
- [ ] It works at 360px wide
- [ ] Keyboard focus is visible and the flow is completable without a mouse
- [ ] No expired listing appears anywhere in it
- [ ] No inferred value is displayed as fact
- [ ] Types are generated from the database, not hand-written (`supabase gen types typescript`)
- [ ] It touches one source of truth

This checklist runs on every change, continuously — it is not a separate "responsive pass" or "accessibility pass" scheduled for later. Treat "works at 360px" the same way you treat "renders server-side": part of shipping the feature, not a follow-up phase.

---

## 12. Build order

Do not reorder. Each step assumes the one above.

1. **Supabase project created** in `eu-central-1`. ✅ done
2. **Migrations applied**, types generated, taxonomy seeded. ✅ done — 16 migrations applied.
3. **RLS tested by cross-account read.** ✅ done — reconfirmed by direct policy inspection 20 Aug 2026.
4. **Admin dashboard auth** — email + password for ambassadors/moderators at `/admin`, gated by `profiles.role`. ✅ done.
5. **Ambassador/moderator review dashboard** — create, edit, publish, reject. ✅ done, and richer than originally scoped: single-row and bulk "Verify with AI" (3-way concurrency cap, per-row error isolation), and a live `publish_gate` preview on the edit form showing exactly which fields are still missing.
6. **Browse, filters, detail, listing row.** ✅ done, and substantially expanded 20 Aug in a 4-commit "desktop redesign": `/browse` now renders the card grid at `lg:` and up (rows below that), a one-time animated country/Global picker on first visit, pill-bar filters for all 5 remaining multi-select taxonomies plus format and deadline range (9 filter controls total), a signed-in student's onboarding field pick applied as a one-load default filter, and a first-visit 3-step tour. See §7 for the one open discrepancy this introduced (effort ladder now below the filters, not above).
7. **Save + deadline alert**, end to end into a real inbox. Save is ✅ done, and richer than originally scoped — not a boolean, a full Goals/Apply/Applied/Archived board (`SavedBoard`) with three independent per-save notify flags. Alert-sending is ✅ built and also richer than scoped: `send-deadline-alerts` fires three independent Resend sends per save (applications open / start writing / closing soon, each with its own sent-timestamp), not the single generic mechanism this section originally sketched. Confirmed correct via manual invocation. **Still unproven with a real inbox** — the live `opportunity` table has 2 rows and `saved_opportunity` has 0, so nothing has triggered a real send yet. Downstream of step 8, not blocked by anything in the alert code itself.
8. **Existing ~25 listings migrated** — funding and eligibility filled, anything that can't state them goes back to `lead` or gets killed. **Not started.** `data/opportunities.json` (3,050 lines) still sits unmigrated in the repo; the live `opportunity` table has 2 rows. **This is the current top-priority gap** — nearly every ship gate in §13 traces back to it, and it should be running in parallel with everything else, not queued behind other work.
9. **`/about`** — definition, editorial standard, exclusion list, paid-placement rule. **Not built.**
10. **`/submit`** — intake form feeding the same review queue ambassadors use in `/admin`. **Built and confirmed working end to end at the code level**: honeypot field, `https://` URL validation, a real taxonomy `type_id` check, and a restrictive RLS `with check` that explicitly nulls every gate/AI/provenance field so a crafted request can't smuggle a value past ambassador review. Gated behind a signed-in account, nav-wired. Not yet exercised by a real ambassador — see §13.
11. **Landing + featured modules**, lite profile, eligibility chips, match alerts, weekly digest, prep-time alerts. The landing page (`/`) and `/community` exist and render, but their hero, opportunities reel, and ambassador spotlights are confirmed hardcoded mock content, not database-driven — don't mistake "renders nicely" for "wired to real data." Eligibility chips, match alerts, and weekly digest are not built. Lite profile **is** built (see §15) — the "new in your sector" section on `/browse` is explicitly a placeholder (newest 3 listings, not real sector-matching) pending that backend work.
12. **PWA**, then October: map, archive pages, contributor dashboard, deadline ruler. PWA is done and ahead of schedule: manifest, a real service worker that deliberately never caches Supabase/listing data (protects non-negotiable #6), and a fully working `/get-app` install flow with per-browser instructions.

**Optional student accounts (ADR 0005)** landed alongside steps 5–7, ahead of where the original build order put it. Guest-first is still the default; an account only exists to sync saves across devices, plus the one `/submit` exception in §3.

---

## 13. Ship gates for public launch

All must be true. **If a gate fails, ship late.**

- [ ] Zero expired listings visible anywhere — **structurally enforced** by RLS (confirmed 20 Aug 2026, see §5); re-verify at real volume once step 8 lands, not just against today's 2 rows.
- [ ] Every published listing has funding, eligibility and `last_verified_at` — **structurally enforced** by the `publish_gate` CHECK constraint (confirmed 20 Aug 2026, see §5). Mechanically impossible to violate, not just a process rule.
- [ ] 50+ verified and currently open — 2 published rows today. Entirely blocked on step 8.
- [ ] No single source accounts for more than a third of listings — blocked on step 8.
- [ ] A deadline alert has arrived in a real inbox, not merely been logged as sent — send path built and confirmed correct; blocked on step 8 (need real saves against real deadlines to trigger one).
- [ ] A real ambassador — not Elena — has put a listing through the form end to end — not done.
- [ ] `/about` live — not built.
- [ ] RLS tested by attempted cross-account read — done; policies reconfirmed unchanged 20 Aug 2026.

---

## 14. Working with Elena

Sole owner, sole builder, roughly 20 hours a week of which about 8 is build. Direct, expects pushback rather than agreement. Corrections stick — if she says a premise is wrong, treat it as wrong and update this file.

- **Say when something won't fit in the time available.** A cut named early is worth more than a feature half-built.
- **Do the click-work list by hand:** account signups, DNS records, console clicking, testing that login works, testing that an alert arrives. Don't spend tokens on these, and don't offer to.
- **One tool touches the codebase at a time.** Concurrent AI edits cost more than they save. In practice this hasn't been holding — check `ListAgents` before touching shared surface.
- **When a decision belongs to another pillar, name it, park it, move on.**

---

## 15. Current state

**As of 20 August 2026**, reconfirmed against the live database and codebase (schema/RLS/CHECK-constraint inspection plus a full route-by-route code audit), not just carried forward from prior notes.

**Infrastructure**
- Domain `offmap.gr` (Papaki), `hello@offmap.gr` live. Resend on `contact.offmap.gr`, EU region — verification status not reconfirmed this pass, worth a five-minute check.
- Supabase project ref `uddfpfdekdltftrmvbqh`, Postgres 17, 16 migrations applied. `GEMINI_API_KEY` in place.
- `.env.example` is still the stale pre-Supabase template — doesn't list the real required vars (`GEMINI_API_KEY`, `RESEND_API_KEY`, Supabase URL/anon key). Untouched cleanup item.
- Two migrations (`schedule_application_link_checker`, `schedule_deadline_alerts`) embed a long-lived anon JWT directly in the migration SQL so `pg_cron` can call the Edge Functions. Not a secret exposure — anon keys are public by design — but brittle: if that key is ever rotated, both cron jobs break silently with nothing obvious surfacing the failure.

**Schema & data**
- Full schema live and confirmed matching §5: taxonomy lookups + junctions, `opportunity` (publish gate + AI-suggestion columns + the free-text detail columns), `profiles`, `saved_opportunity` (status board + 3 independent notify flags), all RLS'd.
- **`opportunity` currently has 2 rows.** `data/opportunities.json` (3,050 lines, ~25 listings) is still sitting in the repo, unmigrated. This is the top blocker for soft launch — see §12 step 8.
- Minor DB hygiene items open, none urgent — see §5.

**App surface**
- Every route in §4's tree exists and renders. Four surfaces look finished but aren't wired to real data: the landing page's hero/reel/ambassador spotlights, `/community`'s ambassador cards (the same mock data, duplicated), `/contact` (a bare mailto link), `/licenses` (placeholder text).
- Auth: email/password (the "already registered" case is caught and redirected to `/sign-in` with a clear notice, not silently dropped) plus Microsoft and Apple OAuth; Google is code-complete but flagged off. **The legal-doc blocker on Google OAuth is gone**: `docs/legal/privacy-policy.md` and `terms.md` have real values (Elena Chrysaki, Adrianou 26, Keratsini, 18755, Greece) and are rendered live at `/privacy` and `/terms`. What's left for Google OAuth is Google Cloud Console + Supabase provider configuration — click-work, not code. `/callback` now accepts `token_hash`/`type` links (Confirm Signup, Magic Link) the same way `/reset-password` already did, for the same link-scanner-burns-the-token reason.
- `/profile` gained real account settings (`account-settings.tsx`): change email (Supabase's own confirmation-link flow), change password (deliberately reuses the `/forgot-password` email flow rather than a direct field, so a hijacked session can't silently lock the real owner out), and sign out. Verified end to end against a real test account, including confirming sign-out actually clears the server-side session.
- Onboarding (4 steps: fields → goals → experience level → a live recommended-opportunities sweep) and the profile page's Goals/Apply/Applied/Archived saved-opportunity board are both built and confirmed working against the real schema.
- `/submit` is account-gated, nav-wired, confirmed working end to end at the code level; not yet exercised by a real ambassador.
- Admin dashboard has single-row and bulk "Verify with AI," confirmed to never write AI output to a gate field directly.
- PWA (`manifest.webmanifest`, `sw.js`, `/get-app`, the marquee `loading.tsx` screen) is built and ahead of where the build order put it.
- **`/browse` desktop redesign (20 Aug, 4 commits)**: a responsive card grid at `lg:` and up alongside the existing row list, a one-time animated country/Global intro (`prefers-reduced-motion`-aware), pill-bar filters for the 5 remaining multi-select taxonomies plus format and deadline range, a signed-in student's onboarding field pick applied as a default filter, and a first-visit 3-step tour (no gamified language, per §7's "do not build" list). Also fixed a case-sensitive country-matching bug in `listBrowseOpportunities` that was silently dropping rows. See §7 for the one open design discrepancy this introduced (effort ladder ordering).

**AI pipeline**
- Model is **`gemini-3.6-flash`** via the Interactions API — earlier notes in this file said `gemini-2.5-flash`/`generateContent`; that shape 404s for new keys against this model. Corrected throughout §3/§6 above.
- Deadline-alert sending is its own, non-AI function — three independent Resend sends per save (opens / start-writing / closing), not the single generic `filter_alert` concept sketched in an earlier version of §7. That specific mechanism was never built; the real one already covers the same need and then some.

**Known code-level loose ends**
- **Uncommitted in the working tree right now**: Vercel Analytics/Speed Insights wiring in `layout.tsx`/`package.json`/`pnpm-lock.yaml`/`next-env.d.ts`. Not reviewed or committed by this session — reconcile (commit deliberately or roll back) before building further on those files. (The sign-up/reset-password form-extraction diff flagged earlier the same day is resolved — it landed in the "Add forgot-password flow" commit below.)
- `packages/` and `apps/` are fully deleted from disk, confirmed 20 Aug — `pnpm-workspace.yaml`'s `packages/*` glob is the only remaining trace, harmless.
- `docs/` is stale well beyond what earlier notes here said: `ARCHITECTURE.md`, `AI-PIPELINE.md`, `ADMIN.md`, `BRAND.md`, `PRODUCT.md`, `RELEASE.md`, `SECURITY.md`, `SHOWCASE_DEPLOYMENT.md`, `future.txt` all still describe the deleted Payload/Expo/OpenAI/GitHub-issue stack (`BRAND.md` even documents a completely different palette and type system than the one actually in `globals.css`). `DATA_MODEL.md` is genuinely half-right — its profiles/saved-opportunity sections match reality. ADRs 0001/0002 describe deleted infrastructure; 0003 and 0005 are accurate as history; 0004's concept still holds but its described mechanism (a Payload draft/publish flag) is stale — the real mechanism is the `publish_gate` CHECK constraint. None of this blocks launch; it's a trust hazard for whichever session reads `docs/` next without this warning.

**Multiple Claude Code sessions are still working this repo concurrently.** A peer session ran for roughly 4 hours during this same day and landed 7 commits directly to `main` while this session waited for it to finish before touching shared files: `account-settings.tsx` (§15 above), the `/callback` token_hash fix, the forgot-password/reset-password/sign-up rework, and the full 4-commit `/browse` desktop redesign. A new peer session started immediately after. §14's "one tool at a time" still isn't holding in practice; keep checking `ListAgents` before touching schema, `/admin`, or the opportunity row shape.

**Soft launch 7 September 2026. Public launch week of 28 September. Do not slip past 12 October** — after that the peak is spent rather than used, and the next real window is January.

*Housekeeping note: this section previously accumulated as a running, date-stamped changelog (separate 17/19/20 Aug blocks stacked on top of each other), which had drifted into self-contradiction — e.g. a "not yet rendered" note about the legal pages sitting next to a later note saying it had been fixed, and a "still needs confirming orphaned" note about `packages/` sitting above a later note saying it was already deleted. It's compacted here into one current snapshot. Keep doing that going forward: when this section gets long enough that two entries disagree, compact rather than append indefinitely.*
