// File: src/app/layout.tsx

import { type Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "QR Code Generator",
  description: "Generate QR codes for URLs, text, and contacts",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}