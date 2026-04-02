import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Provider } from "@/components/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kai",
  description: "Next-generation AI Chat application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden bg-[#0f172a] text-slate-50`}>
        <Provider>
          {/* The Sidebar is persistent across all pages */}
          <Sidebar />

          {/* The main content area where child pages are injected */}
          <div className="flex-1 overflow-y-auto relative flex flex-col">
            {children}
          </div>
        </Provider>
      </body>
    </html>
  );
}
