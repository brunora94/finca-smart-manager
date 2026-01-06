import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as standard nice font
import "./globals.css";
import MobileLayout from "@/components/mobile-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finca Smart Manager",
  description: "Gestión inteligente de tu finca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} antialiased`}
      >
        <MobileLayout>
          {children}
        </MobileLayout>
      </body>
    </html>
  );
}
