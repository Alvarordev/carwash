import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  title: "CarWash",
  description: "Sistema de gestión para lavaderos de autos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${satoshi.variable} antialiased`}>{children}</body>
    </html>
  );
}
