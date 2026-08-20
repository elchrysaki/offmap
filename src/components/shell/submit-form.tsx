'use client';

import { useActionState } from 'react';

import { submitOpportunity } from '@/app/(public)/submit/actions';
import { initialSubmitState, type SubmitState } from '@/app/(public)/submit/submit-state';

type TypeOption = { id: string; label_en: string };

const TAG_COLORS = [
  'var(--cobalt)',
  'var(--marigold)',
  'var(--violet)',
  'var(--teal)',
  'var(--lime)',
];

const inputStyle = {
  border: 'var(--border-width) solid var(--ink)',
  borderRadius: 'var(--radius-stamp)',
  background: 'var(--paper)',
};

const labelClass =
  'font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.1em] uppercase';

export function SubmitForm({
  types,
  submitterEmail,
}: {
  types: TypeOption[];
  submitterEmail: string;
}) {
  const [state, formAction, isPending] = useActionState<SubmitState, FormData>(
    submitOpportunity,
    initialSubmitState,
  );

  if (state.status === 'success') {
    return (
      <div
        className="relative px-7 py-10 text-center md:px-10"
        style={{
          background: 'var(--card)',
          border: 'var(--border-width) solid var(--ink)',
          borderRadius: 'var(--radius-panel)',
          boxShadow: 'var(--shadow-offset)',
        }}
        role="status"
      >
        <span
          className="font-[family-name:var(--font-bungee)] mx-auto inline-block px-3 py-1.5 text-[11px]"
          style={{
            background: 'var(--teal)',
            color: 'var(--card)',
            borderRadius: 'var(--radius-stamp)',
            transform: 'rotate(-3deg)',
          }}
        >
          SUBMITTED
        </span>
        <p className="font-[family-name:var(--font-fraunces)] mt-5 text-2xl font-extrabold md:text-3xl">
          It&apos;s in the queue.
        </p>
        <p className="mx-auto mt-3 max-w-md text-[15px]" style={{ color: 'var(--muted)' }}>
          An ambassador or moderator checks every submission by hand — the funding, the eligibility,
          whether it&apos;s actually selective. If it holds up, it goes live with a &ldquo;Submitted
          by&rdquo; line crediting you. Nothing publishes just because it was sent in.
        </p>
        <a
          href="/submit"
          className="font-[family-name:var(--font-archivo)] mt-6 inline-block text-[13px] font-bold underline"
          style={{ color: 'var(--cobalt)' }}
        >
          Submit another
        </a>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="relative space-y-5 px-6 py-8 md:px-9 md:py-10"
      style={{
        background: 'var(--card)',
        border: 'var(--border-width) solid var(--ink)',
        borderRadius: 'var(--radius-panel)',
        boxShadow: 'var(--shadow-offset)',
      }}
    >
      {/* Honeypot — hidden from real visitors, sighted bots that fill every
          field will trip it. Not the field name a person would expect. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="official_url" className={labelClass}>
          Official link
        </label>
        <input
          id="official_url"
          name="official_url"
          type="url"
          required
          placeholder="https://…"
          className="mt-1.5 w-full px-3.5 py-2.5 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={inputStyle}
        />
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
          The programme&apos;s own page — not a news article about it, not a group chat screenshot.
        </p>
      </div>

      <div>
        <label htmlFor="type_id" className={labelClass}>
          Type
        </label>
        <select
          id="type_id"
          name="type_id"
          required
          defaultValue=""
          className="mt-1.5 w-full px-3.5 py-2.5 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={inputStyle}
        >
          <option value="" disabled>
            Choose one…
          </option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label_en}
            </option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden="true">
          {types.slice(0, 5).map((type, i) => (
            <span
              key={type.id}
              className="font-[family-name:var(--font-archivo)] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.05em] uppercase"
              style={{
                background: TAG_COLORS[i % TAG_COLORS.length],
                color: 'var(--ink)',
                borderRadius: 'var(--radius-stamp)',
              }}
            >
              {type.label_en}
            </span>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="organiser" className={labelClass}>
          Organiser <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(optional)</span>
        </label>
        <input
          id="organiser"
          name="organiser"
          type="text"
          placeholder="Who runs it"
          className="mt-1.5 w-full px-3.5 py-2.5 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="note" className={labelClass}>
          Why is it selective?{' '}
          <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={600}
          placeholder="An application round, an acceptance rate, a real funder — whatever makes this more than an open sign-up."
          className="mt-1.5 w-full px-3.5 py-2.5 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
          style={inputStyle}
        />
        <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
          Skip funding, deadline and eligibility — that&apos;s verified by hand, not taken on your
          word.
        </p>
      </div>

      <fieldset
        className="space-y-3 px-4 py-4"
        style={{
          border: '1.5px dashed var(--rule)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <legend className={labelClass} style={{ color: 'var(--muted)' }}>
          Who&apos;s submitting this
        </legend>
        <div>
          <label htmlFor="submitter_name" className={labelClass}>
            Your name <span style={{ color: 'var(--muted)', fontWeight: 500 }}>(optional)</span>
          </label>
          <input
            id="submitter_name"
            name="submitter_name"
            type="text"
            placeholder="Shown publicly if this goes live — “Submitted by …”"
            className="mt-1.5 w-full px-3.5 py-2.5 text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)]"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="submitter_email" className={labelClass}>
            Your email
          </label>
          <input
            id="submitter_email"
            name="submitter_email"
            type="email"
            defaultValue={submitterEmail}
            readOnly
            className="mt-1.5 w-full px-3.5 py-2.5 text-[15px]"
            style={{ ...inputStyle, opacity: 0.7 }}
          />
          <p className="mt-1.5 text-[13px]" style={{ color: 'var(--muted)' }}>
            From your account. Only used if a moderator needs to ask a question — never shown
            publicly.
          </p>
        </div>
      </fieldset>

      {state.status === 'error' && (
        <p
          role="alert"
          className="px-3.5 py-2.5 text-[14px] font-medium"
          style={{
            color: 'var(--ink)',
            background: 'rgba(240,66,28,0.12)',
            border: '1.5px solid var(--vermilion)',
            borderRadius: 'var(--radius-stamp)',
          }}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="font-[family-name:var(--font-archivo)] w-full px-5 py-3.5 text-[14px] font-extrabold tracking-[0.04em] uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--cobalt)] disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
        style={{
          background: 'var(--ink)',
          color: 'var(--paper)',
          border: 'var(--border-width) solid var(--ink)',
          borderRadius: 'var(--radius-pill)',
          boxShadow: 'var(--shadow-offset-sm)',
        }}
      >
        {isPending ? 'Sending…' : 'Submit opportunity'}
      </button>
    </form>
  );
}
