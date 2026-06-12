'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function creaCliente(formData: FormData) {
  const supabase = getSupabaseAdmin();
  await supabase.from('clienti').insert({
    nome: String(formData.get('nome') || ''),
    email: String(formData.get('email') || ''),
    telefono: String(formData.get('telefono') || ''),
    note: String(formData.get('note') || '')
  });
  revalidatePath('/admin/clienti');
}
