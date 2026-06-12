import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

async function updateKeychain(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  const target_url = formData.get('target_url') as string;

  const supabase = getSupabaseAdmin();

  await supabase
    .from('keychains')
    .update({ target_url })
    .eq('id', id);

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

  const { data: keychains } = await supabase
    .from('keychains')
    .select('id, code, target_url, active, clients(name)')
    .order('id', { ascending: true });

  return (
    <main style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>Pannello Admin NFC</h1>

      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Codice</th>
            <th>Cliente</th>
            <th>Link attuale</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>

        <tbody>
          {keychains?.map((k: any) => (
            <tr key={k.id}>
              <td>{k.code}</td>
              <td>{k.clients?.name || '-'}</td>

              <td>
                <form action={updateKeychain}>
                  <input type="hidden" name="id" value={k.id} />
                  <input
                    name="target_url"
                    defaultValue={k.target_url}
                    style={{ width: '100%', padding: 8 }}
                  />
                  <button type="submit" style={{ marginTop: 8 }}>
                    Salva link
                  </button>
                </form>
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
          ))}
        </tbody>
      </table>
    </main>
  );
}