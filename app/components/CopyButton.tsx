'use client';

export default function CopyButton({ text }: { text: string }) {
  async function copyText() {
    await navigator.clipboard.writeText(text);
    alert('Link NFC copiato!');
  }

  return (
    <button type="button" onClick={copyText}>
      Copia link NFC
    </button>
  );
}