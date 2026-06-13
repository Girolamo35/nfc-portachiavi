export const metadata = {
  title: 'NFC Portachiavi',
  description: 'Sistema NFC con link aggiornabile',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}