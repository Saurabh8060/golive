import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavigationBar from "./components/navigation/navigationBar";
import SingleSessionEnforcer from "./components/auth/singleSessionEnforcer";

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
          className="antialiased min-h-dvh flex flex-col"
        >
          <SingleSessionEnforcer />
          <NavigationBar />
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
