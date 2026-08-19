import { SubmitForm } from '@/components/shell/submit-form';
import { getTypes } from '@/lib/queries/taxonomy';

// Public, unauthenticated intake (CLAUDE.md §7, §12 step 10) — not the
// ambassador tool at /admin/new. Shell register: this is where the collage
// lives, not the browse/detail pages. Writes a `lead` row via the
// submitOpportunity server action, which only has an insert path at all
// because of the narrowly-scoped RLS policy added in
// supabase/migrations/20260819120000_public_lead_submission.sql.
export default async function SubmitPage() {
  const types = await getTypes();

  return (
    <main className="relative overflow-hidden" style={{ background: 'var(--paper)' }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(var(--rule) 1.4px, transparent 1.4px)',
          backgroundSize: '18px 18px',
        }}
      />

      <div className="relative mx-auto max-w-2xl px-6 py-16 md:py-24">
        <span
          className="font-[family-name:var(--font-bungee)] inline-block px-3 py-1.5 text-[11px]"
          style={{
            background: 'var(--violet)',
            color: 'var(--card)',
            borderRadius: 'var(--radius-stamp)',
            transform: 'rotate(-3deg)',
          }}
        >
          KNOW SOMETHING WE DON&apos;T?
        </span>

        <h1 className="font-[family-name:var(--font-fraunces)] mt-5 text-4xl leading-[1.02] font-extrabold uppercase md:text-5xl">
          Organising something selective — or know someone who is?
        </h1>
        <p className="mt-4 max-w-xl text-[16px] font-medium" style={{ color: 'var(--muted)' }}>
          Send us the link. No account, no forms to fill out twice — an ambassador or moderator
          takes it from there and checks everything before it ever goes live.
        </p>

        <div className="mt-10">
          <SubmitForm types={types} />
        </div>

        <p className="mt-8 text-center text-[13px]" style={{ color: 'var(--muted)' }}>
          Building the listing yourself?{' '}
          <a href="/contact" className="font-bold underline" style={{ color: 'var(--cobalt)' }}>
            Get in touch
          </a>{' '}
          about becoming an ambassador instead.
        </p>
      </div>
    </main>
  );
}
