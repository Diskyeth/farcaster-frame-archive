import type { Metadata } from 'next';

import './globals.css';
import { Providers } from "./providers";


export const metadata: Metadata = {
  title: 'anoncast',
  description: 'Post anonymously to Farcaster.',
  openGraph: {
    title: 'anoncast',
    description: 'Post anonymously to Farcaster.',
    images: ['/anon.png'],
  },
  other: {
    ['fc:frame']: JSON.stringify({
      version: 'next',
      imageUrl: 'https://anoncast.org/banner.png',
      button: {
        title: 'Post anonymously',
        action: {
          type: 'launch_frame',
          name: 'anoncast',
          url: 'https://frame.anoncast.org',
          splashImageUrl: 'https://anoncast.org/anon.png',
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