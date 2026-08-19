// Scheduled by pg_cron (see the cron job set up alongside this deploy).
// Finds published listings whose deadline falls within the alert window,
// and emails every student who saved them — once each, ever, per save.
//
// The whole point of the alert window: "told before it matters to them"
// (CLAUDE.md one-line pitch), not after. last_alert_sent_at on
// saved_opportunity is the only thing preventing a repeat email on the
// next day's run.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const FROM_ADDRESS = 'OffMap <alerts@contact.offmap.gr>';
const REPLY_TO = 'hello@offmap.gr';

// Send once a saved opportunity's deadline is this close — not the moment
// it's saved, not after it's passed.
const ALERT_WINDOW_DAYS = 3;

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

async function sendAlertEmail(to: string, opportunity: Opportunity) {
  const days = daysUntil(opportunity.deadline_at!);
  const title = opportunity.title ?? 'An opportunity you saved';
  const dayWord = days === 1 ? 'day' : 'days';
  const applyLink = opportunity.apply_url ?? opportunity.official_url;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      reply_to: REPLY_TO,
      subject: `${days} ${dayWord} left: ${title}`,
      html: `
        <p>Hi,</p>
        <p><strong>${title}</strong>${opportunity.organiser ? ` (${opportunity.organiser})` : ''} closes in ${days} ${dayWord} — ${formatDeadline(opportunity.deadline_at!)}.</p>
        <p><a href="${applyLink}">Apply now &rarr;</a></p>
        <p style="color:#8A7F6B;font-size:13px;">You're getting this because you saved this opportunity on OffMap. This is the only email you'll get about it.</p>
      `,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
  }
}

Deno.serve(async () => {
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY secret not set for this function' }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      },
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const windowEnd = new Date(Date.now() + ALERT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Published opportunities whose deadline is within the window and hasn't
  // passed yet.
  const { data: closingSoon, error: oppError } = await supabase
    .from('opportunity')
    .select('id, title, organiser, deadline_at, deadline_precision, apply_url, official_url')
    .eq('review_state', 'published')
    .not('deadline_at', 'is', null)
    .gt('deadline_at', new Date().toISOString())
    .lte('deadline_at', windowEnd)
    .limit(MAX_PER_RUN);

  if (oppError) {
    return new Response(JSON.stringify({ error: oppError.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const results: Array<{ saved_opportunity_id: string; opportunity_id: string; status: string }> =
    [];

  for (const opportunity of closingSoon ?? []) {
    const { data: saves, error: savesError } = await supabase
      .from('saved_opportunity')
      .select('id, profile_id')
      .eq('opportunity_id', opportunity.id)
      .is('last_alert_sent_at', null);

    if (savesError) {
      results.push({
        saved_opportunity_id: '(query failed)',
        opportunity_id: opportunity.id,
        status: savesError.message,
      });
      continue;
    }

    for (const save of saves ?? []) {
      try {
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(
          save.profile_id,
        );
        if (userError || !user?.user?.email) {
          throw new Error(userError?.message ?? 'no email on file for this profile');
        }

        await sendAlertEmail(user.user.email, opportunity as Opportunity);

        await supabase
          .from('saved_opportunity')
          .update({ last_alert_sent_at: new Date().toISOString() })
          .eq('id', save.id);

        results.push({
          saved_opportunity_id: save.id,
          opportunity_id: opportunity.id,
          status: 'sent',
        });
      } catch (err) {
        results.push({
          saved_opportunity_id: save.id,
          opportunity_id: opportunity.id,
          status: `error: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    }
  }

  return new Response(
    JSON.stringify({ checked: closingSoon?.length ?? 0, sent: results.length, results }),
    {
      headers: { 'content-type': 'application/json' },
    },
  );
});
