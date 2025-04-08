import type { Metadata } from "next";

import "@/styles/globals.css";

import { getCurrentUser } from "@/actions/user";
import { fontGeist, fontHeading, fontSans, fontUrban } from "@/assets/fonts";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "next-themes";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "NBA Predicator v0.1",
  description: "Let's guess!!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏀</text></svg>"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontUrban.variable,
          fontHeading.variable,
          fontGeist.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider user={user}>
            {children}
            <Toaster richColors closeButton />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
