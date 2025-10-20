// File: src/app/page.tsx

import QRCodeGenerator from '~/components/QRCodeGenerator';

export default function HomePage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <QRCodeGenerator />
    </main>
  );
}