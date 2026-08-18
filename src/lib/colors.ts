// Category colour (CLAUDE.md §7, 17 Aug reversal of non-negotiable #9):
// one flat token colour per opportunity type_id, consistent across the app.
// Additive to status colours (vermilion/pink), never replaces them.
const CATEGORY_PALETTE = ['cobalt', 'marigold', 'violet', 'teal', 'lime'] as const;

export type CategoryColor = (typeof CATEGORY_PALETTE)[number];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function categoryColorFor(typeId: string): CategoryColor {
  return CATEGORY_PALETTE[hashString(typeId) % CATEGORY_PALETTE.length] ?? CATEGORY_PALETTE[0];
}

export function categoryColorVar(typeId: string) {
  return `var(--${categoryColorFor(typeId)})`;
}
