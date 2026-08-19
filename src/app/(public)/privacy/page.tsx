import { renderLegalDoc } from '@/lib/legal-doc';

export const metadata = {
  title: 'Privacy policy — OffMap',
};

export default async function PrivacyPage() {
  const { title, body } = await renderLegalDoc('docs/legal/privacy-policy.md');

  return (
    <main className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">{title}</h1>
      {body}
    </main>
  );
}
