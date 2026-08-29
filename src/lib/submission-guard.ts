import 'server-only';

// Blocks obviously malicious or bot-shaped /submit attempts before anything
// reads them. Ported from offmap-hub's classify_submission_risk.py (the
// previous GitHub-issue submission pipeline's severe-risk classifier) and
// adapted to the current single-form intake. Dangerous URL schemes
// (javascript:/file:/data:/vbscript:) never reach here — the https-only
// check already in submit/actions.ts excludes anything that isn't
// http:/https:. This covers what that check doesn't: SSRF targets.
const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.home', '.lan'];

function isPrivateIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if ([a, b, Number(match[3]), Number(match[4])].some((n) => n > 255)) return false;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIPv6(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return (
    host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:')
  );
}

export function unsafeSubmissionUrlReason(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return 'malformed-url';
  }

  if (url.username || url.password) return 'embedded-credentials';

  const hostname = url.hostname.toLowerCase();
  if (!hostname) return 'malformed-url';
  if (
    hostname === 'localhost' ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    return 'private-network-target';
  }
  if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) return 'private-network-target';

  return null;
}
