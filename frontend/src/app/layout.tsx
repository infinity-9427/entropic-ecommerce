import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Entropic - Shop Amazing Products",
  description: "Discover amazing products at great prices in our modern e-commerce store",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Entropic - Shop Amazing Products",
    description: "Discover amazing products at great prices in our modern e-commerce store",
    url: "https://entropic.com",
    siteName: "Entropic",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "Entropic - Shop Amazing Products",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entropic - Shop Amazing Products",
    description: "Discover amazing products at great prices in our modern e-commerce store",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
