import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Source Jobs",
  description: "A list of companies that hire for open source roles.",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://open-source-jobs.com"),
  openGraph: {
    title: "Open Source Jobs",
    description: "A list of companies that hire for open source roles.",
    url: "https://open-source-jobs.com",
    siteName: "Open Source Jobs",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Open Source Jobs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Source Jobs",
    description: "A list of companies that hire for open source roles.",
    images: ["/og-image.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Open Source Jobs RSS Feed"
          href="/rss.xml"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
