"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { signFrameAction } from "@frames.js/render/farcaster";
import { useFrame } from "@frames.js/render/use-frame";
import { fallbackFrameContext } from "@frames.js/render";
import { FrameUI, type FrameUIComponents, type FrameUITheme } from "@frames.js/render/ui";
import sdk from '@farcaster/frame-sdk';
import { FrameDebugPanel } from '@/components/FrameDebugPanel';

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

export default function FrameView() {
  const router = useRouter();
  const params = useParams();
  const frameId = params?.id as string;
  
  const [frame, setFrame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameError, setFrameError] = useState<any>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [sdkContext, setSdkContext] = useState<any>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  
  // Enhanced SDK loading with retry
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadSDK = async () => {
      try {
        console.log("Initializing Farcaster SDK...");
        const contextData = await sdk.context;
        
        if (!isMounted) return;
        
        console.log("SDK context loaded:", contextData);
        setSdkContext(contextData);
        setIsSDKLoaded(true);
        
        // Signal that the app is ready to receive Farcaster data
        sdk.actions.ready();
        
        if (contextData?.user?.fid) {
          console.log("User authenticated with FID:", contextData.user.fid);
        } else {
          console.warn("No FID found in Farcaster context");
        }
      } catch (err) {
        console.error("Failed to load Frame SDK:", err);
        
        // Retry logic
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`Retrying SDK initialization (${retryCount}/${maxRetries})...`);
          setTimeout(loadSDK, 1000); // Retry after 1 second
        }
      }
    };
    
    loadSDK();
    
    return () => {
      isMounted = false;
    };
  }, []);

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
        console.log("Frame data loaded:", data.frame);
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

  // Create a Farcaster signer based on SDK context
  const hasFarcasterUser = isSDKLoaded && !!sdkContext?.user?.fid;
  
  // Create the signer state
  const signerState = {
    hasSigner: hasFarcasterUser,
    signer: hasFarcasterUser ? {
      fid: sdkContext.user.fid,
      status: "approved", 
      publicKey: "0x" + "0".repeat(64),
      privateKey: "0x" + "0".repeat(64),
    } : { status: "not-connected" },
    isLoadingSigner: !isSDKLoaded,
    specification: "farcaster-signature",

    async onSignerlessFramePress(buttonIndex: number) {
      console.log("Frame button pressed without a signer, button index:", buttonIndex);
      setError("Please connect your Farcaster account to interact with this frame");
    },

    signFrameAction,

    async logout() {
      console.log("Logout requested");
    },

    withContext: (context: any) => ({
      signerState,
      frameContext: context,
    })
  };
  
  // Call useFrame with the frame URL
  const frameState = useFrame({
    homeframeUrl: frame?.url || "",
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    connectedAddress: undefined,
    frameContext: fallbackFrameContext,
    signerState: signerState as any, // Use type assertion to bypass TypeScript check
  });

  // Handle frame errors separately
  useEffect(() => {
    if (!frameState) return;
    
    // Check for errors in the frame state
    // Since we don't know the exact structure, we'll check various properties
    const anyFrameState = frameState as any;
    
    if (anyFrameState.error) {
      console.error("Frame error detected:", anyFrameState.error);
      setFrameError(anyFrameState.error);
      
      // Check for 401 specifically
      if (anyFrameState.error.statusCode === 401) {
        console.warn("Authentication error (401) when interacting with frame");
      }
    }
  }, [frameState]);

  // Show loading state
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

  // Show error state
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
        {/* Header and back button */}
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
        
        {/* Farcaster user status */}
        {isSDKLoaded ? (
          sdkContext?.user?.fid ? (
            <div className="bg-[#1D1D29] p-3 rounded-lg mb-4 flex items-center">
              <div className="mr-3">
                {sdkContext.user.pfpUrl ? (
                  <Image 
                    src={sdkContext.user.pfpUrl}
                    alt={sdkContext.user.username || "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-6 h-6 bg-[#8C56FF] rounded-full flex items-center justify-center text-white text-xs">
                    {sdkContext.user.username ? sdkContext.user.username.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div className="text-sm">
                Connected as <span className="text-[#8C56FF] font-medium">@{sdkContext.user.username}</span>
                <span className="text-xs text-gray-400 ml-2">(FID: {sdkContext.user.fid})</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#1D1D29] p-3 rounded-lg mb-4 flex items-center">
              <div className="mr-3 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-grow">
                <p className="text-yellow-400 text-sm">Not connected to Farcaster. Some frame interactions may fail.</p>
                <p className="text-xs text-gray-400 mt-1">Please connect with a Farcaster account to interact with frames.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-[#8C56FF] rounded-full text-xs ml-2"
              >
                Retry
              </button>
            </div>
          )
        ) : (
          <div className="bg-[#1D1D29] p-3 rounded-lg mb-4 flex items-center">
            <div className="mr-3">
              <svg className="animate-spin h-5 w-5 text-[#8C56FF]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="text-sm">Loading Farcaster connection...</div>
          </div>
        )}
        
        {/* Frame UI */}
        <div className="w-full mb-6">
          <FrameUI frameState={frameState} components={components} theme={theme} />
          
          {/* Show error messages related to frame interactions */}
          {frameError && (
            <div className="mt-3 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">
                Error: {frameError.message || "Failed to interact with frame"}
              </p>
              {frameError.statusCode === 401 && (
                <p className="text-red-300 text-xs mt-1">
                  This frame requires Farcaster authentication.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-[#2A2A3C] mb-6"></div>

        {/* Frame details */}
        <div>
          <div className="flex items-center justify-between mb-3">
            {/* Frame icon and name */}
            <div className="flex items-center">
              {/* Frame Icon */}
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
                  onClick={(e) => frame.creator_profile_url && window.open(frame.creator_profile_url, '_blank')}
                  className={`text-[#8C56FF] text-sm ${frame.creator_profile_url ? 'cursor-pointer hover:underline' : ''}`}
                >
                  @{frame.creator_name}
                </p>
              </div>
            </div>
            
            {/* Share button */}
            <div className="flex items-center">
              <button 
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  setShareStatus('URL copied to clipboard!');
                  setTimeout(() => setShareStatus(null), 3000);
                }}
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
          
          {/* Frame description */}
          {frame.description && (
            <div className="mt-4">
              <div className="text-gray-300">
                <p>{frame.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Debug panel */}
      <FrameDebugPanel frameState={frameState} isVisible={true} />
    </div>
  );
}