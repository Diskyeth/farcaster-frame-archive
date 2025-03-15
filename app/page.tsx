"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Frame = {
  id: string;
  name: string;
  creator_name: string;
  url: string;
  icon_url: string;
  created_at: string;
};

export default function HomePage() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await fetch('/api/frame-list');
        
        if (!response.ok) {
          throw new Error('Failed to fetch frames');
        }
        
        const data = await response.json();
        setFrames(data.frames);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrames();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Frame Archive</h1>
        <p className="text-gray-600">Browse and interact with Farcaster Frames</p>
      </header>
      
      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Frames</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frames.map((frame) => (
            <Link 
              href={`/frame/${encodeURIComponent(frame.id)}`} 
              key={frame.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center p-4">
                <div className="flex-shrink-0 mr-4">
                  {frame.icon_url ? (
                    <Image 
                      src={frame.icon_url} 
                      alt={frame.name} 
                      width={64} 
                      height={64} 
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">F</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{frame.name}</h3>
                  <p className="text-gray-600 text-sm">By {frame.creator_name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {frames.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No frames found</p>
          </div>
        )}
      </section>
    </div>
  );
}