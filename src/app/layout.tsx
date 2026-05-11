import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import AppProviders from "@/components/providers/AppProviders";

import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Summarist",
  description: "Book summaries and audio briefings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
