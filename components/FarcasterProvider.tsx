// components/FarcasterProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initSDK = async () => {
      try {
        // Initialize the frame SDK
        const context = await sdk.context;
        console.log("Frame context loaded:", context);
        
        // Signal that the frame is ready to display
        sdk.actions.ready();
        setIsReady(true);
      } catch (error) {
        console.error("Error initializing Farcaster Frame SDK:", error);
        // Still set ready to true so the app can render normally in non-frame contexts
        setIsReady(true);
      }
    };

    initSDK();
  }, []);

  // Show a minimal loading state while the SDK initializes
  if (!isReady) {
    return <div className="p-4 text-center">Loading Frame...</div>;
  }

  return <>{children}</>;
}