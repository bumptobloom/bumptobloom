import type { Metadata } from "next";
import { Lora, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./serwist-provider";

/**
 * The product's type is a serif, per the Figma. It is bound to a single
 * token (--font-brand-serif) so swapping the family is a one-line change
 * once design confirms the exact face.
 */
const brandSerif = Lora({
  variable: "--font-brand-serif",
  subsets: ["latin"],
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
    <html lang="en" className={`${brandSerif.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
