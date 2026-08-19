import Link from 'next/link';

import { getPendingOpportunities, type AdminOpportunity } from '@/lib/queries/admin-opportunities';
import { getCurrentUserRole } from '@/lib/queries/profile';
import { getMissingPublishFields } from '@/lib/opportunity-publish-gate';

import { bulkRunAiResearch, quickRejectFromQueue, runAiResearchFromQueue } from './actions';
import { SelectAllCheckbox } from './select-all-checkbox';

const BULK_FORM_ID = 'bulk-verify-form';

const pillClass =
  'rounded-[3px] border-2 px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase';
const actionButtonClass =
  'rounded-[3px] border-2 px-3 py-1.5 text-xs font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[color:var(--cobalt)]';

function QueueRow({
  opportunity,
  isModerator,
}: {
  opportunity: AdminOpportunity;
  isModerator: boolean;
}) {
  const missing = getMissingPublishFields(opportunity);
  const runAiWithId = runAiResearchFromQueue.bind(null, opportunity.id);
  const rejectWithId = quickRejectFromQueue.bind(null, opportunity.id);
  const label = opportunity.title || opportunity.official_url;

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
          {opportunity.ai_research != null && (
            <span
              className={`${pillClass} border-[color:var(--cobalt)] text-[color:var(--cobalt)]`}
            >
              AI draft ready — review before applying
            </span>
          )}
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

export default async function AdminQueuePage() {
  const [pending, role] = await Promise.all([getPendingOpportunities(), getCurrentUserRole()]);
  const isModerator = role === 'moderator';

  // 'lead' = created but nobody has touched it yet (the public /submit form,
  // built by a parallel workstream, writes rows in exactly this shape — a
  // link and a type, nothing else). 'in_review' = someone has already saved
  // an edit or run AI research on it (see saveOpportunity / runAiResearch).
  const freshlyCreated = pending.filter((o) => o.review_state === 'lead');
  const inProgress = pending.filter((o) => o.review_state === 'in_review');

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

          <section className="mt-6">
            <h2 className="text-sm font-bold tracking-wide text-[color:var(--muted)] uppercase">
              New — not yet reviewed ({freshlyCreated.length})
            </h2>
            {freshlyCreated.length === 0 ? (
              <p className="mt-2 text-sm text-[color:var(--muted)]">Nothing fresh right now.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {freshlyCreated.map((o) => (
                  <QueueRow key={o.id} opportunity={o} isModerator={isModerator} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-bold tracking-wide text-[color:var(--muted)] uppercase">
              In progress ({inProgress.length})
            </h2>
            {inProgress.length === 0 ? (
              <p className="mt-2 text-sm text-[color:var(--muted)]">Nothing being worked on yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {inProgress.map((o) => (
                  <QueueRow key={o.id} opportunity={o} isModerator={isModerator} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
