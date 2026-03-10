import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { LanguageProvider } from "@/lib/i18n";
import { SidebarProvider } from "@/components/SidebarProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samsic Planning IA - Gestion du Personnel",
  description:
    "Plateforme de planification intelligente pour la gestion du personnel de Samsic Luxembourg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider>
          <div className="min-h-screen">
            <Sidebar />
            <TopBar />
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
