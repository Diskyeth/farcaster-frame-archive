"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type Frame = {
  id: string;
  name: string;
  creator_name: string;
  creator_profile_url?: string;
  url: string;
  icon_url: string;
  created_at: string;
  tags?: string[];
  description?: string; // Added description field
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTag = searchParams.get('tag') || 'all';
  
  const [frames, setFrames] = useState<Frame[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        console.log("Fetching tags...");
        const response = await fetch("/api/tags");
        if (!response.ok) throw new Error("Failed to fetch tags");

        const data = await response.json();
        console.log("Received tags:", data.tags);
        
        // Filter out any "all" tag if it exists in the API response
        const filteredTags = data.tags.filter((tag: Tag) => tag.slug !== 'all');
        setTags(filteredTags);
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Fetch frames based on selected tag
  useEffect(() => {
    const fetchFrames = async () => {
      setIsLoadingFrames(true);
      try {
        console.log(`Fetching frames with tag: ${currentTag}`);
        const response = await fetch(`/api/frame-list?tag=${currentTag}`);
        if (!response.ok) throw new Error("Failed to fetch frames");

        const data = await response.json();
        console.log("Received frames:", data.frames);
        setFrames(data.frames);
      } catch (err) {
        console.error("Error fetching frames:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingFrames(false);
      }
    };

    fetchFrames();
  }, [currentTag]);

  // Filter change handler
  const handleTagChange = (tagSlug: string) => {
    console.log(`Changing tag to: ${tagSlug}`);
    router.push(`/?tag=${tagSlug}`);
  };

  // Function to handle creator name click
  const handleCreatorClick = (e: React.MouseEvent, profileUrl: string | undefined) => {
    if (profileUrl) {
      e.preventDefault(); // Prevent the parent Link from navigating
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isLoading = isLoadingTags || isLoadingFrames;

  if (isLoading && frames.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#10001D]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10001D] text-white px-4 py-8">
      {/* Header with Logo and Buttons */}
      <header className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <Image src="/logo.png" alt="Logo" width={204} height={50} priority />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/load-frame')}
            className="px-4 py-2 bg-[#1D1D29] text-white rounded-full hover:bg-[#2A2A3C] flex items-center gap-2 border border-[#2A2A3C]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load
          </button>
          <a 
            href="https://forms.gle/oqpNiuK6vkveHhNv9" 
            onClick={(e) => {
              e.preventDefault();
              window.open("https://forms.gle/oqpNiuK6vkveHhNv9", "_top");
            }}
            className="px-4 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center gap-2"
          >
            Submit
          </a>
        </div>
      </header>

      {/* Disclaimer Text */}
      <div className="text-gray-400 text-sm mb-6 max-w-2xl mx-auto">
        <p>This project was created to preserve the legacy of the V1 frame in Farcaster. However, there are no guarantees that each frame will continue to work as intended.</p>
      </div>
      
      {/* Tag Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {/* All tag as a single button */}
        <button
          onClick={() => handleTagChange('all')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            currentTag === 'all'
              ? 'bg-[#8C56FF] text-white'
              : 'bg-[#1D1D29] text-white hover:bg-[#2A2A3C]'
          }`}
        >
          All
        </button>
        
        {/* Other tag buttons */}
        {tags.length > 0 && 
          tags.map((tag: Tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagChange(tag.slug)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                currentTag === tag.slug
                  ? 'bg-[#8C56FF] text-white'
                  : 'bg-[#1D1D29] text-white hover:bg-[#2A2A3C]'
              }`}
            >
              {tag.name}
            </button>
          ))
        }
      </div>

      {/* Frame List */}
      <section className="max-w-2xl mx-auto">
        {isLoadingFrames ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="flex flex-col">
            {frames.map((frame: Frame, index: number) => (
              <div key={frame.id}>
                <Link
                  href={`/frame/${encodeURIComponent(frame.id)}`}
                  className="flex items-start py-4 hover:opacity-80 transition-opacity"
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
                        unoptimized={true}
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
                    
                    {/* Description */}
                    {frame.description && (
                      <p className="text-gray-400 text-sm mt-1 mb-1 line-clamp-2">
                        {frame.description}
                      </p>
                    )}
                    
                    <p 
                      onClick={(e) => handleCreatorClick(e, frame.creator_profile_url)}
                      className={`text-[#8C56FF] text-sm ${frame.creator_profile_url ? 'cursor-pointer hover:underline' : ''}`}
                    >
                      @{frame.creator_name}
                    </p>
                  </div>
                </Link>
                
                {/* Add separator line after each item except the last one */}
                {index < frames.length - 1 && (
                  <div className="border-b border-[#2A2A3C]"></div>
                )}
              </div>
            ))}

            {frames.length === 0 && !isLoadingFrames && (
              <div className="text-center py-10">
                <p className="text-gray-400">No frames found for this filter</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}