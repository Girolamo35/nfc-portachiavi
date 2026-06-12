# Gestione Portachiavi NFC

Sistema base per vendere portachiavi NFC con link modificabile da remoto.

## Come funziona

Sul tag NFC scrivi un link fisso:

```txt
https://tuodominio.it/k/MR001
```

Nel pannello admin cambi il link collegato a `MR001`. Il portachiavi non va mai riscritto.

## Setup

1. Crea un progetto su Supabase.
2. Vai in SQL Editor e incolla `supabase/schema.sql`.
3. Copia `.env.example` in `.env.local`.
4. Inserisci le chiavi Supabase.
5. Installa e avvia:

```bash
npm install
npm run dev
```

Apri:

```txt
http://localhost:3000/admin
```

## Prima prova

1. Crea un cliente: Mario Rossi.
2. Crea un portachiave con codice `MR001`.
3. Imposta il link attuale, per esempio YouTube.
4. Apri `http://localhost:3000/k/MR001`.
5. Cambia il link dal pannello e riprova.

## Produzione

Consigliato:

- Vercel per pubblicare il sito.
- Supabase per database.
- Dominio tuo, per esempio `tuodominio.it`.
- Tag NFC NTAG215 o NTAG216.
