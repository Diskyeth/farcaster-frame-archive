import type { Metadata } from 'next';

import './globals.css';
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'Legacy Frames',
  description: 'Post anonymously to Farcaster.',
  openGraph: {
    title: 'Legacy Frames',
    description: 'Post anonymously to Farcaster.',
    images: ['/icon.png'],
  },
  other: {
    ['fc:frame']: JSON.stringify({
      version: 'next',
      imageUrl: 'https://legacyframes.xyz/banner.png',
      button: {
        title: 'Post anonymously',
        action: {
          type: 'launch_frame',
          name: 'Legacy Frames',
          url: 'https://legacyframes.xyz/',
          splashImageUrl: 'https://legacyframes.xyz/icon.png',
          splashBackgroundColor: '#151515',
        },
      },
    }),
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}