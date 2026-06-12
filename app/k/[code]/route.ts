import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const codicePulito = code.trim();

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('keychains')
    .select('code, target_url, active')
    .eq('code', codicePulito)
    .maybeSingle();

  if (error) {
    console.error('Errore Supabase:', error);
    return new NextResponse('Errore Supabase: ' + error.message, {
      status: 500,
    });
  }

  if (!data) {
    console.log('Codice non trovato:', codicePulito);
    return new NextResponse('Codice non trovato: ' + codicePulito, {
      status: 404,
    });
  }

  if (!data.active) {
    return new NextResponse('Portachiavi disattivato', {
      status: 404,
    });
  }

  return NextResponse.redirect(data.target_url);
}