import { Hero } from '@/components/shell/hero';
import { HowItWorks } from '@/components/shell/how-it-works';
import { NetworkGlobe } from '@/components/shell/network-globe';
import { OpportunitiesReel } from '@/components/shell/opportunities-reel';
import RadialRevealButton from '@/components/shell/radial-reveal-button';
import { Reveal } from '@/components/shell/reveal';
import { Ticker } from '@/components/shell/ticker';

const FACTS = ['Founded in Athens', 'Free for students, always', 'Every listing human-verified'];

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

// Marketing/shell home page (CLAUDE.md §7 shell register). Matches the
// approved design concept — the ambassador cards, opportunity rows, and
// "50+" stat below are mock content, not live data; see the on-page hint
// text and CLAUDE.md §12 step 8 for the real-data migration this is
// standing in for.
export default function MarketingHomePage() {
  return (
    <main>
      <Hero />

      {/* Who we are — rolls up over the hero on scroll */}
      <section
        className="relative -mt-10 px-6 py-16 md:py-24"
        style={{ background: 'var(--paper)', borderRadius: '40px 40px 0 0' }}
      >
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.25fr_1fr] md:gap-16">
          <Reveal>
            <p
              className="font-[family-name:var(--font-archivo)] text-[12px] font-extrabold tracking-[0.16em] uppercase"
              style={{ color: 'var(--muted)' }}
            >
              Who we are
            </p>
            <p className="font-[family-name:var(--font-fraunces)] mt-3.5 text-2xl leading-snug font-medium md:text-[2.15rem]">
              Most of what&apos;s selective{' '}
              <em
                className="not-italic font-bold"
                style={{
                  background: 'linear-gradient(to top, var(--marigold) 40%, transparent 40%)',
                }}
              >
                never makes it online.
              </em>{' '}
              It travels by word of mouth — a teacher who happens to know, a group chat you
              weren&apos;t in. OffMap is where that word of mouth gets written down, verified, and
              put on a deadline.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {FACTS.map((fact) => (
                <span
                  key={fact}
                  className="font-[family-name:var(--font-archivo)] px-3.5 py-2 text-[11px] font-extrabold tracking-[0.05em] uppercase"
                  style={{
                    background: 'var(--card)',
                    border: 'var(--border-width) solid var(--ink)',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  {fact}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {[
              { num: '50+', label: 'Verified opportunities, currently open' },
              { num: '0', label: 'Ads on your deadline page' },
              { num: '16+', label: 'Self-declared. No parental gate, ever' },
            ].map((stat, i) => (
              <Reveal
                key={stat.label}
                className="flex items-baseline gap-3.5 px-5 py-4.5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
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
                  style={{ color: 'var(--vermilion)' }}
                >
                  {stat.num}
                </span>
                <span className="text-[13px] font-bold" style={{ color: 'var(--muted)' }}>
                  {stat.label}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Ticker />

      <OpportunitiesReel />

      {/* How it works */}
      <section className="px-6 py-16 md:py-24" style={{ background: 'var(--paper)' }}>
        <div className="mx-auto max-w-5xl">
          <p
            className="font-[family-name:var(--font-archivo)] text-[12px] font-extrabold tracking-[0.16em] uppercase"
            style={{ color: 'var(--muted)' }}
          >
            How it works
          </p>
          <HowItWorks />
        </div>
      </section>

      {/* Ambassadors — mock cards matching the approved design concept. */}
      <section className="px-6 py-16 md:py-24" style={{ background: 'var(--marigold)' }}>
        <div className="mx-auto max-w-5xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-5">
            <h2 className="font-[family-name:var(--font-fraunces)] max-w-[14ch] text-3xl leading-[1.02] font-extrabold uppercase md:text-4xl">
              Run by people who found the gaps themselves
            </h2>
            <p
              className="max-w-[34ch] text-[15px] font-semibold"
              style={{ color: 'rgba(20,18,16,0.72)' }}
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

      {/* Community & mindset */}
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
              The network runs on people who show up for someone they&apos;ll never meet.
            </h2>
            <p
              className="mt-4.5 max-w-[42ch] text-[15px] font-semibold"
              style={{ color: 'rgba(245,239,227,0.78)' }}
            >
              An ambassador isn&apos;t a job title. It&apos;s noticing a deadline before it matters
              to someone else, and writing it down so it doesn&apos;t disappear.
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
