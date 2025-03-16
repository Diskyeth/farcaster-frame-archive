// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Get the base URL from environment or use a placeholder
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farcaster-frame-archive.vercel.app/';

export const metadata: Metadata = {
  title: "Frame Archive",
  description: "Browse and interact with Farcaster Frames",
  openGraph: {
    title: "Frame Archive",
    description: "Browse and interact with Farcaster Frames",
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "Frame Archive",
      },
    ],
  },
  // Farcaster Frame metadata
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${baseUrl}/api/og`,
    "fc:frame:post_url": `${baseUrl}/api/frame-action`,
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