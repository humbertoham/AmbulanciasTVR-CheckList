import type { Metadata } from "next";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";


export const metadata: Metadata = {
  title: "AmbulanciasTVR Check List",
  description: "Generador de Check Lists de AmubulanciasTVR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* manifiesto y meta-tags para PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        {/* evita duplicar manifest: site.webmanifest suele ser lo mismo */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {/* este componente se monta en cliente y registra el SW */}
        <RegisterServiceWorker/>
        {children}
      </body>
    </html>
  );
}
