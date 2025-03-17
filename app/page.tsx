"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import sdk from '@farcaster/frame-sdk';

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
  description?: string;
  version?: string; 
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
  const [shareStatuses, setShareStatuses] = useState<Record<string, string | null>>({});
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);


  useEffect(() => {
    const loadSDK = async () => {
      try {
        await sdk.context;
        setIsSDKLoaded(true);
      } catch (err) {
        console.error("Failed to load Frame SDK:", err);
      }
    };
    
    loadSDK();
  }, []);


  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        console.log("Fetching tags...");
        const response = await fetch("/api/tags");
        if (!response.ok) throw new Error("Failed to fetch tags");

        const data = await response.json();
        console.log("Received tags:", data.tags);
        

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

 
  const handleTagChange = (tagSlug: string) => {
    console.log(`Changing tag to: ${tagSlug}`);
    router.push(`/?tag=${tagSlug}`);
  };

  
  const handleCreatorClick = (e: React.MouseEvent, profileUrl: string | undefined) => {
    if (profileUrl) {
      e.preventDefault(); // Prevent the parent Link from navigating
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  
  const handleShareClick = (e: React.MouseEvent, frameId: string) => {
    e.preventDefault(); // Prevent the parent Link from navigating
    const shareUrl = `${window.location.origin}/frame/${encodeURIComponent(frameId)}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setShareStatuses(prev => ({ ...prev, [frameId]: 'Copied!' }));
          setTimeout(() => {
            setShareStatuses(prev => ({ ...prev, [frameId]: null }));
          }, 3000);
        })
        .catch(err => {
          console.error('Failed to copy URL: ', err);
          setShareStatuses(prev => ({ ...prev, [frameId]: 'Failed to copy' }));
          setTimeout(() => {
            setShareStatuses(prev => ({ ...prev, [frameId]: null }));
          }, 3000);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        setShareStatuses(prev => ({ 
          ...prev, 
          [frameId]: successful ? 'Copied!' : 'Failed to copy' 
        }));
        setTimeout(() => {
          setShareStatuses(prev => ({ ...prev, [frameId]: null }));
        }, 3000);
      } catch (err) {
        console.error('Failed to copy URL: ', err);
        setShareStatuses(prev => ({ ...prev, [frameId]: 'Failed to copy' }));
        setTimeout(() => {
          setShareStatuses(prev => ({ ...prev, [frameId]: null }));
        }, 3000);
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Function to handle submit button click - uses SDK to open external URL
  const handleSubmitClick = useCallback(() => {
    if (isSDKLoaded) {
      // Use SDK to open an external URL
      sdk.actions.openUrl('https://forms.gle/oqpNiuK6vkveHhNv9');
    } else {
      // Fallback to opening in a new tab
      window.open('https://forms.gle/oqpNiuK6vkveHhNv9', '_top');
    }
  }, [isSDKLoaded]);

  const isLoading = isLoadingTags || isLoadingFrames;

  if (isLoading && frames.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#10001D]">
        <div className="mb-6">
          <svg className="animate-spin" width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  fill="#8C56FF" stroke="#8C56FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-white text-lg">Loading Frames...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10001D] text-white px-4 py-8">
    
      <header className="max-w-2xl mx-auto mb-2 flex items-center justify-between">
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
          
          <button 
            onClick={handleSubmitClick}
            className="px-4 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit
          </button>
        </div>
      </header>

      
      <div className="text-gray-400 text-sm mb-4 max-w-2xl mx-auto mt-2">
        <div className="bg-[#1D1D29] p-2 rounded-lg flex items-center">
          <div className="flex-shrink-0 mr-3">
            <svg className="h-6 w-6 text-[#8C56FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p>This project aims to preserve the legacy of the V1 frames on Farcaster, though continued functionality isn't guaranteed.</p>
        </div>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
            <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                    fill="#8C56FF" stroke="#8C56FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col">
            {frames.map((frame: Frame, index: number) => (
              <div key={frame.id}>
                <div className="flex items-start py-4 relative">
                 
                  <Link
                    href={`/frame/${encodeURIComponent(frame.id)}`}
                    className="flex items-start hover:opacity-80 transition-opacity flex-grow"
                  >
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

                  
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold">{frame.name}</h3>
                        {frame.version === 'v2' && (
                          <span className="ml-2 px-2 py-0.5 bg-[#8C56FF] bg-opacity-20 text-[#8C56FF] text-xs rounded-full">
                            V2
                          </span>
                        )}
                      </div>
                      
                      
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
                  
                
                  <div className="flex items-center ml-2">
                    <button 
                      onClick={(e) => handleShareClick(e, frame.id)}
                      className="p-2 bg-[#1D1D29] text-white rounded-full hover:bg-[#2A2A3C] flex items-center justify-center border border-[#2A2A3C]"
                      aria-label="Share frame"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    {shareStatuses[frame.id] && (
                      <span className="ml-2 text-green-400 text-xs">{shareStatuses[frame.id]}</span>
                    )}
                  </div>
                </div>
                
                
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