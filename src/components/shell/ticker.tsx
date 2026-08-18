// Decorative marquee.
const ITEMS = [
  'Piraeus Robotics Challenge',
  'European Youth Parliament',
  'MIT PRIMES-USA',
  'Athens Model UN',
  'CERN Summer Student',
  'Erasmus+ Youth Exchange',
];

export function Ticker() {
  const items = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden py-3.5" style={{ background: 'var(--ink)' }} aria-hidden="true">
      <ul className="animate-marquee m-0 flex list-none p-0 whitespace-nowrap">
        {items.map((item, i) => (
          <li
            key={i}
            className="font-[family-name:var(--font-archivo)] mx-[18px] inline-flex items-center gap-3.5 text-[13px] font-extrabold tracking-[0.1em] uppercase"
            style={{ color: 'var(--paper)' }}
          >
            {item}
            <span style={{ opacity: 0.5 }}>&#10022;</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
