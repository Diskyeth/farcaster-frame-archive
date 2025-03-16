// components/FarcasterIntegration.tsx
"use client";

import { useEffect } from 'react';

export default function FarcasterIntegration() {
  useEffect(() => {
    // Dynamically import the SDK to avoid SSR issues
    const initFarcaster = async () => {
      try {
        const { default: sdk } = await import('@farcaster/frame-sdk');
        
        // Get the frame context
        const context = await sdk.context;
        console.log("Frame context loaded:", context);
        
        // If we're in a frame context, hide the frame info banner
        if (context) {
          const frameInfo = document.getElementById('frame-info');
          if (frameInfo) {
            frameInfo.style.display = 'none';
          }
        }
        
        // Tell the Farcaster client that our frame is ready
        sdk.actions.ready();
      } catch (error) {
        console.error("Error initializing Farcaster Frame SDK:", error);
        // Most likely not in a Farcaster frame context, which is fine
      }
    };
    
    initFarcaster();
  }, []);
  
  // This component doesn't render anything visible
  return null;
}