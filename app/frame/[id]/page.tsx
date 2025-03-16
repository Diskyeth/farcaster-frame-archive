"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  type FarcasterSigner,
  signFrameAction,
} from "@frames.js/render/farcaster";
import { useFrame } from "@frames.js/render/use-frame";
import { fallbackFrameContext, type FrameContext } from "@frames.js/render";
import { FrameUI, type FrameUIComponents, type FrameUITheme } from "@frames.js/render/ui";

// Define styling types and components
type StylingProps = {
  className?: string;
  style?: React.CSSProperties;
};

const components: FrameUIComponents<StylingProps> = {
  Image: (props, stylingProps) => {
    if (props.status === "frame-loading") return <></>;

    let sanitizedSrc = props.src;
    if (props.src.startsWith("data:") && !props.src.startsWith("data:image")) sanitizedSrc = "";
    if (props.src.startsWith("data:image/svg")) sanitizedSrc = "";

    return (
      <img
        {...stylingProps}
        src={sanitizedSrc}
        onLoad={props.onImageLoadEnd}
        onError={props.onImageLoadEnd}
        alt="Frame image"
        style={{ width: "100%", height: "auto" }}
      />
    );
  },
};

const theme: FrameUITheme<StylingProps> = {
  ButtonsContainer: { className: "flex gap-3 px-3 pb-3 bg-[#14141b]" },
  Button: { className: "border text-base text-white rounded flex-1 bg-[#222232] border-[#3A3A4C] py-3 px-4 hover:bg-[#2A2A3C] font-medium" },
  Root: { className: "flex flex-col w-full gap-2 border rounded-lg overflow-hidden bg-[#14141b] relative border-[#2A2A3C]" },
  Error: { className: "flex text-red-500 text-sm p-2 bg-[#14141b] border border-red-500 rounded-md shadow-md aspect-square justify-center items-center" },
  LoadingScreen: { className: "absolute inset-0 bg-[#14141b] z-10" },
  Image: { className: "w-full object-cover max-h-full" },
  ImageContainer: { className: "relative w-full h-full border-b border-[#2A2A3C] overflow-hidden", style: { aspectRatio: "var(--frame-image-aspect-ratio)" } },
  TextInput: { className: "p-2 border rounded border-[#2A2A3C] box-border w-full bg-[#14141b] text-white" },
  TextInputContainer: { className: "w-full px-2" },
};

type Frame = {
  id: string;
  name: string;
  creator_name: string;
  creator_profile_url?: string;
  url: string;
  icon_url: string;
  description?: string; // Added description field
};

export default function FrameView() {
  const router = useRouter();
  const params = useParams();
  const frameId = params?.id as string;
  
  const [frame, setFrame] = useState<Frame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // Set up Farcaster signer
  const farcasterSigner: FarcasterSigner = {
    fid: 1,
    status: "approved",
    publicKey: "0x00000000000000000000000000000000000000000000000000000000000000000",
    privateKey: "0x00000000000000000000000000000000000000000000000000000000000000000",
  };

  // Fetch the frame data
  useEffect(() => {
    const fetchFrame = async () => {
      if (!frameId) return;
      
      try {
        const response = await fetch(`/api/frame-list/${frameId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch frame');
        }
        
        const data = await response.json();
        console.log("Frame data:", data.frame);
        setFrame(data.frame);
      } catch (err) {
        console.error("Error fetching frame:", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrame();
  }, [frameId]);

  // Function to handle creator name click
  const handleCreatorClick = (e: React.MouseEvent, profileUrl: string | undefined) => {
    if (profileUrl) {
      e.preventDefault();
      window.open(profileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Function to handle share button click
  const handleShareClick = () => {
    const currentUrl = window.location.href;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentUrl)
        .then(() => {
          setShareStatus('URL copied to clipboard!');
          setTimeout(() => setShareStatus(null), 3000);
        })
        .catch(err => {
          console.error('Failed to copy URL: ', err);
          setShareStatus('Failed to copy URL');
          setTimeout(() => setShareStatus(null), 3000);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        setShareStatus(successful ? 'URL copied to clipboard!' : 'Failed to copy URL');
        setTimeout(() => setShareStatus(null), 3000);
      } catch (err) {
        console.error('Failed to copy URL: ', err);
        setShareStatus('Failed to copy URL');
        setTimeout(() => setShareStatus(null), 3000);
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Use any type to bypass type checking for signerState
  const signerState: any = {
    hasSigner: farcasterSigner.status === "approved",
    signer: farcasterSigner,
    isLoadingSigner: false,
    specification: "farcaster-signature",

    async onSignerlessFramePress() {
      console.log("A frame button was pressed without a signer.");
    },

    signFrameAction,

    async logout() {
      console.log("logout");
    },

    withContext: (context: FrameContext) => ({
      signerState,
      frameContext: context,
    }),
  };

  const frameState = useFrame({
    homeframeUrl: frame?.url || "",
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    connectedAddress: undefined,
    frameContext: fallbackFrameContext,
    signerState,
  });

  // Log frame state for debugging
  useEffect(() => {
    console.log("Frame state:", frameState);
  }, [frameState]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#10001D]">
        <div className="mb-6">
          <svg className="animate-spin" width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  fill="#8C56FF" stroke="#8C56FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-white text-lg">Loading Frame...</p>
      </div>
    );
  }

  if (error || !frame) {
    return (
      <div className="flex flex-col items-center py-10 bg-[#10001D] min-h-screen text-white">
        <div className="bg-red-500 text-white px-4 py-3 rounded mb-4">
          <p>Error: {error || 'Frame not found'}</p>
        </div>
        <button 
          onClick={() => router.push('/')} 
          className="px-6 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10001D] text-white px-4 py-8">
      <div className="container mx-auto max-w-2xl">
        {/* Logo and Back Button Header */}
        <header className="flex items-center mb-4 relative">
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
        
        <div className="w-full mb-6">
          <FrameUI frameState={frameState} components={components} theme={theme} />
        </div>

        {/* Separator */}
        <div className="border-t border-[#2A2A3C] mb-6"></div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {/* Frame Icon - Match the styling from the home page */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden mr-4">
                {frame.icon_url ? (
                  <img 
                    src={frame.icon_url} 
                    alt={frame.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/64x64?text=F";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-lg">
                    F
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{frame.name}</h1>
                <p 
                  onClick={(e) => handleCreatorClick(e, frame.creator_profile_url)}
                  className={`text-[#8C56FF] text-sm ${frame.creator_profile_url ? 'cursor-pointer hover:underline' : ''}`}
                >
                  @{frame.creator_name}
                </p>
              </div>
            </div>
            
            {/* Share Frame Button */}
            <div className="flex items-center">
              <button 
                onClick={handleShareClick}
                className="px-4 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center justify-center gap-2"
                aria-label="Share frame"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
              {shareStatus && (
                <span className="ml-3 text-green-400 text-sm">{shareStatus}</span>
              )}
            </div>
          </div>
          
          {/* Frame Description */}
          <div className="mt-4">
            {frame.description && (
              <div className="text-gray-300">
                <p>{frame.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}