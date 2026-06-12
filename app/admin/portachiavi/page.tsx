import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { aggiornaLink, creaPortachiave } from './actions';

export default async function PortachiaviPage() {
  const supabase = getSupabaseAdmin();
  const { data: clienti } = await supabase.from('clienti').select('id, nome').order('nome');
  const { data: portachiavi } = await supabase
    .from('portachiavi')
    .select('*, clienti(nome)')
    .order('created_at', { ascending: false });

  return (
    <main className="container">
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Portachiavi NFC</h1>

      <form action={creaPortachiave} className="card">
        <h2>Nuovo portachiave</h2>
        <div className="grid">
          <label>Codice NFC<input name="codice" required placeholder="MR001" /></label>
          <label>Nome interno<input name="nome" placeholder="Portachiave nero Mario" /></label>
          <label>Cliente
            <select name="cliente_id">
              <option value="">Nessun cliente</option>
              {(clienti || []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
        </div>
        <p><label>Link attuale<input name="link_attuale" required defaultValue="https://example.com" /></label></p>
        <button type="submit">Crea portachiave</button>
      </form>

      <div className="card">
        <p className="small">Sul tag NFC scrivi: https://tuodominio.it/k/CODICE</p>
      </div>

      <table>
        <thead><tr><th>Codice</th><th>Cliente</th><th>Link</th><th>Scansioni</th><th>Azione</th></tr></thead>
        <tbody>
          {(portachiavi || []).map((p: any) => (
            <tr key={p.id}>
              <td><b>{p.codice}</b><br /><span className="small">/k/{p.codice}</span></td>
              <td>{p.clienti?.nome || '-'}</td>
              <td>
                <form action={aggiornaLink}>
                  <input type="hidden" name="id" value={p.id} />
                  <input name="link_attuale" defaultValue={p.link_attuale} />
                  <label className="small"><input type="checkbox" name="attivo" defaultChecked={p.attivo} /> Attivo</label>
                  <p><button type="submit">Salva</button></p>
                </form>
              </td>
              <td>{p.scansioni}</td>
              <td><a href={`/k/${p.codice}`} target="_blank">Test</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
