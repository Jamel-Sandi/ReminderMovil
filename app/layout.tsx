import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recordatorios de Elenita 🐝",
  description: "Tu asistente personal para recordatorios especiales",
  keywords: "recordatorios, notas, organización, productividad",
  authors: [{ name: "Elenita" }],
  viewport: "width=device-width, initial-scale=1.0, user-scalable=no",
  robots: "index, follow",
  openGraph: {
    title: "Recordatorios de Elenita",
    description: "Tu asistente personal para recordatorios especiales",
    type: "website",
    locale: "es_ES",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#ec4899" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Recordatorios" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}