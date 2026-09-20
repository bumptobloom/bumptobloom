import type { Metadata } from "next";
import { Karla, Petrona, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./serwist-provider";

/**
 * Two families, confirmed by design on 20 Sep. Until then the whole app was
 * set in Lora, which was a guess.
 *
 * Karla carries the interface: body copy, field labels, list titles, the
 * month tracker and the nav chevrons. Weights 400/600/700 are the three the
 * type scale actually names -- do not add more without a role that needs one,
 * every weight is a font file the phone has to fetch.
 */
const karla = Karla({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

/**
 * Petrona carries display type only: card titles, CTA button labels and the
 * smaller sub-copy titles. Regular is the only weight the scale uses.
 */
const petrona = Petrona({
  variable: "--font-display-family",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BumpToBloom",
  description:
    "Milestones, guidance and answers for the first two years. An educational tool, not a medical device.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${karla.variable} ${petrona.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
