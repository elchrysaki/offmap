import {
  getOpportunityById,
  getOpportunitySelections,
} from '@/lib/queries/admin-opportunities';
import {
  getAcademicLevels,
  getAudienceGroups,
  getFields,
  getFundingFeatures,
  getGeoScopes,
  getTypes,
} from '@/lib/queries/taxonomy';
import { getCurrentUserRole } from '@/lib/queries/profile';
import type { OpportunityResearch } from '@/lib/ai/verify-opportunity';

import {
  publishOpportunity,
  rejectOpportunityAction,
  runAiResearch,
  saveOpportunity,
} from './actions';

const inputClass =
  'mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--cobalt)]';
const labelClass = 'block text-sm font-medium';
const helpClass = 'mt-0.5 text-xs text-[color:var(--muted)]';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] p-5">
      <h2 className="font-[family-name:var(--font-fraunces)] text-lg font-bold">{title}</h2>
      {description && <p className={helpClass}>{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function CheckboxGroup({
  name,
  options,
  selected,
}: {
  name: string;
  options: { id: string; label_en: string }[];
  selected: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
      {options.map((o) => (
        <label key={o.id} className="flex items-start gap-2 text-sm leading-tight">
          <input
            type="checkbox"
            name={name}
            value={o.id}
            defaultChecked={selected.includes(o.id)}
            className="mt-0.5 h-4 w-4 shrink-0 border-2 border-[color:var(--ink)]"
          />
          {o.label_en}
        </label>
      ))}
    </div>
  );
}

export default async function AdminOpportunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [opportunity, selections, types, fields, academicLevels, geoScopes, audienceGroups, fundingFeatures, role] =
    await Promise.all([
      getOpportunityById(id),
      getOpportunitySelections(id),
      getTypes(),
      getFields(),
      getAcademicLevels(),
      getGeoScopes(),
      getAudienceGroups(),
      getFundingFeatures(),
      getCurrentUserRole(),
    ]);

  const isModerator = role === 'moderator';

  const saveWithId = saveOpportunity.bind(null, id);
  const publishWithId = publishOpportunity.bind(null, id);
  const rejectWithId = rejectOpportunityAction.bind(null, id);
  const runAiResearchWithId = runAiResearch.bind(null, id);

  const research = opportunity.ai_research as OpportunityResearch | { error: string } | null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
            {opportunity.title || '(untitled)'}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Status: {opportunity.review_state}
          </p>
        </div>
        <form action={runAiResearchWithId}>
          <button
            type="submit"
            className="shrink-0 rounded-[3px] border-2 border-[color:var(--cobalt)] px-4 py-2 text-sm font-medium text-[color:var(--cobalt)]"
          >
            Verify with AI
          </button>
        </form>
      </div>

      {error && (
        <p className="mt-4 rounded-[3px] border-2 border-[color:var(--vermilion)] bg-[color:var(--card)] px-3 py-2 text-sm text-[color:var(--vermilion)]">
          {error}
        </p>
      )}

      {research && (
        <div className="mt-4 rounded-[18px] border-2 border-[color:var(--cobalt)] bg-[color:var(--card)] p-5">
          <h2 className="text-sm font-bold tracking-wide text-[color:var(--cobalt)] uppercase">
            AI research — suggestions only, nothing here is applied automatically
          </h2>
          {opportunity.ai_research_at && (
            <p className={helpClass}>
              Run {new Date(opportunity.ai_research_at).toLocaleString()}
            </p>
          )}
          {'error' in research ? (
            <p className="mt-2 text-sm text-[color:var(--vermilion)]">{research.error}</p>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <p className={helpClass}>
                Method: {research.research_method}
                {research.fallback_reason ? ` — fell back to search: ${research.fallback_reason}` : ''}
              </p>
              <p>
                <strong>Official URL:</strong> {research.official_url.value ?? 'not found'}{' '}
                <span className={helpClass}>
                  ({research.official_url.confidence}
                  {research.official_url.matches_current === false ? ', differs from current' : ''}){' '}
                  {research.official_url.note}
                </span>
              </p>
              <p>
                <strong>Application URL:</strong> {research.application_url.value ?? 'not found'}{' '}
                <span className={helpClass}>
                  ({research.application_url.confidence}
                  {research.application_url.matches_current === false ? ', differs from current' : ''}){' '}
                  {research.application_url.note}
                </span>
              </p>
              <p>
                <strong>Deadline:</strong> {research.deadline.value ?? 'not found'}
                {research.deadline.precision ? ` (${research.deadline.precision})` : ''}{' '}
                <span className={helpClass}>
                  ({research.deadline.confidence}) {research.deadline.note}
                </span>
              </p>
              <p>
                <strong>Contact:</strong> {research.contact_email.value ?? 'not found'}{' '}
                <span className={helpClass}>{research.contact_email.note}</span>
              </p>
              {research.funding.value && (
                <p>
                  <strong>Funding:</strong> {research.funding.value}{' '}
                  <span className={helpClass}>
                    ({research.funding.confidence}
                    {research.funding.matches_current === false ? ', differs from current' : ''})
                  </span>
                </p>
              )}
              {research.eligibility.value && (
                <p>
                  <strong>Eligibility:</strong> {research.eligibility.value}{' '}
                  <span className={helpClass}>
                    ({research.eligibility.confidence}
                    {research.eligibility.matches_current === false ? ', differs from current' : ''})
                  </span>
                </p>
              )}
              {research.additional_findings?.length > 0 && (
                <p>
                  <strong>Additional findings:</strong> {research.additional_findings.join(' · ')}
                </p>
              )}
              {research.missing_information?.length > 0 && (
                <p className={helpClass}>
                  Not stated on source: {research.missing_information.join(' · ')}
                </p>
              )}
              {research.excluded_claims?.length > 0 && (
                <p className={helpClass}>
                  Excluded (unverifiable): {research.excluded_claims.join(' · ')}
                </p>
              )}
              <p className={helpClass}>
                Overall confidence: {research.overall_confidence}/100 — {research.moderator_note}
              </p>
              {research.sources?.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-xs text-[color:var(--muted)]">
                    Sources ({research.sources.length})
                  </summary>
                  <ul className="mt-1 list-disc pl-4 text-xs text-[color:var(--muted)]">
                    {research.sources.map((s, i) => (
                      <li key={i}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                          {s.url}
                        </a>{' '}
                        — {s.finding}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <form action={saveWithId} className="mt-6 space-y-6">
        <Section title="The basics">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={opportunity.title ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="organiser" className={labelClass}>
              Organiser
            </label>
            <input
              id="organiser"
              name="organiser"
              defaultValue={opportunity.organiser ?? ''}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="official_url" className={labelClass}>
                Official URL *
              </label>
              <input
                id="official_url"
                name="official_url"
                type="url"
                required
                defaultValue={opportunity.official_url}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="apply_url" className={labelClass}>
                Apply URL *
              </label>
              <input
                id="apply_url"
                name="apply_url"
                type="url"
                defaultValue={opportunity.apply_url ?? ''}
                className={inputClass}
              />
              <p className={helpClass}>Leave blank if applications haven&apos;t opened — see below.</p>
            </div>
          </div>

          <div>
            <label htmlFor="type_id" className={labelClass}>
              Type
            </label>
            <select
              id="type_id"
              name="type_id"
              required
              defaultValue={opportunity.type_id}
              className={inputClass}
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label_en}
                </option>
              ))}
            </select>
          </div>
        </Section>

        <Section
          title="No application link yet?"
          description="If applications haven't opened, say roughly when they're expected to. Once that season arrives, a check runs automatically to look for the real link."
        >
          <div>
            <label htmlFor="expected_application_season" className={labelClass}>
              Expected application window
            </label>
            <input
              id="expected_application_season"
              name="expected_application_season"
              placeholder="e.g. September 2027, or Spring 2028"
              defaultValue={opportunity.expected_application_season ?? ''}
              className={inputClass}
            />
          </div>
        </Section>

        <Section title="Where and who" description="Format, location, and who can apply.">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="format" className={labelClass}>
                Format
              </label>
              <select
                id="format"
                name="format"
                defaultValue={opportunity.format ?? ''}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="online">Online</option>
                <option value="in_person">In person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label htmlFor="reach" className={labelClass}>
                Reach *
              </label>
              <select
                id="reach"
                name="reach"
                defaultValue={opportunity.reach ?? ''}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="local">Local</option>
                <option value="national">National</option>
                <option value="international">International</option>
              </select>
              <p className={helpClass}>Scope of the event itself — for the effort-ladder filter.</p>
            </div>

            <div>
              <label htmlFor="host_city" className={labelClass}>
                Host city
              </label>
              <input
                id="host_city"
                name="host_city"
                defaultValue={opportunity.host_city ?? ''}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className={labelClass}>
              Host country
            </label>
            <input
              id="country"
              name="country"
              placeholder="Leave blank if online/global"
              defaultValue={opportunity.country ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <span className={labelClass}>Who can apply, geographically?</span>
            <p className={helpClass}>Select every option that applies — includes &quot;Worldwide&quot; for global opportunities.</p>
            <CheckboxGroup name="geo_scope" options={geoScopes} selected={selections.geo_scope} />
          </div>

          <div>
            <label htmlFor="eligible_countries" className={labelClass}>
              Specific eligible countries or regions
            </label>
            <textarea
              id="eligible_countries"
              name="eligible_countries"
              rows={2}
              placeholder="e.g. Greece, Cyprus, Italy, and Spain"
              defaultValue={opportunity.eligible_countries ?? ''}
              className={inputClass}
            />
            <p className={helpClass}>Only needed when &quot;Specific countries&quot; is checked above.</p>
          </div>

          <div>
            <span className={labelClass}>Academic or career level</span>
            <CheckboxGroup
              name="academic_level"
              options={academicLevels}
              selected={selections.academic_level}
            />
          </div>

          <div>
            <span className={labelClass}>Broad academic fields</span>
            <p className={helpClass}>Select every field that applies — e.g. both Engineering and Policy.</p>
            <CheckboxGroup name="field" options={fields} selected={selections.field} />
          </div>

          <div>
            <label htmlFor="specific_majors" className={labelClass}>
              Specific majors or specializations
            </label>
            <textarea
              id="specific_majors"
              name="specific_majors"
              rows={2}
              defaultValue={opportunity.specific_majors ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="eligibility" className={labelClass}>
              Other eligibility requirements *
            </label>
            <textarea
              id="eligibility"
              name="eligibility"
              rows={2}
              placeholder="Age limits, language requirements, enrollment status..."
              defaultValue={opportunity.eligibility ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <span className={labelClass}>Intended or encouraged groups</span>
            <CheckboxGroup
              name="audience_group"
              options={audienceGroups}
              selected={selections.audience_group}
            />
          </div>

          <div>
            <label htmlFor="audience_notes" className={labelClass}>
              Exact audience wording
            </label>
            <textarea
              id="audience_notes"
              name="audience_notes"
              rows={2}
              defaultValue={opportunity.audience_notes ?? ''}
              className={inputClass}
            />
          </div>
        </Section>

        <Section title="Funding">
          <div>
            <label htmlFor="funding" className={labelClass}>
              Overall funding *
            </label>
            <select
              id="funding"
              name="funding"
              defaultValue={opportunity.funding ?? ''}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="fully_funded">Fully funded</option>
              <option value="partially_funded">Partially funded</option>
              <option value="unfunded">Unfunded</option>
            </select>
            <p className={helpClass}>The simple summary shown on the card. Details below.</p>
          </div>

          <div>
            <span className={labelClass}>Funding, costs, and support features</span>
            <CheckboxGroup
              name="funding_feature"
              options={fundingFeatures}
              selected={selections.funding_feature}
            />
          </div>

          <div>
            <label htmlFor="funding_details" className={labelClass}>
              Funding and benefits details
            </label>
            <textarea
              id="funding_details"
              name="funding_details"
              rows={3}
              placeholder="e.g. €50 participation fee, but accommodation and travel are covered..."
              defaultValue={opportunity.funding_details ?? ''}
              className={inputClass}
            />
          </div>
        </Section>

        <Section title="Dates">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="deadline_raw" className={labelClass}>
                Deadline (as stated)
              </label>
              <input
                id="deadline_raw"
                name="deadline_raw"
                defaultValue={opportunity.deadline_raw ?? ''}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="deadline_at" className={labelClass}>
                Deadline (normalized)
              </label>
              <input
                id="deadline_at"
                name="deadline_at"
                type="datetime-local"
                defaultValue={opportunity.deadline_at?.slice(0, 16) ?? ''}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="deadline_precision" className={labelClass}>
                Precision
              </label>
              <select
                id="deadline_precision"
                name="deadline_precision"
                defaultValue={opportunity.deadline_precision}
                className={inputClass}
              >
                <option value="unknown">Unknown</option>
                <option value="exact">Exact</option>
                <option value="month">Month</option>
                <option value="rolling">Rolling</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="prep_time" className={labelClass}>
              Prep time *
            </label>
            <select
              id="prep_time"
              name="prep_time"
              defaultValue={opportunity.prep_time ?? ''}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="under_an_hour">Quick apply — under an hour</option>
              <option value="a_weekend">A weekend of work</option>
              <option value="longer">Longer, multi-step process</option>
            </select>
            <p className={helpClass}>
              How much work the <em>application itself</em> takes, not the programme — this drives
              the &quot;Coffee break / Weekend trip&quot; effort-ladder filter.
            </p>
          </div>
        </Section>

        <Section title="Application process">
          <div>
            <label htmlFor="application_requirements" className={labelClass}>
              Requirements or selection process
            </label>
            <textarea
              id="application_requirements"
              name="application_requirements"
              rows={2}
              placeholder="CV and motivation letter required. Shortlisted applicants interview..."
              defaultValue={opportunity.application_requirements ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="additional_information" className={labelClass}>
              Anything else worth knowing?
            </label>
            <textarea
              id="additional_information"
              name="additional_information"
              rows={2}
              defaultValue={opportunity.additional_information ?? ''}
              className={inputClass}
            />
          </div>
        </Section>

        <Section
          title="Verification notes"
          description="What was checked and what couldn't be confirmed — never a guess."
        >
          <div>
            <label htmlFor="excluded_claims" className={labelClass}>
              Excluded claims
            </label>
            <textarea
              id="excluded_claims"
              name="excluded_claims"
              rows={2}
              defaultValue={opportunity.excluded_claims ?? ''}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="missing_information" className={labelClass}>
              Missing information
            </label>
            <textarea
              id="missing_information"
              name="missing_information"
              rows={2}
              defaultValue={opportunity.missing_information ?? ''}
              className={inputClass}
            />
          </div>
        </Section>

        <p className={helpClass}>
          * required to publish — enforced by the database, not just this form.
        </p>

        <div className="sticky bottom-4 flex gap-3 rounded-[18px] border-2 border-[color:var(--ink)] bg-[color:var(--paper)] p-4 shadow-[5px_5px_0_var(--ink)]">
          <button
            type="submit"
            className="rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-4 py-2 font-medium"
          >
            Save
          </button>
          {isModerator && (
            <>
              <button
                type="submit"
                formAction={publishWithId}
                className="rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 font-medium text-[color:var(--paper)]"
              >
                Publish
              </button>
              <button
                type="submit"
                formAction={rejectWithId}
                className="ml-auto rounded-[3px] border-2 border-[color:var(--vermilion)] px-4 py-2 font-medium text-[color:var(--vermilion)]"
              >
                Reject
              </button>
            </>
          )}
          {!isModerator && (
            <p className="self-center text-sm text-[color:var(--muted)]">
              A moderator still needs to publish this before it goes live.
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
