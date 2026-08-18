import { getTypes } from '@/lib/queries/taxonomy';

import { createOpportunity } from './actions';

const inputClass =
  'mt-1 w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--card)] px-3 py-2';
const labelClass = 'block text-sm font-medium';

export default async function NewOpportunityPage() {
  const types = await getTypes();

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
        New listing
      </h1>
      <p className="mt-1 text-sm text-[color:var(--muted)]">
        Just the link and the type to start. Everything else gets filled in on the next page.
      </p>

      <form action={createOpportunity} className="mt-6 space-y-4">
        <div>
          <label htmlFor="official_url" className={labelClass}>
            Official URL
          </label>
          <input
            id="official_url"
            name="official_url"
            type="url"
            required
            placeholder="https://…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="type_id" className={labelClass}>
            Type
          </label>
          <select id="type_id" name="type_id" required className={inputClass}>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label_en}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 font-medium text-[color:var(--paper)]"
        >
          Continue
        </button>
      </form>
    </main>
  );
}
