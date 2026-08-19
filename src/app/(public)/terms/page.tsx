import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { renderLegalDoc } from '@/lib/legal-doc';

export const metadata = {
  title: 'Terms of service — OffMap',
};

export default async function TermsPage() {
  const raw = await readFile(path.join(process.cwd(), 'docs/legal/terms.md'), 'utf8');
  const { title, body } = renderLegalDoc(raw);

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">{title}</h1>
      {body}
    </main>
  );
}
