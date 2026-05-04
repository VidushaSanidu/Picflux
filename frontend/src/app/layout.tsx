import type { Metadata } from "next";
import { Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Picflux — Animal Image Hosting",
  description: "Discover, upload, verify, and download stunning animal photography with API-ready image hosting.",
  authors: [{ name: "picflux" }],
  openGraph: {
    title: "Picflux — Animal Image Hosting",
    description: "A sleek animal photography hosting platform with verified uploads and developer APIs.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@picflux",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${syne.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
