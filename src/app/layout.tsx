import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  other: {
    "base:app_id": "6aa04ae85fc8836eb3b01075",
  },
  title: "Kora — Keep your stocks. Access liquidity.",
  description:
    "Access USDC without selling tokenized stocks. Your assets stay invested and can help repay your loan.",
  icons: {
    icon: [{ url: "/favicon.svg?v=blue", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full`}
    >
      <body className="relative min-h-full antialiased">{children}</body>
    </html>
  );
}
