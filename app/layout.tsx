import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Figtree,
  Public_Sans,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const publicSansHeading = Public_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SevnMaps",
  description:
    "That one friend who seems to have been everywhere. SevnMaps is your guide to the world's hidden gems!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
        publicSansHeading.variable,
        plusJakartaSans.variable,
      )}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="SevnMaps" />
      </head>
      <body className="min-h-full flex justify-center selection:bg-primary/20">
        <div className="w-full max-w-[1800px]">
          {children}
        </div>
      </body>
    </html>
  );
}
