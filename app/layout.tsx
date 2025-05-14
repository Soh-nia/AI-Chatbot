import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
// import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Companion Chatbot',
  description: 'Your personal AI assistant powered by Google Gemini',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <SessionProvider>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
          {children}
        {/* </ThemeProvider> */}
        </SessionProvider>
      </body>
    </html>
  );
}
