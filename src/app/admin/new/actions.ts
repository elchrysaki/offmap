'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

// Matches CLAUDE.md §5: an ambassador sends a link and a type, nothing else
// is required at creation. Everything past that happens on the edit page.
export async function createOpportunity(formData: FormData) {
  const officialUrl = formData.get('official_url') as string;
  const typeId = formData.get('type_id') as string;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('opportunity')
    .insert({ official_url: officialUrl, type_id: typeId })
    .select('id')
    .single();

  if (error) throw error;

  redirect(`/admin/opportunities/${data.id}`);
}
