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
  ButtonsContainer: { className: "flex gap-2 px-2 pb-2 bg-[#14141b]" },
  Button: { className: "border text-sm text-white rounded flex-1 bg-[#14141b] border-[#2A2A3C] p-2 hover:bg-[#1b1b24]" },
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
};

export default function FrameView() {
  const router = useRouter();
  const params = useParams();
  const frameId = params?.id as string;
  
  const [frame, setFrame] = useState<Frame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex justify-center items-center h-screen bg-[#10001D]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
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
            className="px-4 py-2 bg-[#8C56FF] text-white rounded-full hover:opacity-90 flex items-center gap-2 absolute left-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="w-full flex justify-center">
            <Image src="/logo.png" alt="Logo" width={204} height={50} priority />
          </div>
        </header>
        
        <div className="w-full mb-6">
          <FrameUI frameState={frameState} components={components} theme={theme} />
        </div>

        <div className="mt-6">
          <div className="flex items-center mb-3">
            {frame.icon_url && (
              <img 
                src={frame.icon_url} 
                alt={frame.name} 
                className="w-12 h-12 rounded-full mr-4"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/64x64?text=F";
                }}
              />
            )}
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
          <div className="mt-2 text-gray-400 text-sm">
            <p>Frame URL: <a href={frame.url} target="_blank" rel="noopener noreferrer" className="text-[#8C56FF] hover:underline">{frame.url}</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}