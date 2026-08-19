'use client';

// Toggles every row checkbox (name="ids", associated with the bulk form via
// the HTML `form` attribute rather than DOM nesting — see admin/page.tsx) at
// once. A single native checkbox, so Tab + Space operates it like any other
// control — no extra keyboard wiring needed for §10.
export function SelectAllCheckbox() {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        aria-label="Select all rows for bulk actions"
        className="h-4 w-4 border-2 border-[color:var(--ink)]"
        onChange={(event) => {
          const checked = event.currentTarget.checked;
          document.querySelectorAll<HTMLInputElement>('input[name="ids"]').forEach((box) => {
            box.checked = checked;
          });
        }}
      />
      Select all
    </label>
  );
}
