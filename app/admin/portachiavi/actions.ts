'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function creaPortachiave(formData: FormData) {
  const supabase = getSupabaseAdmin();
  await supabase.from('portachiavi').insert({
    codice: String(formData.get('codice') || '').trim(),
    cliente_id: String(formData.get('cliente_id') || '') || null,
    nome: String(formData.get('nome') || ''),
    link_attuale: String(formData.get('link_attuale') || 'https://example.com'),
    attivo: true
  });
  revalidatePath('/admin/portachiavi');
}

export async function aggiornaLink(formData: FormData) {
  const supabase = getSupabaseAdmin();
  await supabase.from('portachiavi').update({
    link_attuale: String(formData.get('link_attuale') || ''),
    attivo: formData.get('attivo') === 'on'
  }).eq('id', String(formData.get('id')));
  revalidatePath('/admin/portachiavi');
}
