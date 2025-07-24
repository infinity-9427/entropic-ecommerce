import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/footer";
import VoiceAssistant from "@/components/VoiceAssistant";

export const metadata: Metadata = {
  title: "Entropic - Shop Amazing Products",
  description: "Discover amazing products at great prices in our modern e-commerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <Footer />
      <VoiceAssistant />
    </div>
  );
}
