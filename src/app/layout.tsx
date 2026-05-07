import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { SideRail } from "@/components/SideRail";
import { Footer } from "@/components/Footer";

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
    default: "GiraSun · diario literario",
    template: "%s · GiraSun",
  },
  description:
    "Diario literario de Dahiana Santiago — cuentos, escritos, club de lectura y CineClub.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "GiraSun",
    title: "GiraSun · diario literario",
    description: "Cuentos, escritos, club de lectura y CineClub.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-palette="default"
      className={`${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <NavBar />
        <SideRail />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
