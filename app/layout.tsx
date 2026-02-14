import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes"
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import AuthGate from "@/components/authGate";
import { Space_Mono } from 'next/font/google'
import AppFooter from "@/components/footer";

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Startup expense management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${spaceMono.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <SidebarProvider>
    <AuthGate>
      <div className="flex min-h-screen w-full">
        
        <AppSidebar />

        <div className="flex flex-col flex-1">
          <Navbar />

          <main className="flex-1 mt-16 mb-10">
            {children}
          </main>

          <AppFooter />
        </div>

      </div>
    </AuthGate>
  </SidebarProvider>
</ThemeProvider>

      </body>
    </html>
  );
}
