import { NetworkGlobe } from '@/components/shell/network-globe';
import RadialRevealButton from '@/components/shell/radial-reveal-button';
import { Reveal } from '@/components/shell/reveal';

const PRINCIPLES = [
  {
    title: 'No student data, ever',
    body: 'Ambassadors verify listings by hand. They never see who saved what — no student list leaves OffMap, to anyone, for any price.',
  },
  {
    title: 'Verification over speed',
    body: "A slower listing that's true beats a fast one that isn't. If we can't confirm the funding or the deadline, it doesn't publish.",
  },
  {
    title: 'Local knowledge counts',
    body: 'The opportunity on a school noticeboard matters as much as the one that already ranks on Google. That’s the whole reason this exists.',
  },
];

const AMBASSADORS = [
  {
    initials: 'EA',
    color: 'var(--cobalt)',
    name: 'Elena A.',
    role: 'Athens · Founder',
    quote: 'Started because I missed a fellowship deadline by one week.',
  },
  {
    initials: 'NK',
    color: 'var(--teal)',
    name: 'Nikos K.',
    role: 'Thessaloniki · Ambassador',
    quote: 'I find the ones that only exist on a school noticeboard.',
  },
  {
    initials: 'MP',
    color: 'var(--violet)',
    name: 'Maria P.',
    role: 'Patras · Ambassador',
    quote: 'Verifying funding claims is the whole job, honestly.',
  },
  {
    initials: 'DL',
    color: 'var(--vermilion)',
    name: 'Dimitris L.',
    role: 'Heraklion · Contributor',
    quote: 'Every listing I submit, I imagine my 16-year-old self reading it.',
  },
];

const VERIFY_STEPS = [
  {
    num: '01',
    title: 'Someone finds it',
    body: 'An ambassador spots a listing — a noticeboard, a teacher, a link nobody indexed. They send the official page and the type.',
  },
  {
    num: '02',
    title: 'A person checks it',
    body: 'A moderator confirms the funding, the eligibility, the deadline, and the real application route by hand — not a scrape, not a guess.',
  },
  {
    num: '03',
    title: 'It publishes, or it doesn’t',
    body: 'A publish-gate constraint blocks anything missing funding, eligibility, or a verified deadline. No exceptions, no "see details".',
  },
  {
    num: '04',
    title: 'It stays accountable',
    body: 'Every listing carries who verified it and when — "Verified 9 August by Elena" — right on the card, every time.',
  },
];

const WONT_LIST = [
  'Ordinary jobs',
  'Degree scholarships',
  'Generic MOOCs',
  'One-hour webinars',
  'Anything we can’t verify',
];

// Editorial only, per CLAUDE.md non-negotiable #2 — no messaging, comments,
// or public profiles, ever. This page explains the network; it doesn't let
// students find each other. Ambassador cards below are mock content
// matching the approved design concept, pending real spotlights.
export default function CommunityPage() {
  return (
    <main>
      {/* Intro band */}
      <header className="px-6 py-16 md:py-24" style={{ background: 'var(--marigold)' }}>
        <div className="mx-auto max-w-3xl">
          <p
            className="font-[family-name:var(--font-archivo)] text-[13px] font-medium tracking-[0.28em] uppercase"
            style={{ color: 'var(--ink)', opacity: 0.68 }}
          >
            Community
          </p>
          <h1 className="font-[family-name:var(--font-fraunces)] mt-3 text-4xl leading-[1.02] font-black uppercase md:text-6xl">
            Verified by people, not just software.
          </h1>
          <p
            className="mt-5 max-w-xl text-lg font-semibold"
            style={{ color: 'rgba(20,18,16,0.72)' }}
          >
            Every listing on OffMap was found, checked, and signed off by someone real. This is who
            they are and how the checking actually works.
          </p>
        </div>
      </header>

      {/* Mindset / principles */}
      <section className="px-6 py-16 md:py-24" style={{ background: 'var(--paper)' }}>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p
              className="font-[family-name:var(--font-archivo)] text-[12px] font-extrabold tracking-[0.16em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              The mindset
            </p>
            <p className="font-[family-name:var(--font-fraunces)] mt-3.5 max-w-2xl text-2xl leading-snug font-medium md:text-[2.15rem]">
              An ambassador isn&apos;t a job title. It&apos;s noticing a deadline before it matters
              to someone else, and{' '}
              <em
                className="not-italic font-bold"
                style={{
                  background: 'linear-gradient(to top, var(--marigold) 40%, transparent 40%)',
                }}
              >
                writing it down so it doesn&apos;t disappear.
              </em>
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal
                key={p.title}
                className="p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{
                  background: 'var(--card)',
                  border: 'var(--border-width) solid var(--ink)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-offset-sm)',
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-bold">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {p.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ambassadors */}
      <section className="px-6 py-16 md:py-24" style={{ background: 'var(--ink)' }}>
        <div className="mx-auto max-w-5xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-5">
            <h2
              className="font-[family-name:var(--font-fraunces)] max-w-[16ch] text-3xl leading-[1.02] font-extrabold uppercase md:text-4xl"
              style={{ color: 'var(--paper)' }}
            >
              Run by people who found the gaps themselves
            </h2>
            <p
              className="max-w-[34ch] text-[15px] font-semibold"
              style={{ color: 'rgba(245,239,227,0.78)' }}
            >
              Ambassadors and contributors across the network, verifying listings and finding the
              ones that never made it online.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
            {AMBASSADORS.map((a, i) => (
              <Reveal
                key={a.name}
                className="p-5 transition-transform hover:-translate-y-1 hover:-rotate-1"
                style={{
                  background: 'var(--card)',
                  border: 'var(--border-width) solid var(--ink)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-offset-sm)',
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <div
                  className="font-[family-name:var(--font-bungee)] mb-3 flex h-11 w-11 items-center justify-center rounded-full text-sm"
                  style={{ background: a.color, border: 'var(--border-width) solid var(--ink)' }}
                >
                  {a.initials}
                </div>
                <h4 className="font-[family-name:var(--font-fraunces)] text-base font-bold">
                  {a.name}
                </h4>
                <div
                  className="font-[family-name:var(--font-archivo)] mt-0.5 text-[11px] font-bold tracking-[0.05em] uppercase"
                  style={{ color: 'var(--muted)' }}
                >
                  {a.role}
                </div>
                <p className="mt-3 text-[13px] leading-snug">&ldquo;{a.quote}&rdquo;</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How verification works */}
      <section className="px-6 py-16 md:py-24" style={{ background: 'var(--paper)' }}>
        <div className="mx-auto max-w-5xl">
          <p
            className="font-[family-name:var(--font-archivo)] text-[12px] font-extrabold tracking-[0.16em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            How verification works
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VERIFY_STEPS.map((step, i) => (
              <Reveal
                key={step.num}
                className="px-5 py-6 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{
                  background: 'var(--card)',
                  border: 'var(--border-width) solid var(--ink)',
                  borderRadius: 'var(--radius-card)',
                  boxShadow: 'var(--shadow-offset-sm)',
                  transitionDelay: `${i * 60}ms`,
                }}
              >
                <span
                  className="font-[family-name:var(--font-bungee)] text-2xl"
                  style={{ color: 'var(--marigold)', WebkitTextStroke: '1.4px var(--ink)' }}
                >
                  {step.num}
                </span>
                <h3 className="font-[family-name:var(--font-fraunces)] mt-2.5 text-lg font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial standard */}
      <section className="px-6 py-16 md:py-24" style={{ background: 'var(--marigold)' }}>
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.2fr_1fr] md:items-start md:gap-16">
          <Reveal>
            <p
              className="font-[family-name:var(--font-archivo)] text-[12px] font-extrabold tracking-[0.16em] uppercase"
              style={{ color: 'rgba(20,18,16,0.72)' }}
            >
              Editorial standard
            </p>
            <h2 className="font-[family-name:var(--font-fraunces)] mt-3.5 text-2xl leading-snug font-bold md:text-[2rem]">
              The listing set is narrow on purpose. The audience isn&apos;t.
            </h2>
            <p
              className="mt-4 max-w-xl text-[15px] font-semibold"
              style={{ color: 'rgba(20,18,16,0.72)' }}
            >
              OffMap lists selective, time-bounded programmes with an official organiser, a real
              application route, and a benefit beyond a CV line. If a listing pushes toward the
              excluded categories, an ambassador flags it and it doesn&apos;t go up.
            </p>
          </Reveal>
          <Reveal className="flex flex-col gap-2.5" style={{ transitionDelay: '80ms' }}>
            <span
              className="font-[family-name:var(--font-archivo)] text-[11px] font-extrabold tracking-[0.1em] uppercase"
              style={{ color: 'rgba(20,18,16,0.55)' }}
            >
              What we won&apos;t list
            </span>
            {WONT_LIST.map((item) => (
              <span
                key={item}
                className="font-[family-name:var(--font-archivo)] px-4 py-2.5 text-[13px] font-bold"
                style={{
                  background: 'var(--card)',
                  border: 'var(--border-width) solid var(--ink)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                {item}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Network + CTA */}
      <section
        className="relative overflow-hidden px-6 py-16 md:py-24"
        style={{ background: 'var(--ink)' }}
      >
        <NetworkGlobe />
        <div className="relative mx-auto max-w-5xl">
          <Reveal className="max-w-xl">
            <h2
              className="font-[family-name:var(--font-fraunces)] text-3xl leading-tight font-extrabold uppercase md:text-4xl"
              style={{ color: 'var(--paper)' }}
            >
              Know a deadline that only exists on a noticeboard?
            </h2>
            <p
              className="mt-4.5 max-w-[42ch] text-[15px] font-semibold"
              style={{ color: 'rgba(245,239,227,0.78)' }}
            >
              That&apos;s exactly what an ambassador does. No experience required — just the habit
              of noticing before it&apos;s too late for someone else.
            </p>
            <div className="mt-6">
              <RadialRevealButton
                label="Become an ambassador"
                link="/contact"
                addIcon
                icon={{
                  symbol: '→',
                  side: 'right',
                  size: 15,
                  color: 'var(--paper)',
                  hoverColor: 'var(--ink)',
                }}
                padding="16px 28px"
                colors={{
                  fill: 'transparent',
                  textColor: 'var(--paper)',
                  hoverFill: 'var(--marigold)',
                  hoverTextColor: 'var(--ink)',
                }}
                border={{ borderWidth: 2, borderStyle: 'solid', borderColor: 'var(--paper)' }}
                style={{ boxShadow: '5px 5px 0 rgba(245,239,227,0.3)' }}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
