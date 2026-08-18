export function submissionReference(id: number | string): string {
  return `OF-${String(id).padStart(6, '0')}`
}
