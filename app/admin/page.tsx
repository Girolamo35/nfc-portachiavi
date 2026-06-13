import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import CopyButton from '@/app/components/CopyButton';

const BASE_URL = 'https://nfc-portachiavi.vercel.app';

function pulisciPrefisso(valore: string) {
  return valore
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function generaCodice(prefix: string) {
  const random = crypto.randomUUID().split('-')[0].toUpperCase();
  return `${prefix}-${random}`;
}

async function createClient(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const default_url = formData.get('default_url') as string;

  const supabase = getSupabaseAdmin();

  await supabase.from('clients').insert({
    name,
    email,
    phone,
    default_url,
    active: true,
    use_landing: false,
    whatsapp_number: '',
    whatsapp_message: `Ciao, voglio ricevere aggiornamenti, offerte e nuovi contenuti da ${name}.`,
    landing_title: `Ricevi offerte e novità ${name}`,
    landing_text:
      'Entra nella nostra lista WhatsApp per ricevere promozioni, aggiornamenti e nuovi contenuti in anteprima.',
    logo_url: '',
  });

  revalidatePath('/admin');
}

async function updateClientMarketing(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const default_url = formData.get('default_url') as string;
  const logo_url = formData.get('logo_url') as string;
  const use_landing = formData.get('use_landing') === 'on';
  const whatsapp_number = formData.get('whatsapp_number') as string;
  const whatsapp_message = formData.get('whatsapp_message') as string;
  const landing_title = formData.get('landing_title') as string;
  const landing_text = formData.get('landing_text') as string;

  const supabase = getSupabaseAdmin();

  await supabase
    .from('clients')
    .update({
      default_url,
      logo_url,
      use_landing,
      whatsapp_number,
      whatsapp_message,
      landing_title,
      landing_text,
    })
    .eq('id', id);

  revalidatePath('/admin');
}

async function activateClient(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase.from('clients').update({ active: true }).eq('id', id);

  revalidatePath('/admin');
}

async function deactivateClient(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase.from('clients').update({ active: false }).eq('id', id);

  revalidatePath('/admin');
}

async function deleteClient(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase.from('keychains').delete().eq('client_id', id);
  await supabase.from('clients').delete().eq('id', id);

  revalidatePath('/admin');
}

async function generateKeychainsForClient(formData: FormData) {
  'use server';

  const client_id = formData.get('client_id') as string;
  const prefixRaw = formData.get('prefix') as string;
  const quantityRaw = formData.get('quantity') as string;

  const prefix = pulisciPrefisso(prefixRaw);
  const quantity = Math.min(Math.max(Number(quantityRaw || 1), 1), 1000);

  if (!prefix) {
    throw new Error('Inserisci un prefisso valido');
  }

  const supabase = getSupabaseAdmin();

  const { data: client } = await supabase
    .from('clients')
    .select('id, default_url')
    .eq('id', client_id)
    .single();

  if (!client) {
    throw new Error('Cliente non trovato');
  }

  const nuoviPortachiavi = Array.from({ length: quantity }).map(() => ({
    code: generaCodice(prefix),
    client_id: Number(client_id),
    target_url: client.default_url || 'https://google.com',
    active: true,
  }));

  await supabase.from('keychains').insert(nuoviPortachiavi);

  revalidatePath('/admin');
}

async function deleteLastKeychainsForClient(formData: FormData) {
  'use server';

  const client_id = formData.get('client_id') as string;
  const quantityRaw = formData.get('delete_quantity') as string;
  const quantity = Math.min(Math.max(Number(quantityRaw || 1), 1), 1000);

  const supabase = getSupabaseAdmin();

  const { data: ultimi } = await supabase
    .from('keychains')
    .select('id')
    .eq('client_id', client_id)
    .order('id', { ascending: false })
    .limit(quantity);

  if (!ultimi || ultimi.length === 0) {
    revalidatePath('/admin');
    return;
  }

  const ids = ultimi.map((k: any) => k.id);

  await supabase.from('keychains').delete().in('id', ids);

  revalidatePath('/admin');
}

async function deleteAllKeychainsForClient(formData: FormData) {
  'use server';

  const client_id = formData.get('client_id') as string;
  const supabase = getSupabaseAdmin();

  await supabase.from('keychains').delete().eq('client_id', client_id);

  revalidatePath('/admin');
}

async function activateKeychain(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase.from('keychains').update({ active: true }).eq('id', id);

  revalidatePath('/admin');
}

async function deactivateKeychain(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase.from('keychains').update({ active: false }).eq('id', id);

  revalidatePath('/admin');
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    padding: 32,
    fontFamily: 'Arial, sans-serif',
    color: '#111827',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 28,
  },
  title: {
    margin: 0,
    fontSize: 34,
  },
  subtitle: {
    margin: '6px 0 0',
    color: '#6b7280',
  },
  card: {
    background: 'white',
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
    border: '1px solid #e5e7eb',
  },
  input: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    fontSize: 14,
    boxSizing: 'border-box' as const,
    marginTop: 6,
  },
  textarea: {
    width: '100%',
    padding: '11px 12px',
    borderRadius: 10,
    border: '1px solid #d1d5db',
    fontSize: 14,
    boxSizing: 'border-box' as const,
    marginTop: 6,
    resize: 'vertical' as const,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    color: '#374151',
  },
  button: {
    border: 0,
    borderRadius: 10,
    padding: '11px 14px',
    fontWeight: 700,
    cursor: 'pointer',
    background: '#0f3b73',
    color: 'white',
  },
  buttonLight: {
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '10px 13px',
    fontWeight: 700,
    cursor: 'pointer',
    background: 'white',
    color: '#111827',
  },
  buttonDanger: {
    border: 0,
    borderRadius: 10,
    padding: '10px 13px',
    fontWeight: 700,
    cursor: 'pointer',
    background: '#dc2626',
    color: 'white',
  },
  buttonWarning: {
    border: 0,
    borderRadius: 10,
    padding: '10px 13px',
    fontWeight: 700,
    cursor: 'pointer',
    background: '#d97706',
    color: 'white',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
  },
  sectionTitle: {
    margin: '0 0 14px',
    fontSize: 22,
  },
};

export default async function AdminPage() {
  const supabase = getSupabaseAdmin();

  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      email,
      phone,
      default_url,
      active,
      use_landing,
      whatsapp_number,
      whatsapp_message,
      landing_title,
      landing_text,
      logo_url
    `)
    .order('id', { ascending: true });

  const { data: keychains } = await supabase
    .from('keychains')
    .select(`
      id,
      code,
      active,
      client_id,
      clients (
        name,
        default_url,
        active,
        use_landing
      )
    `)
    .order('id', { ascending: true });

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Pannello Admin NFC</h1>
          <p style={styles.subtitle}>
            Gestione clienti, landing WhatsApp e link NFC aggiornabili.
          </p>
        </div>
      </header>

      <section style={{ ...styles.card, marginBottom: 28 }}>
        <h2 style={styles.sectionTitle}>Crea nuova ditta / cliente</h2>

        <form
          action={createClient}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1.2fr 2fr auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <label style={styles.label}>
            Nome
            <input
              name="name"
              placeholder="Mario Girolamo"
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Email
            <input
              name="email"
              placeholder="email@esempio.it"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Telefono
            <input
              name="phone"
              placeholder="333..."
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Link contenuto
            <input
              name="default_url"
              placeholder="https://..."
              defaultValue="https://google.com"
              required
              style={styles.input}
            />
          </label>

          <button type="submit" style={styles.button}>
            Crea
          </button>
        </form>
      </section>

      <section style={{ marginBottom: 34 }}>
        <h2 style={styles.sectionTitle}>Ditte / Clienti</h2>

        <div style={{ display: 'grid', gap: 22 }}>
          {clients?.map((c: any) => (
            <article key={c.id} style={styles.card}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '260px 1fr 260px',
                  gap: 22,
                  alignItems: 'start',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: c.active ? '#dcfce7' : '#fee2e2',
                      color: c.active ? '#166534' : '#991b1b',
                      fontWeight: 800,
                      fontSize: 13,
                      marginBottom: 14,
                    }}
                  >
                    {c.active ? 'ATTIVA' : 'DISATTIVATA'}
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: 24 }}>
                    {c.name}
                  </h3>

                  <p style={{ margin: '0 0 4px', color: '#4b5563' }}>
                    ID cliente: {c.id}
                  </p>

                  <p style={{ margin: '0 0 4px', color: '#4b5563' }}>
                    {c.email || 'Email non inserita'}
                  </p>

                  <p style={{ margin: 0, color: '#4b5563' }}>
                    {c.phone || 'Telefono non inserito'}
                  </p>

                  {c.logo_url ? (
                    <div style={{ marginTop: 18 }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 700 }}>
                        Logo attuale
                      </p>
                      <img
                        src={c.logo_url}
                        alt={`Logo ${c.name}`}
                        style={{
                          maxWidth: 160,
                          maxHeight: 90,
                          objectFit: 'contain',
                          border: '1px solid #e5e7eb',
                          borderRadius: 12,
                          padding: 10,
                          background: 'white',
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <form action={updateClientMarketing} style={{ display: 'grid', gap: 14 }}>
                  <input type="hidden" name="id" value={c.id} />

                  <label style={styles.label}>
                    Link contenuto attuale
                    <input
                      name="default_url"
                      defaultValue={c.default_url || ''}
                      placeholder="https://..."
                      required
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.label}>
                    Logo URL
                    <input
                      name="logo_url"
                      defaultValue={c.logo_url || ''}
                      placeholder="https://... oppure /logo.png"
                      style={styles.input}
                    />
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 12,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      fontWeight: 700,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="use_landing"
                      defaultChecked={Boolean(c.use_landing)}
                    />
                    Usa landing raccolta contatti
                  </label>

                  <div style={styles.grid2}>
                    <label style={styles.label}>
                      Numero WhatsApp ditta
                      <input
                        name="whatsapp_number"
                        defaultValue={c.whatsapp_number || ''}
                        placeholder="393331234567"
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.label}>
                      Titolo pagina
                      <input
                        name="landing_title"
                        defaultValue={
                          c.landing_title || `Ricevi offerte e novità ${c.name}`
                        }
                        style={styles.input}
                      />
                    </label>
                  </div>

                  <label style={styles.label}>
                    Messaggio WhatsApp automatico
                    <textarea
                      name="whatsapp_message"
                      defaultValue={
                        c.whatsapp_message ||
                        `Ciao, voglio ricevere aggiornamenti, offerte e nuovi contenuti da ${c.name}.`
                      }
                      rows={3}
                      style={styles.textarea}
                    />
                  </label>

                  <label style={styles.label}>
                    Testo pagina
                    <textarea
                      name="landing_text"
                      defaultValue={
                        c.landing_text ||
                        'Entra nella nostra lista WhatsApp per ricevere promozioni, aggiornamenti e nuovi contenuti in anteprima.'
                      }
                      rows={3}
                      style={styles.textarea}
                    />
                  </label>

                  <button type="submit" style={styles.button}>
                    Salva impostazioni marketing
                  </button>

                  <div style={{ fontSize: 14, color: '#4b5563' }}>
                    Modalità attuale:{' '}
                    {c.use_landing ? (
                      <strong style={{ color: 'green' }}>
                        Landing raccolta contatti
                      </strong>
                    ) : (
                      <strong style={{ color: '#0f3b73' }}>
                        Redirect diretto
                      </strong>
                    )}
                  </div>
                </form>

                <div style={{ display: 'grid', gap: 18 }}>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: 17 }}>
                      Genera NFC
                    </h4>

                    <form action={generateKeychainsForClient} style={{ display: 'grid', gap: 10 }}>
                      <input type="hidden" name="client_id" value={c.id} />

                      <label style={styles.label}>
                        Prefisso
                        <input
                          name="prefix"
                          defaultValue={pulisciPrefisso(c.name).slice(0, 10)}
                          placeholder="GIROLAMO"
                          required
                          style={styles.input}
                        />
                      </label>

                      <label style={styles.label}>
                        Quantità
                        <input
                          name="quantity"
                          type="number"
                          min="1"
                          max="1000"
                          defaultValue="100"
                          required
                          style={styles.input}
                        />
                      </label>

                      <button type="submit" style={styles.button}>
                        Genera portachiavi/card
                      </button>
                    </form>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: 17 }}>
                      Cancella NFC
                    </h4>

                    <form action={deleteLastKeychainsForClient} style={{ display: 'grid', gap: 10, marginBottom: 10 }}>
                      <input type="hidden" name="client_id" value={c.id} />

                      <label style={styles.label}>
                        Cancella ultimi
                        <input
                          name="delete_quantity"
                          type="number"
                          min="1"
                          max="1000"
                          defaultValue="100"
                          required
                          style={styles.input}
                        />
                      </label>

                      <button type="submit" style={styles.buttonWarning}>
                        Cancella ultimi creati
                      </button>
                    </form>

                    <form action={deleteAllKeychainsForClient}>
                      <input type="hidden" name="client_id" value={c.id} />
                      <button type="submit" style={styles.buttonDanger}>
                        Cancella tutti
                      </button>
                    </form>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h4 style={{ margin: '0 0 12px', fontSize: 17 }}>
                      Azioni ditta
                    </h4>

                    <div style={{ display: 'grid', gap: 10 }}>
                      <form action={activateClient}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={styles.buttonLight}>
                          Attiva ditta
                        </button>
                      </form>

                      <form action={deactivateClient}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={styles.buttonLight}>
                          Disattiva ditta
                        </button>
                      </form>

                      <form action={deleteClient}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={styles.buttonDanger}>
                          Cancella ditta
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>Portachiavi / Card NFC</h2>

        <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: 'white',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Codice NFC
                </th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Ditta / Cliente
                </th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Modalità
                </th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Link da scrivere nel tag NFC
                </th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Stato
                </th>
                <th style={{ padding: 14, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Azioni
                </th>
              </tr>
            </thead>

            <tbody>
              {keychains?.map((k: any) => {
                const linkNfc = `${BASE_URL}/k/${k.code}`;

                return (
                  <tr key={k.id}>
                    <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>
                      {k.code}
                    </td>

                    <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb' }}>
                      {k.clients?.name || '-'}
                    </td>

                    <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb' }}>
                      {k.clients?.use_landing ? (
                        <strong style={{ color: 'green' }}>Landing contatti</strong>
                      ) : (
                        <strong style={{ color: '#0f3b73' }}>Redirect diretto</strong>
                      )}
                    </td>

                    <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ marginBottom: 8 }}>
                        <code
                          style={{
                            background: '#f3f4f6',
                            padding: '6px 8px',
                            borderRadius: 8,
                            display: 'inline-block',
                          }}
                        >
                          {linkNfc}
                        </code>
                      </div>
                      <CopyButton text={linkNfc} />
                    </td>

                    <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb' }}>
                      {k.active ? (
                        <strong style={{ color: 'green' }}>ATTIVO</strong>
                      ) : (
                        <strong style={{ color: 'red' }}>DISATTIVATO</strong>
                      )}
                    </td>

                    <td style={{ padding: 14, borderBottom: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <form action={activateKeychain}>
                          <input type="hidden" name="id" value={k.id} />
                          <button type="submit" style={styles.buttonLight}>
                            Attiva
                          </button>
                        </form>

                        <form action={deactivateKeychain}>
                          <input type="hidden" name="id" value={k.id} />
                          <button type="submit" style={styles.buttonLight}>
                            Disattiva
                          </button>
                        </form>
                      </div>

                      <a href={`/k/${k.code}`} target="_blank">
                        Prova
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}