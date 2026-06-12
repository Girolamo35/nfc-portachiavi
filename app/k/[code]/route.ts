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
    .select(`
      id,
      code,
      active,
      clients (
        id,
        name,
        default_url,
        active
      )
    `)
    .eq('code', codicePulito)
    .maybeSingle();

  if (error) {
    console.error('Errore Supabase:', error);
    return new NextResponse('Errore Supabase: ' + error.message, {
      status: 500,
    });
  }

  if (!data) {
    return new NextResponse('Codice non trovato: ' + codicePulito, {
      status: 404,
    });
  }

  const record = data as any;
  const cliente = Array.isArray(record.clients)
    ? record.clients[0]
    : record.clients;

  if (!record.active) {
    return new NextResponse('Portachiavi disattivato', {
      status: 404,
    });
  }

  if (!cliente || !cliente.active) {
    return new NextResponse('Cliente disattivato', {
      status: 404,
    });
  }

  if (!cliente.default_url) {
    return new NextResponse('Link cliente non configurato', {
      status: 404,
    });
  }

  return NextResponse.redirect(cliente.default_url);
}