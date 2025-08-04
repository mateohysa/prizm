import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "prizm",
  icons: {
    icon: '/prizm.png',
  },
  description: "prizm transforms your text into slides through AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    appearance={{
      baseTheme: dark,
    }}
    >
    <html lang="en"
    suppressHydrationWarning
    >
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        {/* Background Image */}
        <div 
          className="fixed inset-0 -z-10 opacity-30 dark:opacity-15"
          style={{
            backgroundImage: 'url(/bg-grad.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
        </ThemeProvider>
        
      </body>
    </html>
    </ClerkProvider>
  );
}
