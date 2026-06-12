export default function Home() {
  return (
    <main className="container">
      <div className="card">
        <h1>Gestione Portachiavi NFC</h1>
        <p>Scrivi sui tag NFC un link tipo:</p>
        <pre>https://tuodominio.it/k/MR001</pre>
        <p>Dal pannello admin cambi dove porta ogni portachiavi, senza avere il tag vicino.</p>
        <p><a href="/admin">Apri pannello admin</a></p>
      </div>
    </main>
  );
}
