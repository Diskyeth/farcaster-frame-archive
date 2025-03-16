// components/FrameList.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type Frame = {
  id: string;
  name: string;
  creator_name: string;
  url: string;
  icon_url: string;
  created_at: string;
};

export default function FrameList() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Farcaster SDK
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const { default: sdk } = await import('@farcaster/frame-sdk');
        
        // Initialize the frame SDK and signal readiness
        await sdk.context;
        sdk.actions.ready();
      } catch (error) {
        console.error("Not in a Farcaster frame context:", error);
        // Most likely not in a Farcaster frame context, which is fine
      }
    };
    
    initFarcaster();
  }, []);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await fetch("/api/frame-list");
        if (!response.ok) throw new Error("Failed to fetch frames");

        const data = await response.json();
        setFrames(data.frames);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrames();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0b0b0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0b0b0f]">
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10001D] text-white px-4 py-8">
      {/* Centered Logo */}
      <header className="flex justify-center mb-4">
        <Image src="/logo.png" alt="Logo" width={204} height={50} priority />
      </header>

      {/* Frame List */}
      <section className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {frames.map((frame) => (
            <Link
              href={`/frame/${encodeURIComponent(frame.id)}`}
              key={frame.id}
              className="flex items-center bg-[#14141b] hover:bg-[#1b1b24] transition-all rounded-lg p-4"
            >
              {/* Frame Icon */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                {frame.icon_url ? (
                  <Image
                    src={frame.icon_url}
                    alt={frame.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-lg">
                    F
                  </div>
                )}
              </div>

              {/* Frame Info */}
              <div className="ml-4">
                <h3 className="text-lg font-semibold">{frame.name}</h3>
                <p className="text-gray-400 text-sm">@{frame.creator_name}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* No Frames Message */}
        {frames.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400">No frames found</p>
          </div>
        )}
      </section>
    </div>
  );
}