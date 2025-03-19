"use client";

import { useState, useEffect } from "react";

// Improved debug panel that handles null frameState
export function FrameDebugPanel({ frameState, isVisible = false }) {
  const [showDebug, setShowDebug] = useState(isVisible);
  const [errorLog, setErrorLog] = useState([]);
  const [requestLog, setRequestLog] = useState([]);
  const [sdkStatus, setSdkStatus] = useState("unknown");
  
  // Track frame state changes for debugging
  useEffect(() => {
    if (!frameState) return;
    
    // Log state changes
    console.log("Frame state updated:", frameState.status);
    
    // Only log significant changes or errors
    if (frameState.status === "error" && frameState.error) {
      const newError = {
        time: new Date().toLocaleTimeString(),
        statusCode: frameState.error.statusCode,
        message: frameState.error.message,
      };
      
      setErrorLog(prev => [newError, ...prev].slice(0, 5)); // Keep last 5 errors
    }
    
    // Track when buttons are clicked
    if (frameState.status === "button-pressed") {
      const newRequest = {
        time: new Date().toLocaleTimeString(),
        buttonIndex: frameState.buttonIndex,
        inputText: frameState.inputText || null,
      };
      
      setRequestLog(prev => [newRequest, ...prev].slice(0, 3)); // Keep last 3 requests
    }
  }, [frameState]);
  
  // Check for SDK status
  useEffect(() => {
    // @ts-ignore (for window.farcaster access)
    if (typeof window !== 'undefined' && window.farcaster) {
      setSdkStatus("available");
    } else {
      setSdkStatus("unavailable");
    }
  }, []);
  
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
                frameState.status === "error" ? "text-red-400" : 
                "text-green-400"
              }>
                {!frameState ? "initializing" : frameState.status || "unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auth:</span>
              <span className={
                !frameState ? "text-yellow-400" :
                frameState.signerState?.hasSigner ? "text-green-400" : 
                "text-red-400"
              }>
                {!frameState ? "..." : (frameState.signerState?.hasSigner ? "✓" : "✗")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>FID:</span>
              <span>{!frameState ? "loading" : (frameState.signerState?.signer?.fid || "none")}</span>
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
            {frameState && frameState.frameUrl && (
              <div className="flex justify-between">
                <span>URL:</span>
                <span className="truncate max-w-40" title={frameState.frameUrl}>
                  {new URL(frameState.frameUrl).hostname}
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
              onClick={() => frameState && console.log("Frame state:", frameState)}
              className="bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded text-[10px]"
              disabled={!frameState}
            >
              Log State
            </button>
            <button 
              onClick={() => console.log("SDK context:", window.farcaster)}
              className="bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded text-[10px]"
            >
              Log SDK
            </button>
          </div>
        </div>
      )}
    </>
  );
}