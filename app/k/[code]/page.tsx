import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { redirect } from 'next/navigation';

function pulisciNumeroWhatsApp(numero: string) {
  return numero.replace(/\D/g, '');
}

export default async function KeychainPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
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
        active,
        use_landing,
        whatsapp_number,
        whatsapp_message,
        landing_title,
        landing_text,
        logo_url
      )
    `)
    .eq('code', codicePulito)
    .maybeSingle();

  if (error) {
    return (
      <main style={{ padding: 40, fontFamily: 'Arial' }}>
        <h1>Errore Supabase</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 40, fontFamily: 'Arial' }}>
        <h1>Codice non trovato</h1>
        <p>{codicePulito}</p>
      </main>
    );
  }

  const record = data as any;

  const cliente = Array.isArray(record.clients)
    ? record.clients[0]
    : record.clients;

  if (!record.active) {
    return (
      <main style={{ padding: 40, fontFamily: 'Arial' }}>
        <h1>Portachiavi disattivato</h1>
      </main>
    );
  }

  if (!cliente || !cliente.active) {
    return (
      <main style={{ padding: 40, fontFamily: 'Arial' }}>
        <h1>Cliente disattivato</h1>
      </main>
    );
  }

  const linkContenuto = cliente.default_url || 'https://google.com';

  if (!cliente.use_landing) {
    redirect(linkContenuto);
  }

  const nomeCliente = cliente.name || 'Cliente';

  const titolo =
    cliente.landing_title ||
    `Ricevi offerte e novità ${nomeCliente}`;

  const testo =
    cliente.landing_text ||
    'Entra nella nostra lista WhatsApp per ricevere promozioni, aggiornamenti e nuovi contenuti in anteprima.';

  const numeroWhatsApp = cliente.whatsapp_number
    ? pulisciNumeroWhatsApp(cliente.whatsapp_number)
    : '';

  const messaggioWhatsApp =
    cliente.whatsapp_message ||
    `Ciao, voglio ricevere aggiornamenti, offerte e nuovi contenuti da ${nomeCliente}.`;

  const linkWhatsApp = numeroWhatsApp
    ? `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(messaggioWhatsApp)}`
    : '';

  const logoUrl = cliente.logo_url || '';

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f6f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'Arial',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'white',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
          textAlign: 'center',
        }}
      >
        {logoUrl ? (
          <div style={{ margin: '0 auto 18px' }}>
            <img
              src={logoUrl}
              alt={`Logo ${nomeCliente}`}
              style={{
                maxWidth: 160,
                maxHeight: 100,
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 76,
              height: 76,
              margin: '0 auto 18px',
              borderRadius: '50%',
              background: '#0f3b73',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 'bold',
            }}
          >
            {nomeCliente.charAt(0).toUpperCase()}
          </div>
        )}

        <h1
          style={{
            margin: '0 0 12px',
            fontSize: 28,
            color: '#111827',
          }}
        >
          {titolo}
        </h1>

        <p
          style={{
            margin: '0 0 28px',
            color: '#4b5563',
            lineHeight: 1.5,
            fontSize: 16,
          }}
        >
          {testo}
        </p>

        {linkWhatsApp ? (
          <a
            href={linkWhatsApp}
            target="_blank"
            style={{
              display: 'block',
              width: '100%',
              padding: '15px 18px',
              borderRadius: 14,
              background: '#22c55e',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: 16,
              marginBottom: 14,
              boxSizing: 'border-box',
            }}
          >
            Ricevi novità su WhatsApp
          </a>
        ) : (
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: '#fee2e2',
              color: '#991b1b',
              marginBottom: 14,
              fontSize: 14,
            }}
          >
            Numero WhatsApp non configurato
          </div>
        )}

        <a
          href={linkContenuto}
          target="_blank"
          style={{
            display: 'block',
            width: '100%',
            padding: '15px 18px',
            borderRadius: 14,
            background: '#0f3b73',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: 16,
            marginBottom: 18,
            boxSizing: 'border-box',
          }}
        >
          Guarda il contenuto di oggi
        </a>

        <p
          style={{
            margin: 0,
            color: '#6b7280',
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          Iscrizione gratuita. Puoi uscire dalla lista in qualsiasi momento.
        </p>
      </section>
    </main>
  );
}