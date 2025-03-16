// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Frame Archive",
  description: "Browse and interact with Farcaster Frames",
  openGraph: {
    title: "Frame Archive",
    description: "Browse and interact with Farcaster Frames",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/api/og`,
        width: 1200,
        height: 630,
        alt: "Frame Archive",
      },
    ],
  },
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/api/og`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/api/frame-action`,
    "fc:frame:button:1": "Browse Frames",
    "fc:frame:button:1:action": "post",
    "fc:frame:input:text": "Search frames...",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}