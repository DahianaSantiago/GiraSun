import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://girasun.com"),
  title: {
    default: "GiraSun",
    template: "%s · GiraSun",
  },
  description:
    "Diario literario de Dahiana Santiago — cuentos, escritos, club de lectura y CineClub.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "GiraSun",
    title: "GiraSun",
    description: "Cuentos, escritos, club de lectura y CineClub.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GiraSun",
    description: "Cuentos, escritos, club de lectura y CineClub.",
  },
  // Name under the icon when the site is saved to an iOS home screen, and the
  // title Safari shows in the share sheet. Without it iOS falls back to the
  // full <title>, which grows to "Cuentos · GiraSun" on inner pages.
  appleWebApp: {
    capable: true,
    title: "GiraSun",
    statusBarStyle: "default",
  },
};

/**
 * Root layout — minimal. Only sets up <html>, fonts, and the AuthProvider
 * (shared by both public surfaces and the admin shell). Public chrome
 * (NavBar/SideRail/Footer) lives in src/app/(public)/layout.tsx; admin
 * chrome lives in src/app/admin/layout.tsx.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-palette="sunflower"
      className={`${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
