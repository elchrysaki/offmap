import Link from 'next/link';

import {
  getPendingOpportunities,
  getRecentlyPublishedOpportunities,
  type AdminOpportunity,
} from '@/lib/queries/admin-opportunities';
import { getCurrentUserRole } from '@/lib/queries/profile';
import { getMissingPublishFields } from '@/lib/opportunity-publish-gate';
import { classifyOpportunity, getResearch } from '@/lib/admin/opportunity-buckets';
import { findDuplicateAmong, type DuplicateMatch } from '@/lib/admin/duplicates';

import {
  bulkRunAiResearch,
  mergeIntoOpportunity,
  quickRejectFromQueue,
  runAiResearchFromQueue,
} from './actions';
import { SelectAllCheckbox } from './select-all-checkbox';

const BULK_FORM_ID = 'bulk-verify-form';

const pillClass =
  'rounded-[3px] border-2 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase';
const actionButtonClass =
  'rounded-[3px] border-2 px-3 py-1.5 text-xs font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[color:var(--cobalt)]';

function ConfidencePill({ opportunity }: { opportunity: AdminOpportunity }) {
  const research = getResearch(opportunity);
  if (!research || typeof research.overall_confidence !== 'number') return null;
  const pct = Math.round(research.overall_confidence * 100);
  const color = pct >= 80 ? 'var(--teal)' : pct >= 30 ? 'var(--marigold)' : 'var(--vermilion)';
  return (
    <span className={pillClass} style={{ borderColor: color, color }}>
      {pct}% confidence
    </span>
  );
}

function QueueRow({
  opportunity,
  isModerator,
  duplicates,
}: {
  opportunity: AdminOpportunity;
  isModerator: boolean;
  duplicates: DuplicateMatch[];
}) {
  const missing = getMissingPublishFields(opportunity);
  const runAiWithId = runAiResearchFromQueue.bind(null, opportunity.id);
  const rejectWithId = quickRejectFromQueue.bind(null, opportunity.id);
  const label = opportunity.title || opportunity.official_url;
  const topDuplicate = duplicates[0];
  const mergeWithTopDuplicate = topDuplicate
    ? mergeIntoOpportunity.bind(null, opportunity.id, topDuplicate.candidate.id)
    : undefined;

  return (
    <li className="flex flex-wrap items-start gap-3 rounded-[18px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] p-4">
      <input
        type="checkbox"
        name="ids"
        value={opportunity.id}
        form={BULK_FORM_ID}
        aria-label={`Select "${label}" for bulk actions`}
        className="mt-1 h-4 w-4 shrink-0 border-2 border-[color:var(--ink)]"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/admin/opportunities/${opportunity.id}`}
            className="font-medium hover:underline"
          >
            {opportunity.title || '(untitled)'}
          </Link>
          <ConfidencePill opportunity={opportunity} />
          {opportunity.apply_url_candidate != null && (
            <span
              className={`${pillClass} border-[color:var(--marigold)] text-[color:var(--marigold)]`}
            >
              Apply URL candidate
            </span>
          )}
        </div>
        <p className="text-sm text-[color:var(--muted)]">
          {opportunity.organiser || 'No organiser set'} · {opportunity.official_url}
        </p>
        {missing.length > 0 ? (
          <p className="mt-1 text-xs text-[color:var(--vermilion)]">
            Still missing to publish: {missing.join(', ')}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            All publish-gate fields filled — ready for a moderator to review and publish.
          </p>
        )}

        {topDuplicate && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={pillClass}
              style={{
                borderColor:
                  topDuplicate.confidence === 'certain' ? 'var(--vermilion)' : 'var(--marigold)',
                color:
                  topDuplicate.confidence === 'certain' ? 'var(--vermilion)' : 'var(--marigold)',
              }}
            >
              {topDuplicate.confidence === 'certain' ? 'Likely duplicate' : 'Possible duplicate'}
            </span>
            <span className="text-[color:var(--muted)]">
              {topDuplicate.reason} — of{' '}
              <Link
                href={`/admin/opportunities/${topDuplicate.candidate.id}`}
                className="underline"
              >
                {topDuplicate.candidate.title || topDuplicate.candidate.official_url}
              </Link>
            </span>
            {isModerator && mergeWithTopDuplicate && (
              <form action={mergeWithTopDuplicate}>
                <button
                  type="submit"
                  className={`${actionButtonClass} border-[color:var(--vermilion)] text-[color:var(--vermilion)]`}
                >
                  Merge into it
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <form action={runAiWithId}>
          <button
            type="submit"
            className={`${actionButtonClass} border-[color:var(--cobalt)] text-[color:var(--cobalt)]`}
          >
            Verify with AI
          </button>
        </form>
        <Link
          href={`/admin/opportunities/${opportunity.id}`}
          className={`${actionButtonClass} border-[color:var(--ink)]`}
        >
          Edit
        </Link>
        {isModerator && (
          <form action={rejectWithId}>
            <button
              type="submit"
              className={`${actionButtonClass} border-[color:var(--vermilion)] text-[color:var(--vermilion)]`}
            >
              Reject
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

function QueueSection({
  title,
  hint,
  opportunities,
  isModerator,
  emptyLabel,
  duplicatesById,
}: {
  title: string;
  hint?: string;
  opportunities: AdminOpportunity[];
  isModerator: boolean;
  emptyLabel: string;
  duplicatesById: Map<string, DuplicateMatch[]>;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold tracking-wide text-[color:var(--muted)] uppercase">
        {title} ({opportunities.length})
      </h2>
      {hint && <p className="mt-1 text-xs text-[color:var(--muted)]">{hint}</p>}
      {opportunities.length === 0 ? (
        <p className="mt-2 text-sm text-[color:var(--muted)]">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {opportunities.map((o) => (
            <QueueRow
              key={o.id}
              opportunity={o}
              isModerator={isModerator}
              duplicates={duplicatesById.get(o.id) ?? []}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminQueuePage() {
  const [pending, published, role] = await Promise.all([
    getPendingOpportunities(),
    getRecentlyPublishedOpportunities(),
    getCurrentUserRole(),
  ]);
  const isModerator = role === 'moderator';

  // Buckets by what the AI actually found, not by review_state — see
  // src/lib/admin/opportunity-buckets.ts. "Ready to batch-apply" never means
  // zero human input (reach/prep_time are always a human's call); it means
  // every fact the AI is allowed to determine came back confirmed, so a
  // moderator can clear the whole batch from one review screen instead of
  // one row at a time.
  const needsIntervention = pending.filter((o) => classifyOpportunity(o) === 'needs_intervention');
  const readyToBatch = pending.filter((o) => classifyOpportunity(o) === 'ready_to_batch');
  const aiChecked = pending.filter((o) => classifyOpportunity(o) === 'ai_checked');
  const unverified = pending.filter((o) => classifyOpportunity(o) === 'unverified');

  // Every pending row checked against every other live row (pending +
  // published) — see src/lib/admin/duplicates.ts. Computed here rather than
  // stored, same "derived values aren't stored" reasoning as everything
  // else in this codebase: titles/organisers get edited, so a stored match
  // would go stale.
  const allLive = [...pending, ...published];
  const duplicatesById = new Map<string, DuplicateMatch[]>(
    pending.map((o) => [o.id, findDuplicateAmong(o, allLive, o.id)]),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
          Review queue
        </h1>
        <Link
          href="/admin/new"
          className="rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 text-sm font-medium text-[color:var(--paper)]"
        >
          New listing
        </Link>
      </div>

      {readyToBatch.length > 0 && (
        <Link
          href="/admin/batch"
          className="mt-6 flex items-center justify-between rounded-[18px] border-2 border-[color:var(--teal)] bg-[color:var(--card)] p-4 hover:bg-[color:var(--paper)]"
        >
          <span className="text-sm font-bold" style={{ color: 'var(--teal)' }}>
            {readyToBatch.length} opportunit{readyToBatch.length === 1 ? 'y' : 'ies'} ready to
            batch-apply →
          </span>
          <span className="text-xs text-[color:var(--muted)]">
            AI confirmed the facts it can; two quick judgment calls per row and you're done.
          </span>
        </Link>
      )}

      {pending.length === 0 ? (
        <p className="mt-4 text-[color:var(--muted)]">Nothing waiting on review.</p>
      ) : (
        <>
          {/* Bulk-select toolbar. The form itself holds no checkboxes — each
              row's checkbox associates with it via the `form` attribute
              (HTML5, no DOM nesting required), so per-row forms below can
              stay independent <form> elements without illegally nesting
              forms inside a form. Fully keyboard-operable: Tab reaches every
              checkbox and the submit button, Space/Enter trigger them. */}
          <form
            id={BULK_FORM_ID}
            action={bulkRunAiResearch}
            className="sticky top-4 z-10 mt-6 flex flex-wrap items-center gap-4 rounded-[18px] border-2 border-[color:var(--ink)] bg-[color:var(--paper)] p-4 shadow-[5px_5px_0_var(--ink)]"
          >
            <SelectAllCheckbox />
            <button
              type="submit"
              className="ml-auto rounded-[3px] border-2 border-[color:var(--cobalt)] bg-[color:var(--cobalt)] px-4 py-2 text-sm font-medium text-[color:var(--paper)]"
            >
              Verify selected with AI
            </button>
          </form>

          <QueueSection
            title="Needs human intervention"
            hint="AI couldn't confirm it had the right page, or its own confidence came back too low to trust."
            opportunities={needsIntervention}
            isModerator={isModerator}
            emptyLabel="None right now."
            duplicatesById={duplicatesById}
          />

          <QueueSection
            title="AI-checked — needs review"
            hint="Research ran, but at least one fact wasn't confirmed — review before publishing."
            opportunities={aiChecked}
            isModerator={isModerator}
            emptyLabel="Nothing partially checked right now."
            duplicatesById={duplicatesById}
          />

          <QueueSection
            title="Unverified — not yet run"
            opportunities={unverified}
            isModerator={isModerator}
            emptyLabel="Nothing fresh right now."
            duplicatesById={duplicatesById}
          />
        </>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-bold tracking-wide text-[color:var(--muted)] uppercase">
          Recently launched
        </h2>
        {published.length === 0 ? (
          <p className="mt-2 text-sm text-[color:var(--muted)]">Nothing published yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {published.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-[12px] border-2 border-[color:var(--rule)] px-4 py-2.5 text-sm"
              >
                <Link href={`/opportunities/${o.id}`} className="font-medium hover:underline">
                  {o.title || o.official_url}
                </Link>
                <span className="text-xs text-[color:var(--muted)]">
                  Verified{' '}
                  {o.last_verified_at ? new Date(o.last_verified_at).toLocaleDateString() : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
