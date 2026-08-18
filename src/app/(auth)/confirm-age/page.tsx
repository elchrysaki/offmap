'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

// Reached only from /callback, only for OAuth signups (Microsoft/Apple/Google)
// that had no signup form to collect age confirmation up front. The profile
// row — and therefore the account — doesn't exist until this is submitted.
function ConfirmAgeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get('next') || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Your session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .insert({ id: user.id, age_confirmed_16_plus: true });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-extrabold">
        One more step
      </h1>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        We need to confirm your age before finishing account setup.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            required
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-1"
          />
          I confirm I am 16 years old or older.
        </label>

        {error && <p className="text-sm text-[color:var(--vermilion)]">{error}</p>}

        <button
          type="submit"
          disabled={loading || !ageConfirmed}
          className="w-full rounded-[3px] border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 font-medium text-[color:var(--paper)] disabled:opacity-50"
        >
          {loading ? 'Finishing…' : 'Continue'}
        </button>
      </form>
    </main>
  );
}

export default function ConfirmAgePage() {
  return (
    <Suspense>
      <ConfirmAgeForm />
    </Suspense>
  );
}
