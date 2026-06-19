import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DropRush — Flash Drops. Zero Oversells.",
  description: "Claim limited drops the moment they go live.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}