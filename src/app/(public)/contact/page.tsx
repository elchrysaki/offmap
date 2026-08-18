export default function ContactPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-extrabold">Contact</h1>
      <p className="mt-3 text-[15px]" style={{ color: 'var(--muted)' }}>
        Placeholder — real contact form and support flow land here.
      </p>
      <a
        href="mailto:hello@offmap.gr"
        className="mt-6 inline-block text-[14px] font-bold underline"
        style={{ color: 'var(--cobalt)' }}
      >
        hello@offmap.gr
      </a>
    </main>
  );
}
