"use client";

import { useState, useEffect, useRef } from "react";

// Define props interface with proper types
interface FrameDebugPanelProps {
  frameState: any; // Using any for frameState since its structure varies
  isVisible?: boolean;
}

// Improved debug panel that handles null frameState
export function FrameDebugPanel({ frameState, isVisible = false }: FrameDebugPanelProps) {
  const [showDebug, setShowDebug] = useState(isVisible);
  const [errorLog, setErrorLog] = useState<Array<{
    time: string;
    statusCode?: number;
    message: string;
  }>>([]);
  const [requestLog, setRequestLog] = useState<Array<{
    time: string;
    buttonIndex: number;
    inputText: string | null;
  }>>([]);
  const [sdkStatus, setSdkStatus] = useState("unknown");
  const [sdkContext, setSdkContext] = useState<any>(null);
  
  // Add a ref to track debug status changes for logging
  const prevFrameState = useRef<any>(null);
  
  // Track frame state changes for debugging
  useEffect(() => {
    if (!frameState) return;
    
    // Check for changes that are worth logging
    const hasChanged = prevFrameState.current?.status !== (frameState as any).status;
    prevFrameState.current = { ...frameState };
    
    // Log state changes
    const status = (frameState as any).status;
    if (status && hasChanged) {
      console.log("Frame state updated:", status);
    }
    
    // Only log significant changes or errors
    if ((frameState as any).status === "error" && (frameState as any).error) {
      const newError = {
        time: new Date().toLocaleTimeString(),
        statusCode: (frameState as any).error.statusCode,
        message: (frameState as any).error.message || "Unknown error",
      };
      
      setErrorLog(prev => {
        // Check if this error is already in the log to avoid duplicates
        if (prev.some(e => e.message === newError.message && e.statusCode === newError.statusCode)) {
          return prev;
        }
        return [newError, ...prev].slice(0, 5); // Keep last 5 errors
      });
    }
    
    // Track when buttons are clicked
    if ((frameState as any).status === "button-pressed") {
      const newRequest = {
        time: new Date().toLocaleTimeString(),
        buttonIndex: (frameState as any).buttonIndex || 0,
        inputText: (frameState as any).inputText || null,
      };
      
      setRequestLog(prev => [newRequest, ...prev].slice(0, 3)); // Keep last 3 requests
    }
  }, [frameState]);
  
  // Better SDK detection that checks both window.farcaster and the SDK import
  useEffect(() => {
    const checkSdk = async () => {
      try {
        // Check if SDK is available through the global window object
        if (typeof window !== 'undefined' && (window as any).farcaster) {
          setSdkStatus("available");
          setSdkContext((window as any).farcaster);
          return;
        }
        
        // Try to access SDK context via the import
        try {
          const sdk = await import('@farcaster/frame-sdk');
          const contextData = await sdk.default.context;
          if (contextData) {
            setSdkStatus("available");
            setSdkContext(contextData);
            return;
          }
        } catch (e) {
          console.log("SDK import check failed", e);
        }
        
        // Check if we can find any user data in the frameState
        const signerState = (frameState as any)?.signerState;
        const hasFid = signerState?.signer?.fid || signerState?.hasSigner;
        
        if (hasFid) {
          setSdkStatus("available");
          setSdkContext({ user: { fid: signerState?.signer?.fid } });
          return;
        }
        
        // No SDK found
        setSdkStatus("unavailable");
      } catch (err) {
        console.error("Error checking SDK:", err);
        setSdkStatus("error");
      }
    };
    
    checkSdk();
    
    // Check periodically in case it loads later
    const checkInterval = setInterval(checkSdk, 3000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [frameState]);
  
  // Toggle debug panel visibility
  const toggleDebug = () => {
    setShowDebug(prev => !prev);
  };
  
  // Force reload the page - useful for debugging
  const forceReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };
  
  // Log frame state to console
  const logFrameState = () => {
    if (!frameState) return;
    
    console.group("Frame State Debug Info");
    console.log("Full frame state:", frameState);
    console.log("Status:", (frameState as any).status);
    console.log("Frame URL:", (frameState as any).frameUrl);
    console.log("Has signer:", (frameState as any).signerState?.hasSigner);
    console.log("FID:", (frameState as any).signerState?.signer?.fid);
    console.log("Errors:", (frameState as any).error);
    console.groupEnd();
  };
  
  // Log SDK info to console
  const logSdkInfo = () => {
    console.group("Farcaster SDK Debug Info");
    console.log("SDK Status:", sdkStatus);
    console.log("Window Farcaster object:", (window as any).farcaster);
    console.log("SDK Context:", sdkContext);
    
    // Try to import SDK directly and log results
    import('@farcaster/frame-sdk').then(sdk => {
      console.log("SDK import successful:", sdk);
      sdk.default.context.then((context: any) => {
        console.log("SDK context from import:", context);
      }).catch((err: any) => {
        console.error("Error getting SDK context:", err);
      });
    }).catch(err => {
      console.error("Error importing SDK:", err);
    });
    
    console.groupEnd();
  };
  
  // Extract FID from all possible sources
  const extractFid = () => {
    // Check frame state signer
    const frameFid = (frameState as any)?.signerState?.signer?.fid;
    
    // Check SDK context
    const sdkFid = sdkContext?.user?.fid;
    
    // Check window Farcaster
    const windowFid = (window as any)?.farcaster?.user?.fid;
    
    return frameFid || sdkFid || windowFid || "none";
  };
  
  return (
    <>
      {/* Toggle button */}
      <button 
        onClick={toggleDebug}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full z-50 opacity-70 hover:opacity-100"
        aria-label="Toggle debug panel"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Debug panel */}
      {showDebug && (
        <div className="fixed bottom-16 right-4 w-80 bg-gray-900 bg-opacity-90 text-white p-3 rounded-lg z-50 text-xs font-mono overflow-hidden shadow-lg">
          <h3 className="font-bold text-sm mb-2 pb-1 border-b border-gray-700 flex justify-between">
            <span>Frame Debug</span>
            <button 
              onClick={forceReload}
              className="text-xs text-blue-400 hover:text-blue-300"
              title="Reload page"
            >
              Reload
            </button>
          </h3>
          
          <div className="mb-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={
                !frameState ? "text-yellow-400" :
                (frameState as any).status === "error" ? "text-red-400" : 
                "text-green-400"
              }>
                {!frameState ? "initializing" : (frameState as any).status || "unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth:</span>
              <span className={
                !frameState ? "text-yellow-400" :
                (frameState as any).signerState?.hasSigner ? "text-green-400" : 
                "text-red-400"
              }>
                {!frameState ? "..." : ((frameState as any).signerState?.hasSigner ? "✓" : "✗")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>FID:</span>
              <span>{extractFid()}</span>
            </div>
            <div className="flex justify-between">
              <span>SDK:</span>
              <span className={
                sdkStatus === "available" ? "text-green-400" :
                sdkStatus === "unavailable" ? "text-red-400" :
                "text-yellow-400"
              }>
                {sdkStatus}
              </span>
            </div>
            {frameState && (frameState as any).frameUrl && (
              <div className="flex justify-between">
                <span>URL:</span>
                <span className="truncate max-w-40" title={(frameState as any).frameUrl}>
                  {(frameState as any).frameUrl ? new URL((frameState as any).frameUrl).hostname : "none"}
                </span>
              </div>
            )}
          </div>
          
          {errorLog.length > 0 && (
            <div className="mt-3">
              <h4 className="font-bold text-red-400">Recent Errors:</h4>
              <div className="mt-1 max-h-32 overflow-y-auto">
                {errorLog.map((err, i) => (
                  <div key={i} className="mt-1 pb-1 border-b border-gray-800">
                    <div className="text-gray-400 text-[10px]">{err.time}</div>
                    <div className="text-red-400">{err.statusCode || "?"}: {err.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {requestLog.length > 0 && (
            <div className="mt-3">
              <h4 className="font-bold text-blue-400">Recent Interactions:</h4>
              <div className="mt-1">
                {requestLog.map((req, i) => (
                  <div key={i} className="mt-1 pb-1 border-b border-gray-800">
                    <div className="text-gray-400 text-[10px]">{req.time}</div>
                    <div>Button: {req.buttonIndex}</div>
                    {req.inputText && <div>Input: {req.inputText}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button 
              onClick={logFrameState}
              className="bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded text-[10px]"
              disabled={!frameState}
            >
              Log State
            </button>
            <button 
              onClick={logSdkInfo}
              className="bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded text-[10px]"
            >
              Log SDK
            </button>
          </div>
          
          <div className="mt-2 text-center text-[10px] text-gray-400">
            {sdkStatus === "unavailable" ? (
              <div className="bg-red-500 bg-opacity-20 p-1 rounded mt-2">
                SDK not detected - Interactions may fail
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}