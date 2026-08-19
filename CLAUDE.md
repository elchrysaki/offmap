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
5. **Nothing publishes without funding, eligibility and `last_verified_at`.** Enforced in the database, not in the app.
6. **An expired listing must never reach a client.** Filtering in a component is not sufficient.
7. **Server-side rendering for all listing, archive and detail pages.** SEO is the only channel that compounds. Client-side rendering of the catalogue is a product failure, not a performance one.
8. **Accounts are 16+, self-declared.** No parental-consent flow is ever built. Under-16s browse freely with no account and no alerts.
9. ~~Colour encodes status, never decoration.~~ **Superseded 17 Aug (Elena's call):** decorative colour is allowed throughout the product, including the core browse/card register — not status-only anymore. See §7.
10. **One source of truth: Supabase.** Not the repo, not a spreadsheet, not a second table.

---

## 3. Stack

| Layer                   | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework               | Next.js, App Router, TypeScript                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Styling                 | Tailwind v4, design tokens as CSS custom properties in `globals.css`                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Components              | Hand-rolled. Radix primitives allowed **only** for dialog, popover, select, and combobox, for keyboard and screen-reader behaviour. No component library — the 2px borders and hard offset shadows fight every default theme.                                                                                                                                                                                                                                                                                          |
| Hosting                 | Vercel                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Database, auth, storage | Supabase, region `eu-central-1` (Frankfurt) — permanent                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Email                   | Resend, EU region. From `alerts@contact.offmap.gr`, reply-to `hello@offmap.gr`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Map (October)           | MapLibre + Protomaps or MapTiler free tier. **Never Mapbox**                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Submission & review     | Web dashboard only. Ambassadors and moderators sign in at `/admin` (email/password) and create, edit, publish, or reject listings directly against Supabase. **No GitHub involvement for ambassadors or moderators** — GitHub is source control for Elena's own code, nothing else. Superseded the earlier GitHub Actions + GitHub Models pipeline; those workflows have been deleted.                                                                                                                                 |
| Student auth            | Supabase Auth. Guest-first stays the default (ADR 0005 supersedes ADR 0003) — an account is an _opt-in_ upgrade that exists only to sync saved opportunities across devices, never a requirement to browse, save, or submit. Email/password (verified email required) or OAuth (Microsoft, Apple; Google stays behind a flag until `docs/legal/` is reviewed and live). Self-declared 16+, no parental-consent flow, `profiles.role` (`ambassador`/`moderator`/null) is never self-assignable through any signup path. |
| AI verification         | **Gemini** (`gemini-2.5-flash` + Google Search grounding), via `@google/genai`. Two call sites: an on-demand "Verify with AI" button in `/admin` (`src/lib/ai/verify-opportunity.ts`), and a weekly Supabase Edge Function + `pg_cron` job (`supabase/functions/check-application-links/`) that checks published listings with no `apply_url` yet. Chosen over Claude/OpenAI on cost — Google's free grounding allowance covers this project's volume. Neither call site writes to a gate field directly; see §6.      |

**App strategy is Route D:** one backend, two front ends. Rules live in the database so a future native client inherits them rather than reimplementing them. PWA before public launch. No Capacitor, no React Native, no Expo — that branch is archived.

---

## 4. Repository layout

```
CLAUDE.md                     this file (lives at ~/Downloads/CLAUDE.md, not yet moved into the repo)
supabase/
  migrations/                 numbered, forward-only, never edited after apply
  seed.sql                    taxonomy rows only, never listings
  functions/
    check-application-links/  weekly Gemini check for missing apply_url, scheduled via pg_cron
src/
  app/
    (public)/                 browse (page.tsx), opportunities/[id] detail — server components. No /about yet.
    (auth)/                   sign-in, sign-up, confirm-age, callback (OAuth) — optional accounts, ADR 0005
    admin/                    ambassador/moderator dashboard: queue, new listing, edit/publish/reject, "Verify with AI"
  components/
    core/                     quiet register — opportunity-row, effort-ladder, countdown-numeral, not-online-stamp, auth-save-sync
    shell/                    loud register — empty-state so far
  lib/
    ai/                       verify-opportunity.ts — Gemini call, on-demand
    supabase/                 server client, browser client, generated types
    queries/                  all data access — nothing queries Supabase from a component
    local-saved.ts            guest (signed-out) saved-opportunity storage, device-local
docs/                         pillar docs + ADRs — **drift warning**: as of 17 Aug some of these (ARCHITECTURE.md,
                               AI-PIPELINE.md, parts of DATA_MODEL.md) still describe the old Payload/Expo/OpenAI/
                               GitHub-issue stack. Don't trust them over this file or the actual code until reconciled.
.github/
  workflows/                  ci.yml — installs, typechecks, and builds the real Next.js app. The old
                               submission/review/archive workflows are deleted; see §12/§15.
```

**`apps/` (Expo app, Payload CMS) and `packages/design`'s only consumer script are deleted** — dead code from the
pre-greenfield stack, removed 19 Aug once nothing still referenced them. `packages/design`, `packages/taxonomy`,
and `packages/contracts` still exist and are still workspace packages, but nothing in `src/` imports from them —
worth a follow-up pass to confirm they're genuinely orphaned before deleting those too.

**Migrations are forward-only.** Once applied to the hosted project, a migration is never edited. Fix by adding a new one.

**Nothing queries Supabase directly from a component.** All reads go through `lib/queries/`. This is what makes the second client cheap later and keeps RLS assumptions in one place.

**Multiple Claude Code sessions may be active on this repo at once.** If you're picking up work here, run `ListAgents` (or equivalent) before making schema or shared-file changes, and check recent migrations/`docs/adr/` for decisions another session may have already made. §14's "one tool touches the codebase at a time" rule is aspirational right now, not descriptive — Elena is aware and actively managing it.

---

## 5. Database rules

**Taxonomy is data, not schema.** `type` and `field` are lookup tables with `label_en`, `label_el`, `sort_order`. Adding a category is an `INSERT`, never a migration. Only closed sets that will never grow or need translation are Postgres enums: `format`, `reach`, `review_state`, `funding`, `prep_time`, `source_type`, `deadline_precision`, `profile_role`.

**Several taxonomies are genuinely multi-select**, not single-FK — a listing can be both "Engineering" and "Policy". `field`, `academic_level`, `geo_scope` (includes `worldwide`, for listings with no single host country), `audience_group`, and `funding_feature` each get their own `opportunity_<taxonomy>` junction table (`opportunity_id`, `<taxonomy>_id`), RLS'd to follow the parent `opportunity` row's own visibility rules. This replaced an earlier single-`field_id`-column design that undercounted reality — see `supabase/migrations/20260817123426_multiselect_taxonomy.sql`.

**Derived values are never stored.** Computed in Postgres, exposed through views:

- `days_remaining` — from `deadline_at`
- `status` — open / closing_soon / opens_soon / rolling / closed, from the dates
- the effort-ladder rung — from `reach` + `country` + `prep_time`

A stored `status` column that must be kept in sync with a deadline _is_ the EAGxBerkeley bug. Never reintroduce one.

**Dates keep `_raw` and normalized.** `deadline_raw` preserves what the source page literally said. `deadline_precision` (`exact` / `month` / `unknown` / `rolling`) stops "closes in March" becoming a fake exact date. There is **no display date column** — the UI formats one way: `9 August 2026`.

**The publish gate is a CHECK constraint.** A row cannot reach `review_state = 'published'` without funding, eligibility level, reach, prep_time, `last_verified_at`, `official_url` and `apply_url`. No client, no pipeline, and no manual insert can bypass it. If a task requires relaxing that constraint, stop and ask.

**Required fields differ by state:**

|        | `lead` requires         | `published` requires |
| ------ | ----------------------- | -------------------- |
| Fields | `official_url` + `type` | everything above     |

An ambassador sends a link and a type. Everything else is OffMap's job.

**RLS is on for every table from creation.** The anon policy on `opportunity` returns only `published` rows whose deadline has not passed — expiry is enforced at the data layer, not in a view or a filter.

---

## 6. The never-publish-an-inference rule

The only thing OffMap sells is that someone checked. This rule protects it.

- Every field drafted by the pipeline carries a confidence flag.
- **Anything not literally on the source page renders empty, not guessed.** Empty is honest; a guess is a lie with a deadline attached.
- `excluded_claims` and `missing_information` are recorded, not filled.
- **Deadlines and funding always get human eyes.** Everything else can be a fast skim.
- An AI that writes "fully funded" onto a programme that isn't destroys the product. Treat that as the highest-severity bug class in this repo.
- **Concrete implementation:** the Gemini "Verify with AI" button and the weekly application-link checker never write to `apply_url`, `funding`, `deadline_at`, or any other gate field directly. Findings land in `ai_research` (jsonb) / `apply_url_candidate` / `apply_url_candidate_note` — a moderator reads them and copies what's correct into the real fields by hand. If you're ever tempted to make either of those write straight to a gate field "since it's usually right," that's this rule's failure mode exactly.

If you are writing code that fills a gap with a plausible value, you are writing the bug this rule exists to prevent.

---

## 7. Design system

**The one rule everything follows: the shell is loud, the core is quiet.**

- **Shell** — landing, `/about`, empty states, `/submit`, share cards. Full collage: halftone, cut-paper shapes, tape, saturated blocks, rotated stickers. `/submit` is a public "organising something selective, or know someone who is?" contact-style form — not an authenticated ambassador tool. It writes a `lead` row (or similar low-commitment intake) into the same review queue ambassadors work from in `/admin`; it does not let the public writer set `review_state` or bypass the publish gate. Not built yet — see §12.
- **Core** — browse, rows, cards, detail, filters, alerts. Cream, ink base, plus category colour (see below). No texture, no collage.

A 16-year-old with nine days to a deadline needs the quiet register. Giving it to them _is_ the personality. **17 Aug reversal (Elena's call, supersedes non-negotiable #9):** the core register may now carry decorative/category colour — it no longer has to be monochrome-plus-one-deadline-colour. What stays fixed even after the reversal: vermilion means deadline urgency and nowhere else, pink means the NOT ONLINE stamp and nowhere else, and the countdown numeral / stamp / effort ladder keep their exact functional meaning. Category colour (one of `--cobalt`/`--marigold`/`--violet`/`--teal`/`--lime`, mapped consistently per `type_id`) is now allowed as a small tag/tile on rows and cards for scannability — it's additive, not a replacement for the status colours.

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

Vermilion appears only within 14 days of a deadline, so its meaning is learned in one visit. Category colour (17 Aug reversal, see above) now may appear on a listing row as a small type tag — kept to one flat token colour per type, no gradients, doesn't touch the deadline-numeral colour logic.

Borders 2px `--ink`. Hard offset shadow `5px 5px 0`, no blur, no gradients. Radius: 18px cards, 20px pills, 3px stamps and tiles.

### Type

- **Fraunces** (variable, `SOFT 70 / WONK 1`, weight 800–900) — display and countdown numerals. Never below 20px, never all-caps beyond four words.
- **Archivo** (variable) — body, UI, buttons, forms. At `wdth 72`, uppercase with 0.13em tracking for eyebrows and small labels.
- **Bungee** — stamps and stickers only. Loads last.

Subset to Latin, preload the two variable files, no layout shift on swap.

**Open dependency: Archivo has no Greek.** Any live Greek string in the UI needs a Greek-capable face. Unresolved — flag it rather than silently substituting a fallback.

### The three signature elements

1. **The countdown numeral.** Every listing leads with days remaining, Fraunces 30–46px, fixed-width left column so numerals form a vertical spine down the page. Vermilion 1–13 days, ink 14–60, muted 61+. `rolling` renders `ROLLING`; `opens_soon` renders `OPENS MAR`. **The slot is never empty** — the rhythm never breaks.
2. **The NOT ONLINE stamp.** Bungee 10px, pink ground, cream text, rotated -3deg. Fires on `reach: local`, nowhere else. The product thesis compressed into one mark.
3. **The effort ladder as primary navigation**, above type and field filters:

| Rung         | Filter logic                                              |
| ------------ | --------------------------------------------------------- |
| Coffee break | `reach: local` + own country + `prep_time: under_an_hour` |
| Weekend trip | `reach: national` + `prep_time: a_weekend`                |
| Aim higher   | `reach: international`                                    |
| Off path     | `reach: local` in a country other than the user's         |

### Component rules

- **Row** (browse): numeral column 56px right-aligned · title Fraunces 16px · meta Archivo 13px muted reading `funding · eligibility · location, format` · stamp right if local. 1.5px hairline separator. No card, no border, no shadow.
- **Card** (featured modules only): category pill top-left, quiet Save top-right, numeral column left, title Fraunces 21px, organiser and location beneath, hairline, two-column grid with condensed-caps `FUNDING` / `WHO CAN APPLY`. Bottom row: provenance left, stamp right.
- **Card rule, non-negotiable:** answers when it closes, what it costs, who can apply — without a click. No description on a card or row.
- **Provenance line on every card and detail page:** _"Verified 9 August by Elena"_ or _"Submitted by Nikos. Verified 9 August."_
- **Empty state:** shell register, _"Nothing here yet. Tell me when there is."_ plus one **Alert me** button writing a `filter_alert`. Every empty result is a subscription prompt.
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

---

## 12. Build order

Do not reorder. Each step assumes the one above.

1. **Supabase project created** in `eu-central-1`. _(Blocking — do by hand.)_ ✅ done
2. **Migrations applied**, types generated, taxonomy seeded. ✅ done
3. **RLS tested by cross-account read** — sign in as one account, attempt to read another's profile row. This is a ship gate, not a nice-to-have. ✅ done
4. **Admin dashboard auth** — email + password for ambassadors/moderators at `/admin`, gated by `profiles.role`. ✅ done. Student-facing auth (email + Google, 16+ gate at signup) is still separate, later work — Google OAuth still needs privacy policy and terms URLs live (drafted, not yet reviewed/hosted).
5. **Ambassador/moderator review dashboard** — create, edit, publish, reject, all in `/admin`, no GitHub involved. ✅ done (MVP: create + edit + publish/reject wired to the schema's `review_state` and RLS role split; multi-select taxonomy fields and Gemini "Verify with AI" now included; still plain-styled, not shell/core register yet).
6. **Browse, filters, detail, listing row** with the provenance line. ✅ mostly done — `(public)/page.tsx` (browse + effort ladder), `opportunities/[id]` (detail), `opportunity-row`/`countdown-numeral`/`not-online-stamp` components all exist. Verify against §7's component rules and the provenance-line copy before calling this fully done.
7. **Save + deadline alert**, end to end into a real inbox. Save is ✅ done (guest local storage + `saved_opportunity` table + merge-on-sign-in, per ADR 0005). Deadline alert (the `filter_alert` write + a real Resend email landing in an inbox) is **not built yet** — no alert-sending code found in the repo as of 17 Aug. **This is the current top-priority backend gap** — it's the literal product promise ("told before it matters to them") and a ship gate (§13), and soft launch (7 Sept) is close enough that it should be sequenced before new surface area, not after.
8. **Existing ~25 listings migrated** — funding and eligibility filled, anything that can't state them goes back to `lead` or gets killed. **Not started** — `data/opportunities.json` still sits unmigrated.
9. **`/about`** — definition, editorial standard, exclusion list, paid-placement rule. **Not built** — no `about` route found.
10. **`/submit`** — public "organising something selective, or know someone who is?" intake form, feeding the same review queue ambassadors use in `/admin`. **Not built** — no route found. See §7 for framing.
11. **Landing + featured modules**, lite profile, eligibility chips, match alerts, weekly digest, prep-time alerts.
12. **PWA**, then October: map, archive pages, contributor dashboard, deadline ruler.

**Optional student accounts (ADR 0005, supersedes ADR 0003)** landed alongside steps 5–7, ahead of where the original build order put it — Elena's call, another accepted reorder. Guest-first is still the default; an account only exists to sync saves across devices.

**Superseded:** this section previously said review stays in GitHub pull requests until after public launch, with the admin queue deferred. Elena reversed that call — ambassadors and moderators work entirely in the web dashboard, GitHub is scoped to Elena's own code only. The dashboard was built now rather than deferred.

---

## 13. Ship gates for public launch

All must be true. **If a gate fails, ship late.**

- [ ] Zero expired listings visible anywhere
- [ ] Every published listing has funding, eligibility and `last_verified_at` — no "Not stated", no "See details"
- [ ] 50+ verified and currently open
- [ ] No single source accounts for more than a third of listings
- [ ] A deadline alert has arrived in a real inbox, not merely been logged as sent
- [ ] A real ambassador — not Elena — has put a listing through the form end to end
- [ ] `/about` live
- [ ] RLS tested by attempted cross-account read

---

## 14. Working with Elena

Sole owner, sole builder, roughly 20 hours a week of which about 8 is build. Direct, expects pushback rather than agreement. Corrections stick — if she says a premise is wrong, treat it as wrong and update this file.

- **Say when something won't fit in the time available.** A cut named early is worth more than a feature half-built.
- **Do the click-work list by hand:** account signups, DNS records, console clicking, testing that login works, testing that an alert arrives. Don't spend tokens on these, and don't offer to.
- **One tool touches the codebase at a time.** Concurrent AI edits cost more than they save.
- **When a decision belongs to another pillar, name it, park it, move on.**

---

## 15. Current state — update this section as it changes

**As of 17 August 2026 (evening):**

- Domain `offmap.gr` bought at Papaki; `hello@offmap.gr` live
- Resend configured on `contact.offmap.gr`, EU region — **verification status unconfirmed**
- Supabase project **created**: "OffMap Website", `eu-central-1`, ref `uddfpfdekdltftrmvbqh`
- Schema live: multi-select taxonomy (`type`, `field`, `academic_level`, `geo_scope`, `audience_group`, `funding_feature` + junction tables), `opportunity` with publish-gate `CHECK` constraint and AI-suggestion columns (`ai_research`, `apply_url_candidate`), `profiles` with `role` (`ambassador` | `moderator`, nullable = ordinary student), `saved_opportunity`, RLS on every table, all verified by direct cross-account read test. 11 migrations applied so far.
- Next.js app live at repo-root `src/` (App Router, Tailwind v4, design tokens wired). `apps/app` (Expo) / `apps/cms` (Payload) — deleted 19 Aug, were dead code no longer referenced by anything.
- Admin dashboard at `/admin`: ambassador/moderator sign-in, create/edit/publish/reject a listing, multi-select taxonomy fields, "Verify with AI" button — all against Supabase directly, no GitHub involved
- **AI provider is Gemini** (`gemini-2.5-flash` + Google Search grounding), not Claude or OpenAI — picked for cost given this project's volume (Google's free grounding allowance likely covers it entirely). Two call sites: the admin "Verify with AI" button, and a weekly `pg_cron` + Edge Function job that checks published listings missing an `apply_url`. **`GEMINI_API_KEY` is created and in place** (confirmed 17 Aug) — AI call sites can run. `.env.example` itself is still the stale Payload/Expo/OpenAI template and doesn't list `GEMINI_API_KEY`, `RESEND_API_KEY`, or the Supabase URL/anon key vars the app actually needs — needs a rewrite to match the real stack (tracked as its own cleanup, not blocking).
- Guest-first browse/save/detail pages are live; optional student accounts (email/password + Microsoft/Apple OAuth, Google gated behind a flag) exist per ADR 0005 (supersedes ADR 0003) — an account only exists to sync saved opportunities across devices
- **GitHub Actions supply pipeline deleted** (`process-submission.yml`, `rebuild-indexes.yml`, `cleanup-closed-submission.yml`, `archive-expired.yml`, `update-closing-soon.yml`) — superseded by the web dashboard. `ci.yml` rewritten 19 Aug to install/typecheck/build the real Next.js app instead of the dead `apps/` packages.
- **Deadline-alert sending is built** (`supabase/functions/send-deadline-alerts`, daily `pg_cron` job) — wired and confirmed correct via manual invocation, but no real email has landed in a real inbox yet since there are no real listings/saves to trigger one. Still the top blocker before the 7 Sept soft launch, now downstream of migrating real listings (§12 step 8) rather than of the alert code itself.
- **No `/submit` route exists.** Public "organising something, or know someone who is?" intake form is still only a doc reference (§7), not built.
- Google OAuth **not configured** — blocked on privacy policy + terms URLs. `docs/legal/privacy-policy.md` and `terms.md` are drafted but each still has unresolved required blanks (`[legal name]`, `[registered address]` — GDPR Art. 13(1)(a)) and neither is rendered at a real route yet; nothing is hosted live.
- ~25 listings still live as files in the repo (`data/opportunities.json`), single-sourced, most missing funding and eligibility — not yet migrated into Supabase
- **No `/about` page yet** — see §12 step 9. Deadline-alert sending is built (see below), just unproven with real data.
- A PWA pass landed (`public/manifest.webmanifest`, `public/sw.js`, install icons, `/get-app` install flow, `service-worker-register.tsx`) — ahead of where §12 step 12 put it.
- EAGxBerkeley 2026 still shown under "Closing soon" with a deadline of 7 August — likely a null `normalized` date, not a code bug. Check before migrating anything
- **Site IA expanded 17 Aug (Elena's call):** `/` becomes a marketing/shell landing page (hero, what-OffMap-is, opportunities teaser, community teaser); the former root browse page moves to `/browse` and becomes the "dashboard" entry point (effort ladder, listing rows, a placeholder "new in your sector" section — real sector-matching isn't built, this is mocked UI ahead of the backend per Elena's explicit instruction). New pages: `/community` (editorial only — spotlights/impact/how-it-works, **not** social; non-negotiable #2 still bans student-to-student visibility), `/get-app` (PWA install), `/contact`, `/licenses`, `/profile` (placeholder, auth-status aware). Top nav (web) + bottom tab nav (mobile/app), per Route D. `src/app/loading.tsx` added as the app-wide loading/welcome screen. Content on new pages is placeholder text pending real copy.

**Multiple Claude Code sessions have been working on this repo concurrently** (at least 5 seen at once on 17 Aug) — auth/saved-opportunities, browse/detail UI, and this AI/admin work all landed in parallel. So far no destructive collisions, but §14's "one tool at a time" rule has not been holding in practice. Elena is aware and deciding how to handle it.

- **Several docs under `docs/` are stale** and describe the old, pre-greenfield stack (`ARCHITECTURE.md` and `AI-PIPELINE.md` fully — Payload/Expo/OpenAI/GitHub-issues; `DATA_MODEL.md` partially — some sections match the real Supabase schema, others still describe Payload collections). Don't trust them over this file or the actual code until someone reconciles them.

**As of 19 August 2026:**

- `apps/app` (Expo) and `apps/cms` (Payload) are fully deleted — code, workspace references, lockfile entries, all gone, not just flagged as dead. `packages/design`, `packages/taxonomy`, `packages/contracts` are still present and still workspace members, but nothing in `src/` imports from them — likely orphaned too, not yet confirmed or removed.
- `ci.yml` now runs install → `format:check` → `tsc --noEmit` → `next build` against the real app, all green. Repo-wide Prettier drift fixed. No lint step — no root ESLint config exists, and the only other candidate (`pnpm -r --if-present lint`) is a no-op since no remaining workspace package defines a `lint` script.
- **Known bug, not yet fixed:** `pnpm run typecheck` hangs indefinitely inside `packages/taxonomy`'s `tsc --noEmit` (0% CPU, genuinely stuck, not slow). Confirmed nothing in `src/` depends on that package. Being investigated in a separate background task.
- The opportunities-reel scroll animation went through several redesigns this session (infinite recycling + drag, then a full film-strip flip/throw sequence) and was explicitly reverted back to the simpler, working delta-driven version (6 cards/row, alternating direction, no drag) — that reversion is intentional, not a regression; don't "fix" it back toward the fancier versions without being asked.
- **Four workstreams kicked off in parallel, each scoped to disjoint files to avoid the concurrent-edit collisions noted above:** (1) OAuth/auth provider setup (Google, Microsoft, Apple) plus the legal-doc blanks — manual/console-heavy, tracked as its own instructions rather than an agent; (2) the public `/submit` UX — a student-facing form that saves a `lead` row before anything reaches AI; (3) the AI verification workflow — Gemini fetches the listing's own page, cross-checks every field, falls back to a title search only if the given link is wrong, never writes straight to a gate field (§6), plus the opportunity detail page template; (4) the admin dashboard's bulk-review flow — trigger AI verification individually or in bulk, review AI-drafted candidates before they touch a real field, publish/reject. If you're picking up any of these mid-flight, check which of the other three has already landed before touching shared surface (the `opportunity` row shape, `/admin`'s queue UI, `ai_research`/`apply_url_candidate` columns) — the schema for all of this already exists (§5), none of these should need new migrations.

**Soft launch 7 September. Public launch week of 28 September. Do not slip past 12 October** — after that the peak is spent rather than used, and the next real window is January.
