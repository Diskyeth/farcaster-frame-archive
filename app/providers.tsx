'use client';

import dynamic from 'next/dynamic';
import { ReactNode, useEffect } from 'react';

// Dynamically import WagmiProvider to avoid SSR issues
const WagmiProvider = dynamic(
  () => import('@/components/providers/WagmiProvider'),
  {
    ssr: false,
  }
);

// Create a Farcaster SDK wrapper component
function FarcasterProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Dynamically import the Farcaster SDK
    const initFarcaster = async () => {
      try {
        const { default: sdk } = await import('@farcaster/frame-sdk');
        
        // Initialize the frame SDK and signal readiness
        const context = await sdk.context;
        console.log("Farcaster context:", context);
        sdk.actions.ready();
      } catch (error) {
        console.error("Not in a Farcaster frame context:", error);
        // Most likely not in a Farcaster frame context, which is fine
      }
    };
    
    // Initialize Farcaster SDK
    initFarcaster();
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <FarcasterProvider>{children}</FarcasterProvider>
    </WagmiProvider>
  );
}