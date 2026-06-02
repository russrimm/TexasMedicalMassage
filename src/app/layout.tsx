import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export const metadata: Metadata = {
  title: {
    default: "Texas Medical Massage — Find therapists and jobs in Texas",
    template: "%s · Texas Medical Massage",
  },
  description:
    "The marketplace connecting Texas massage therapists with spas, clinics, and wellness businesses hiring.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1416" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans min-h-screen flex flex-col">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
