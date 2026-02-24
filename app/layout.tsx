import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavigationBar from "./components/navigation/navigationBar";
import SingleSessionEnforcer from "./components/auth/singleSessionEnforcer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Go Live Hub",
  description: "Go Live Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-dvh overflow-hidden flex flex-col`}
      >
        <SingleSessionEnforcer />
        <NavigationBar />
        <main className="flex-1 min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    </html>
    </ClerkProvider>
  );
}
