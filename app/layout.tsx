import './globals.css';

export const metadata = {
  title: 'Gestione Portachiavi NFC',
  description: 'Pannello per gestire link NFC modificabili da remoto'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
