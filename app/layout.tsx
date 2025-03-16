import type { Metadata } from 'next';

import './globals.css';
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: 'Legacy Frames Archive',
  description: 'To preseve and enjoy V1 Frames',
};

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