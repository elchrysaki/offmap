// Scheduled by pg_cron (see the cron job set up alongside this deploy).
// Checks every published listing against three independent alert types a
// student can opt into per save (saved_opportunity.notify_opens /
// notify_start_writing / notify_closing) — each with its own sent-tracking
// timestamp, so the same save can fire all three exactly once over its
// life instead of a single "closing soon" email.
//
// The whole point: "told before it matters to them" (CLAUDE.md one-line
// pitch), not after.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const FROM_ADDRESS = 'OffMap <alerts@contact.offmap.gr>';
const REPLY_TO = 'hello@offmap.gr';

// "Closing soon" fires once a deadline is this close.
const CLOSING_WINDOW_DAYS = 3;

// Hard ceiling independent of any Resend quota — caps blast radius if a
// data bug ever makes this match far more rows than expected in one run.
const MAX_PER_RUN = 200;

type Opportunity = {
  id: string;
  title: string | null;
  organiser: string | null;
  deadline_at: string | null;
  deadline_precision: string;
  apply_url: string | null;
  official_url: string;
  opens_at: string | null;
  prep_time: 'under_an_hour' | 'a_weekend' | 'longer' | null;
};

type AlertKind = 'opens' | 'start_writing' | 'closing';

const NOTIFY_COLUMN: Record<AlertKind, 'notify_opens' | 'notify_start_writing' | 'notify_closing'> =
  {
    opens: 'notify_opens',
    start_writing: 'notify_start_writing',
    closing: 'notify_closing',
  };

const SENT_COLUMN: Record<
  AlertKind,
  'opens_alert_sent_at' | 'start_writing_alert_sent_at' | 'closing_alert_sent_at'
> = {
  opens: 'opens_alert_sent_at',
  start_writing: 'start_writing_alert_sent_at',
  closing: 'closing_alert_sent_at',
};

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysUntil(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// How far ahead of a deadline the "start writing" nudge fires, based on how
// long the application itself takes — a v1 heuristic, not measured data.
// Worth revisiting once real prep_time/deadline pairs exist to check against.
function startWritingLeadDays(prepTime: Opportunity['prep_time']) {
  switch (prepTime) {
    case 'under_an_hour':
      return 2;
    case 'a_weekend':
      return 7;
    case 'longer':
      return 21;
    default:
      return 7;
  }
}

function emailContent(kind: AlertKind, opportunity: Opportunity) {
  const title = opportunity.title ?? 'An opportunity you saved';
  const org = opportunity.organiser ? ` (${opportunity.organiser})` : '';
  const applyLink = opportunity.apply_url ?? opportunity.official_url;

  if (kind === 'opens') {
    return {
      subject: `Applications are open: ${title}`,
      html: `
        <p>Hi,</p>
        <p><strong>${title}</strong>${org} just opened for applications.</p>
        <p><a href="${applyLink}">Apply now &rarr;</a></p>
        <p style="color:#8A7F6B;font-size:13px;">You're getting this because you asked to be notified when applications open for this saved opportunity.</p>
      `,
    };
  }

  if (kind === 'start_writing') {
    const days = daysUntil(opportunity.deadline_at!);
    const dayWord = days === 1 ? 'day' : 'days';
    return {
      subject: `Time to start: ${title}`,
      html: `
        <p>Hi,</p>
        <p><strong>${title}</strong>${org} closes in ${days} ${dayWord} — ${formatDeadline(opportunity.deadline_at!)}. Based on how long this one usually takes, now's a good time to start.</p>
        <p><a href="${applyLink}">Start your application &rarr;</a></p>
        <p style="color:#8A7F6B;font-size:13px;">You're getting this because you asked for a heads-up to start writing on this saved opportunity.</p>
      `,
    };
  }

  const days = daysUntil(opportunity.deadline_at!);
  const dayWord = days === 1 ? 'day' : 'days';
  return {
    subject: `${days} ${dayWord} left: ${title}`,
    html: `
      <p>Hi,</p>
      <p><strong>${title}</strong>${org} closes in ${days} ${dayWord} — ${formatDeadline(opportunity.deadline_at!)}.</p>
      <p><a href="${applyLink}">Apply now &rarr;</a></p>
      <p style="color:#8A7F6B;font-size:13px;">You're getting this because you saved this opportunity on OffMap. This is the only email you'll get for this stage.</p>
    `,
  };
}

async function sendAlertEmail(to: string, kind: AlertKind, opportunity: Opportunity) {
  const { subject, html } = emailContent(kind, opportunity);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, reply_to: REPLY_TO, subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
  }
}

type Result = {
  saved_opportunity_id: string;
  opportunity_id: string;
  kind: AlertKind;
  status: string;
};

async function fireAlertType(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  kind: AlertKind,
  opportunity: Opportunity,
  results: Result[],
) {
  const notifyColumn = NOTIFY_COLUMN[kind];
  const sentColumn = SENT_COLUMN[kind];

  const { data: saves, error: savesError } = await supabase
    .from('saved_opportunity')
    .select('id, profile_id')
    .eq('opportunity_id', opportunity.id)
    .eq(notifyColumn, true)
    .is(sentColumn, null);

  if (savesError) {
    results.push({
      saved_opportunity_id: '(query failed)',
      opportunity_id: opportunity.id,
      kind,
      status: savesError.message,
    });
    return;
  }

  for (const save of saves ?? []) {
    try {
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(
        save.profile_id,
      );
      if (userError || !user?.user?.email) {
        throw new Error(userError?.message ?? 'no email on file for this profile');
      }

      await sendAlertEmail(user.user.email, kind, opportunity);

      await supabase
        .from('saved_opportunity')
        .update({ [sentColumn]: new Date().toISOString() })
        .eq('id', save.id);

      results.push({
        saved_opportunity_id: save.id,
        opportunity_id: opportunity.id,
        kind,
        status: 'sent',
      });
    } catch (err) {
      results.push({
        saved_opportunity_id: save.id,
        opportunity_id: opportunity.id,
        kind,
        status: `error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }
}

Deno.serve(async () => {
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY secret not set for this function' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const now = Date.now();
  const closingWindowEnd = new Date(now + CLOSING_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: opportunities, error: oppError } = await supabase
    .from('opportunity')
    .select(
      'id, title, organiser, deadline_at, deadline_precision, apply_url, official_url, opens_at, prep_time',
    )
    .eq('review_state', 'published')
    .limit(MAX_PER_RUN);

  if (oppError) {
    return new Response(JSON.stringify({ error: oppError.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const results: Result[] = [];

  for (const opportunity of (opportunities ?? []) as Opportunity[]) {
    const deadline = opportunity.deadline_at ? new Date(opportunity.deadline_at).getTime() : null;

    if (opportunity.opens_at && new Date(opportunity.opens_at).getTime() <= now) {
      await fireAlertType(supabase, 'opens', opportunity, results);
    }

    if (deadline !== null && deadline > now) {
      const leadMs = startWritingLeadDays(opportunity.prep_time) * 24 * 60 * 60 * 1000;
      if (deadline <= now + leadMs) {
        await fireAlertType(supabase, 'start_writing', opportunity, results);
      }

      if (deadline <= new Date(closingWindowEnd).getTime()) {
        await fireAlertType(supabase, 'closing', opportunity, results);
      }
    }
  }

  return new Response(
    JSON.stringify({ checked: opportunities?.length ?? 0, sent: results.length, results }),
    { headers: { 'content-type': 'application/json' } },
  );
});
