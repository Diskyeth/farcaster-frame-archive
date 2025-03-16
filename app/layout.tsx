// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Get base URL from environment variables
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

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

    "fc:frame": "v2",
    "fc:frame:image": "https://farcaster-frame-archive.vercel.app/",
    "fc:frame:post_url": "https://farcaster-frame-archive.vercel.app/",
    "fc:frame:button:1": "Load Another V1 Frame",
    "fc:frame:button:1:action": "post",
    "fc:frame:button:2": "Visit V1 Frame",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": "https://farcaster-frame-archive.vercel.app/",
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