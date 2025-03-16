"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';

export default function LoadFramePage() {
  const router = useRouter();
  const [directFrameUrl, setDirectFrameUrl] = useState<string>('');
  const [isLoadingDirectFrame, setIsLoadingDirectFrame] = useState(false);
  const [directFrameError, setDirectFrameError] = useState<string | null>(null);

  // Function to load frame from direct URL
  const handleLoadDirectFrame = () => {
    // Basic URL validation
    if (!directFrameUrl || !directFrameUrl.trim()) {
      setDirectFrameError("Please enter a valid URL");
      return;
    }

    let url;
    try {
      url = new URL(directFrameUrl);
    } catch (e) {
      setDirectFrameError("Please enter a valid URL");
      return;
    }

    setIsLoadingDirectFrame(true);
    setDirectFrameError(null);
    
    // Redirect to the direct-frame page with the URL as a query parameter
    router.push(`/direct-frame?url=${encodeURIComponent(directFrameUrl)}`);
  };

  return (
    <div className="min-h-screen bg-[#10001D] text-white px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Logo and Back Button Header */}
        <header className="flex items-center mb-8 relative">
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center justify-center absolute left-0"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-full flex justify-center">
            <Image src="/logo.png" alt="Logo" width={204} height={50} priority />
          </div>
        </header>

        {/* Disclaimer Text */}
        <div className="text-gray-400 text-sm mb-8 mt-4">
          <p>This project was created to preserve the legacy of the V1 frame in Farcaster. However, there are no guarantees that each frame will continue to work as intended.</p>
        </div>
        
        {/* Load Frame Title */}
        <h1 className="text-2xl font-bold mb-6 text-center">Load Frame from URL</h1>
        
        {/* Direct URL Input */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={directFrameUrl}
              onChange={(e) => setDirectFrameUrl(e.target.value)}
              placeholder="Enter a frame URL"
              className="w-full px-4 py-3 rounded-lg bg-[#1D1D29] text-white border border-[#2A2A3C] focus:outline-none focus:border-[#8C56FF]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLoadDirectFrame();
                }
              }}
            />
            <button
              onClick={handleLoadDirectFrame}
              disabled={isLoadingDirectFrame}
              className="w-full py-3 bg-[#8C56FF] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoadingDirectFrame ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Load Frame
                </>
              )}
            </button>
          </div>
          {directFrameError && (
            <p className="text-red-500 text-sm mt-3">{directFrameError}</p>
          )}
        </div>
        
        {/* Instructions */}
        <div className="bg-[#1D1D29] rounded-lg p-5 border border-[#2A2A3C]">
          <h2 className="text-xl font-semibold mb-3">How to use</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li>Find a Farcaster frame URL that you want to load</li>
            <li>Copy the complete URL</li>
            <li>Paste it in the input field above</li>
            <li>Click "Load Frame" to interact with the frame</li>
          </ol>
          <p className="mt-4 text-sm text-gray-400">Note: This feature works best with Farcaster frames that are publicly accessible.</p>
        </div>
      </div>
    </div>
  );
}