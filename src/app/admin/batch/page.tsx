import Link from 'next/link';

import { getPendingOpportunities } from '@/lib/queries/admin-opportunities';
import { getCurrentUserRole } from '@/lib/queries/profile';
import {
  classifyOpportunity,
  getResearch,
  guessFundingEnum,
  guessFormatEnum,
} from '@/lib/admin/opportunity-buckets';

import { batchApplyAndPublish } from './actions';

const fieldClass =
  'rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-2 py-1 text-xs';

// Batch review for the "ready to batch-apply" bucket (CLAUDE.md §6): every
// fact the AI is allowed to determine (apply URL, funding description,
// eligibility, deadline) came back confirmed. Reach and prep_time are never
// AI-researched by design — they're editorial judgment calls — so this
// screen always asks for them explicitly, per row, before anything
// publishes. A moderator sees every value that will be applied and picks
// the two judgment calls; nothing here writes to the database until they
// submit.
export default async function BatchApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ published?: string; failed?: string }>;
}) {
  const { published, failed } = await searchParams;
  const [pending, role] = await Promise.all([getPendingOpportunities(), getCurrentUserRole()]);
  const isModerator = role === 'moderator';
  const ready = pending.filter((o) => classifyOpportunity(o) === 'ready_to_batch');

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/admin" className="text-sm text-[color:var(--muted)] hover:underline">
        ← Review queue
      </Link>

      <h1 className="font-[family-name:var(--font-fraunces)] mt-2 text-2xl font-extrabold">
        Batch-apply
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        AI confirmed the facts below against the source page. Reach and prep time are always your
        call — pick them per row, uncheck anything that doesn't look right, then apply the batch.
      </p>

      {published && (
        <p className="mt-4 rounded-[12px] border-2 border-[color:var(--teal)] px-4 py-2.5 text-sm">
          Published {published} opportunit{published === '1' ? 'y' : 'ies'}.
        </p>
      )}
      {failed && (
        <p className="mt-4 rounded-[12px] border-2 border-[color:var(--vermilion)] px-4 py-2.5 text-sm">
          Couldn&apos;t publish: {failed}
        </p>
      )}

      {ready.length === 0 ? (
        <p className="mt-6 text-[color:var(--muted)]">Nothing ready to batch-apply right now.</p>
      ) : !isModerator ? (
        <p className="mt-6 text-[color:var(--muted)]">
          {ready.length} opportunit{ready.length === 1 ? 'y is' : 'ies are'} ready — a moderator
          needs to apply this batch.
        </p>
      ) : (
        <form action={batchApplyAndPublish} className="mt-6 space-y-4">
          {ready.map((opportunity) => {
            const research = getResearch(opportunity);
            return (
              <fieldset
                key={opportunity.id}
                className="rounded-[18px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] p-4"
              >
                <legend className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    name="ids"
                    value={opportunity.id}
                    defaultChecked
                    className="h-4 w-4 border-2 border-[color:var(--ink)]"
                    aria-label={`Include ${opportunity.title ?? opportunity.official_url} in this batch`}
                  />
                  <span className="font-medium">{opportunity.title || '(untitled)'}</span>
                </legend>

                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  {opportunity.organiser || 'No organiser set'} · {opportunity.official_url}
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="font-bold tracking-wide text-[color:var(--muted)] uppercase">
                      Apply URL
                    </dt>
                    <dd className="truncate">{research?.application_url?.value ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="font-bold tracking-wide text-[color:var(--muted)] uppercase">
                      Deadline
                    </dt>
                    <dd>{research?.deadline?.value ?? '—'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-bold tracking-wide text-[color:var(--muted)] uppercase">
                      Funding (as found)
                    </dt>
                    <dd>{research?.funding?.value ?? '—'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-bold tracking-wide text-[color:var(--muted)] uppercase">
                      Eligibility
                    </dt>
                    <dd>{research?.eligibility?.value ?? '—'}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-3">
                  <label className="text-xs">
                    Funding (confirm)
                    <select
                      name={`funding-${opportunity.id}`}
                      required
                      defaultValue={guessFundingEnum(research?.funding?.value ?? null) ?? ''}
                      className={`mt-1 block ${fieldClass}`}
                    >
                      <option value="" disabled>
                        Choose…
                      </option>
                      <option value="fully_funded">Fully funded</option>
                      <option value="partially_funded">Partially funded</option>
                      <option value="unfunded">Unfunded</option>
                    </select>
                  </label>

                  <label className="text-xs">
                    Reach (your call)
                    <select
                      name={`reach-${opportunity.id}`}
                      required
                      defaultValue=""
                      className={`mt-1 block ${fieldClass}`}
                    >
                      <option value="" disabled>
                        Choose…
                      </option>
                      <option value="local">Local</option>
                      <option value="national">National</option>
                      <option value="international">International</option>
                    </select>
                  </label>

                  <label className="text-xs">
                    Prep time (your call)
                    <select
                      name={`prep_time-${opportunity.id}`}
                      required
                      defaultValue=""
                      className={`mt-1 block ${fieldClass}`}
                    >
                      <option value="" disabled>
                        Choose…
                      </option>
                      <option value="under_an_hour">Under an hour</option>
                      <option value="a_weekend">A weekend</option>
                      <option value="longer">Longer</option>
                    </select>
                  </label>

                  <label className="text-xs">
                    Format
                    <select
                      name={`format-${opportunity.id}`}
                      defaultValue={guessFormatEnum(research?.format?.value ?? null) ?? ''}
                      className={`mt-1 block ${fieldClass}`}
                    >
                      <option value="">Not stated</option>
                      <option value="online">Online</option>
                      <option value="in_person">In person</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </label>
                </div>
              </fieldset>
            );
          })}

          <button
            type="submit"
            className="rounded-[3px] border-2 border-[color:var(--teal)] bg-[color:var(--teal)] px-5 py-2.5 text-sm font-bold text-[color:var(--card)]"
          >
            Apply &amp; publish this batch
          </button>
        </form>
      )}
    </main>
  );
}
