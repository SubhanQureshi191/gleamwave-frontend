import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Gleamwave Handcrafted Resin Art & Jewelry",
  description:
    "Premium handmade resin art, preserve memory jewelry, bridal keepsakes, and custom orders crafted with love in Pakistan.",
  metadataBase: new URL("https://gleamwaveresin.com"),
  verification: {
    google: "MsfLa8LpWm77hW98-uik7gc8UntguCL3twVHR0TEXDk",
  },
  openGraph: {
    title: "Gleamwave Handcrafted Resin Art",
    description:
      "Premium handmade resin art, preserve memory jewelry, and bridal keepsakes.",
    url: "https://gleamwaveresin.com",
    siteName: "Gleamwave",
    images: ["/images/categories/logo.jpg"],
    locale: "en_US",
    type: "website",
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
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}