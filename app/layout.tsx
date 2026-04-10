import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "7anouty",
  description: "Gestion de ventes",
    icons: {
    icon: "/logo725.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geistSans.variable, geistMono.variable, "font-sans", inter.variable)}>
      <body> <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div></body>
    </html>
  );
  



}
