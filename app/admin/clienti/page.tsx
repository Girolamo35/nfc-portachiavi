import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { creaCliente } from './actions';

export default async function ClientiPage() {
  const supabase = getSupabaseAdmin();
  const { data: clienti } = await supabase
    .from('clienti')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="container">
      <p><Link href="/admin">← Admin</Link></p>
      <h1>Clienti</h1>

      <form action={creaCliente} className="card">
        <h2>Nuovo cliente</h2>
        <div className="grid">
          <label>Nome<input name="nome" required placeholder="Mario Rossi" /></label>
          <label>Email<input name="email" type="email" placeholder="mario@email.it" /></label>
          <label>Telefono<input name="telefono" placeholder="333..." /></label>
        </div>
        <p><label>Note<input name="note" placeholder="Cliente palestra, ristorante, evento..." /></label></p>
        <button type="submit">Crea cliente</button>
      </form>

      <table>
        <thead><tr><th>Nome</th><th>Email</th><th>Telefono</th></tr></thead>
        <tbody>
          {(clienti || []).map((c) => (
            <tr key={c.id}><td>{c.nome}</td><td>{c.email}</td><td>{c.telefono}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
