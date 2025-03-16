// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Get base URL from environment variables
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com";

export const metadata: Metadata = {
  title: "Farcaster Frames v2 Demo",
  description: "A Farcaster Frames v2 demo app",
  openGraph: {
    title: "Farcaster Frames v2 Demo",
    description: "A Farcaster Frames v2 demo app",
    images: [
      {
        url: `${baseUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: "Farcaster Frames v2 Demo",
      },
    ],
  },
  other: {
    "fc:frame": "v2",
    "fc:frame:image": `${baseUrl}/`,
    "fc:frame:post_url": `${baseUrl}/`,
    "fc:frame:button:1": "Load Another V1 Frame",
    "fc:frame:button:1:action": "post",
    "fc:frame:button:2": "Visit V1 Frame",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": `${baseUrl}/`,
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
