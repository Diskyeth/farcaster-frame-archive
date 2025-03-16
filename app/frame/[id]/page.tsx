"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ButtonsContainer: { className: "flex gap-2 px-2 pb-2 bg-white" },
  Button: { className: "border text-sm text-gray-700 rounded flex-1 bg-white border-gray-300 p-2" },
  Root: { className: "flex flex-col w-full gap-2 border rounded-lg overflow-hidden bg-white relative" },
  Error: { className: "flex text-red-500 text-sm p-2 bg-white border border-red-500 rounded-md shadow-md aspect-square justify-center items-center" },
  LoadingScreen: { className: "absolute inset-0 bg-gray-300 z-10" },
  Image: { className: "w-full object-cover max-h-full" },
  ImageContainer: { className: "relative w-full h-full border-b border-gray-300 overflow-hidden", style: { aspectRatio: "var(--frame-image-aspect-ratio)" } },
  TextInput: { className: "p-2 border rounded border-gray-300 box-border w-full" },
  TextInputContainer: { className: "w-full px-2" },
};

type Frame = {
  id: string;
  name: string;
  creator_name: string;
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !frame) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error || 'Frame not found'}</p>
        </div>
        <button 
  onClick={() => router.push('/')} 
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
  Back
</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
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
            <p className="text-gray-600">By {frame.creator_name}</p>
          </div>
        </div>
        <p className="text-gray-700 mb-2">Frame URL: {frame.url}</p>
      </div>

      <div className="w-full max-w-md mx-auto">
        <FrameUI frameState={frameState} components={components} theme={theme} />
      </div>
    </div>
  );
}