import type { Metadata } from 'next';

import './globals.css';
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'Legacy Frames',
  description: 'Explore legacy frames.',
  openGraph: {
    title: 'Legacy Frames',
    description: 'Explore legacy frames.',
    images: ['/icon.png'],
  },
  other: {
    ['fc:frame']: JSON.stringify({
      version: '1',
      imageUrl: 'https://legacyframes.xyz/banner.png',
      button: {
        title: 'Explore legacy frames.',
        action: {
          type: 'launch_frame',
          name: 'Legacy Frames',
          url: 'https://legacyframes.xyz',
          splashImageUrl: 'https://legacyframes.xyz/icon.png',
          splashBackgroundColor: '#10001D',
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