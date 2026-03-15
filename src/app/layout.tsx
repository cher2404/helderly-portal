import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Helderly — Client Portal", template: "%s | Helderly" },
  description: "Clean, calm client portal for project collaboration. Manage projects, milestones, and client feedback in one place.",
  openGraph: { title: "Helderly — Client Portal", description: "Clean, calm client portal for project collaboration." },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen tracking-tight text-zinc-900 bg-white dark:text-zinc-100 dark:bg-zinc-950`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
