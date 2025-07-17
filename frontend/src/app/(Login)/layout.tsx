import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "../(App)/globals.css";

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
  title: "Entropic - Login",
  description: "Sign in to your Entropic account or create a new one",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Entropic - Login",
    description: "Sign in to your Entropic account or create a new one",
    url: "https://entropic.com/login",
    siteName: "Entropic",
    images: [
      {
        url: "/user.svg",
        width: 1200,
        height: 630,
        alt: "Entropic - Login",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entropic - Login",
    description: "Sign in to your Entropic account or create a new one",
    images: ["/user.svg"],
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
