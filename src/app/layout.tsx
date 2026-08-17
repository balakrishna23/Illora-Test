import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { Chatbot } from "@/components/shared/Chatbot";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Illoura — First Nations-Owned Recruitment",
    template: "%s | Illoura",
  },
  description:
    "Illoura is a First Nations-owned recruitment partner connecting candidates and employers across IT & Telecommunications, Construction, Healthcare, Nursing & Aged Care, Data Science, Cyber Security, and EV Waste & Recycling.",
  twitter: {
    card: "summary_large_image",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1 animate-page-enter">{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
