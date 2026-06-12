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
  });

  revalidatePath('/admin');
}

async function updateClientLink(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const default_url = formData.get('default_url') as string;

  const supabase = getSupabaseAdmin();

  await supabase
    .from('clients')
    .update({ default_url })
    .eq('id', id);

  revalidatePath('/admin');
}

async function activateClient(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase
    .from('clients')
    .update({ active: true })
    .eq('id', id);

  revalidatePath('/admin');
}

async function deactivateClient(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase
    .from('clients')
    .update({ active: false })
    .eq('id', id);

  revalidatePath('/admin');
}

async function deleteClient(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase
    .from('keychains')
    .delete()
    .eq('client_id', id);

  await supabase
    .from('clients')
    .delete()
    .eq('id', id);

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

  await supabase
    .from('keychains')
    .insert(nuoviPortachiavi);

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

  await supabase
    .from('keychains')
    .delete()
    .in('id', ids);

  revalidatePath('/admin');
}

async function deleteAllKeychainsForClient(formData: FormData) {
  'use server';

  const client_id = formData.get('client_id') as string;
  const supabase = getSupabaseAdmin();

  await supabase
    .from('keychains')
    .delete()
    .eq('client_id', client_id);

  revalidatePath('/admin');
}

async function activateKeychain(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase
    .from('keychains')
    .update({ active: true })
    .eq('id', id);

  revalidatePath('/admin');
}

async function deactivateKeychain(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const supabase = getSupabaseAdmin();

  await supabase
    .from('keychains')
    .update({ active: false })
    .eq('id', id);

  revalidatePath('/admin');
}

export default async function AdminPage() {
  const supabase = getSupabaseAdmin();

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, phone, default_url, active')
    .order('id', { ascending: true });

  const { data: keychains } = await supabase
    .from('keychains')
    .select('id, code, active, client_id, clients(name, default_url, active)')
    .order('id', { ascending: true });

  return (
    <main style={{ padding: 40, fontFamily: 'Arial', background: '#f5f6f8', minHeight: '100vh' }}>
      <h1>Pannello Admin NFC</h1>

      <section style={{ background: 'white', padding: 20, marginBottom: 30, border: '1px solid #ddd' }}>
        <h2>Crea nuova ditta / cliente</h2>

        <form action={createClient} style={{ display: 'grid', gap: 10, maxWidth: 700 }}>
          <input
            name="name"
            placeholder="Nome ditta / cliente"
            required
            style={{ padding: 10 }}
          />

          <input
            name="email"
            placeholder="Email"
            style={{ padding: 10 }}
          />

          <input
            name="phone"
            placeholder="Telefono"
            style={{ padding: 10 }}
          />

          <input
            name="default_url"
            placeholder="Link generale, es. https://google.com"
            defaultValue="https://google.com"
            required
            style={{ padding: 10 }}
          />

          <button type="submit" style={{ padding: 10, width: 200 }}>
            Crea ditta
          </button>
        </form>
      </section>

      <h2>Ditte / Clienti</h2>

      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 40, background: 'white' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ditta / Cliente</th>
            <th>Email</th>
            <th>Link generale</th>
            <th>Genera portachiavi</th>
            <th>Cancella portachiavi</th>
            <th>Stato</th>
            <th>Azioni ditta</th>
          </tr>
        </thead>

        <tbody>
          {clients?.map((c: any) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email || '-'}</td>

              <td>
                <form action={updateClientLink}>
                  <input type="hidden" name="id" value={c.id} />
                  <input
                    name="default_url"
                    defaultValue={c.default_url || ''}
                    style={{ width: '100%', padding: 8 }}
                  />
                  <button type="submit" style={{ marginTop: 8 }}>
                    Salva link ditta
                  </button>
                </form>
              </td>

              <td>
                <form action={generateKeychainsForClient}>
                  <input type="hidden" name="client_id" value={c.id} />

                  <div style={{ marginBottom: 8 }}>
                    <label>Prefisso</label>
                    <input
                      name="prefix"
                      defaultValue={pulisciPrefisso(c.name).slice(0, 10)}
                      placeholder="GUARINO"
                      required
                      style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label>Quantità</label>
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      max="1000"
                      defaultValue="100"
                      required
                      style={{ display: 'block', width: '100%', padding: 8, marginTop: 4 }}
                    />
                  </div>

                  <button type="submit">
                    Genera X portachiavi per questa ditta
                  </button>
                </form>
              </td>

              <td>
                <form action={deleteLastKeychainsForClient} style={{ marginBottom: 10 }}>
                  <input type="hidden" name="client_id" value={c.id} />

                  <label>Cancella ultimi</label>
                  <input
                    name="delete_quantity"
                    type="number"
                    min="1"
                    max="1000"
                    defaultValue="100"
                    required
                    style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, marginBottom: 8 }}
                  />

                  <button type="submit" style={{ background: '#d97706', color: 'white' }}>
                    Cancella ultimi creati
                  </button>
                </form>

                <form action={deleteAllKeychainsForClient}>
                  <input type="hidden" name="client_id" value={c.id} />

                  <button type="submit" style={{ background: '#dc2626', color: 'white' }}>
                    Cancella tutti i portachiavi
                  </button>
                </form>
              </td>

              <td>
                {c.active ? (
                  <strong style={{ color: 'green' }}>ATTIVA</strong>
                ) : (
                  <strong style={{ color: 'red' }}>DISATTIVATA</strong>
                )}
              </td>

              <td>
                <div style={{ display: 'grid', gap: 8 }}>
                  <form action={activateClient}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit">Attiva ditta</button>
                  </form>

                  <form action={deactivateClient}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit">Disattiva ditta</button>
                  </form>

                  <form action={deleteClient}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" style={{ background: '#991b1b', color: 'white' }}>
                      Cancella ditta
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Portachiavi</h2>

      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%', background: 'white' }}>
        <thead>
          <tr>
            <th>Codice NFC</th>
            <th>Ditta / Cliente</th>
            <th>Link ereditato dalla ditta</th>
            <th>Link da scrivere nel tag NFC</th>
            <th>Stato portachiavi</th>
            <th>Azioni</th>
          </tr>
        </thead>

        <tbody>
          {keychains?.map((k: any) => {
            const linkNfc = `${BASE_URL}/k/${k.code}`;

            return (
              <tr key={k.id}>
                <td>{k.code}</td>
                <td>{k.clients?.name || '-'}</td>
                <td>{k.clients?.default_url || '-'}</td>

                <td>
                  <div style={{ marginBottom: 8 }}>
                    <code>{linkNfc}</code>
                  </div>
                  <CopyButton text={linkNfc} />
                </td>

                <td>
                  {k.active ? (
                    <strong style={{ color: 'green' }}>ATTIVO</strong>
                  ) : (
                    <strong style={{ color: 'red' }}>DISATTIVATO</strong>
                  )}
                </td>

                <td>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <form action={activateKeychain}>
                      <input type="hidden" name="id" value={k.id} />
                      <button type="submit">Attiva</button>
                    </form>

                    <form action={deactivateKeychain}>
                      <input type="hidden" name="id" value={k.id} />
                      <button type="submit">Disattiva</button>
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
    </main>
  );
}