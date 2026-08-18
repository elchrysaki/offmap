import Link from 'next/link';

import { getPendingOpportunities } from '@/lib/queries/admin-opportunities';

export default async function AdminQueuePage() {
  const pending = await getPendingOpportunities();

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
        <ul className="mt-6 divide-y divide-[color:var(--rule)]">
          {pending.map((o) => (
            <li key={o.id} className="py-3">
              <Link href={`/admin/opportunities/${o.id}`} className="font-medium hover:underline">
                {o.title || '(untitled)'}
              </Link>
              <p className="text-sm text-[color:var(--muted)]">
                {o.organiser || 'No organiser set'} · {o.review_state}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
