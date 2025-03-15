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
  title: "Farcaster V2 Frame",
  description: "View V1 Frames inside a V2 Frame",
  openGraph: {
    title: "Farcaster V2 Frame",
    description: "Load and interact with V1 Frames inside a V2 Frame.",
    images: [
      {
        url: "https://yourdomain.com/api/frame-image", // ✅ Points to dynamic frame image
        width: 1200,
        height: 630,
        alt: "Farcaster Frame Preview",
      },
    ],
  },
  other: {
    "fc:frame": "v2", // ✅ Enables Farcaster V2 Frame support
    "fc:frame:image": "https://yourdomain.com/api/frame-image",
    "fc:frame:post_url": "https://yourdomain.com/api/frame",
    "fc:frame:button:1": "Load Another V1 Frame",
    "fc:frame:button:1:action": "post",
    "fc:frame:button:2": "Visit V1 Frame",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": "https://framesjs.org", // ✅ Default V1 Frame
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
