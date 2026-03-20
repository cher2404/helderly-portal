import type { Metadata, Viewport } from "next";
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
  description:
    "Het minimalistische klantportaal voor freelancers. Tijdlijn, bestanden en feedback op één plek.",
  openGraph: {
    title: "Helderly — Client Portal",
    description: "Het minimalistische klantportaal voor freelancers.",
    locale: "nl_NL",
  },
  icons: {
    icon: "/favicon-animated.svg",
    apple: "/icon-192.svg",
  },
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Helderly",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen tracking-tight text-zinc-900 bg-white dark:text-zinc-100 dark:bg-zinc-950`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
