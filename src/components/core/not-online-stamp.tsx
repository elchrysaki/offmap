// The NOT ONLINE stamp (CLAUDE.md §7, signature element 2). Fires on
// reach: local, nowhere else. The product thesis compressed into one mark.
export function NotOnlineStamp() {
  return (
    <span
      className="font-[family-name:var(--font-bungee)] inline-block px-1.5 py-0.5 text-[9px] tracking-wide uppercase"
      style={{
        background: 'var(--pink)',
        color: 'var(--card)',
        borderRadius: 'var(--radius-stamp)',
        transform: 'rotate(-3deg)',
      }}
    >
      Not online
    </span>
  );
}
