import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import OfflineDetector from "@/components/layout/offline-detector";
import GlobalShortcuts from "@/components/global-shortcuts";
import ShortcutsPanel from "@/components/shortcuts-panel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Journal",
  description: "A daily journaling app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <OfflineDetector />
          <Header />
          <div className="flex flex-1">
            <Sidebar todayDate={today} />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
          <GlobalShortcuts />
          <ShortcutsPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
