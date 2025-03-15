import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google"; // ✅ Replace Geist with Inter & Fira Code
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-mono",
});

export const metadata: Metadata = {
  title: "Farcaster V2 Frame",
  description: "View V1 Frames inside a V2 Frame",
  openGraph: {
    title: "Farcaster V2 Frame",
    description: "Load and interact with V1 Frames inside a V2 Frame.",
    images: [
      {
        url: "https://yourdomain.com/api/frame-image",
        width: 1200,
        height: 630,
        alt: "Farcaster Frame Preview",
      },
    ],
  },
  other: {
    "fc:frame": "v2",
    "fc:frame:image": "https://yourdomain.com/api/frame-image",
    "fc:frame:post_url": "https://yourdomain.com/api/frame",
    "fc:frame:button:1": "Load Another V1 Frame",
    "fc:frame:button:1:action": "post",
    "fc:frame:button:2": "Visit V1 Frame",
    "fc:frame:button:2:action": "link",
    "fc:frame:button:2:target": "https://framesjs.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
