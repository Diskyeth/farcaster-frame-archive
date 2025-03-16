'use client';

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('../components/HomePage'), {
  ssr: false,
});


// This is the main page server component
export default function Home() {
  return <HomePage />;
}