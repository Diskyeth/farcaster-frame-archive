"use client";

import { useState } from "react";
import { useFrame } from "@frames.js/render/use-frame";
import { fallbackFrameContext } from "@frames.js/render";
import { FrameUI, type FrameUIComponents, type FrameUITheme } from "@frames.js/render/ui";
import Image from "next/image";

type StylingProps = {
  className?: string;
  style?: React.CSSProperties;
};

const components: FrameUIComponents<StylingProps> = {
  Image: (props, stylingProps) => {
    if (props.status === "frame-loading") return <></>;

    let sanitizedSrc = props.src;

    if (props.src.startsWith("data:") && !props.src.startsWith("data:image")) {
      sanitizedSrc = "";
    }

    if (props.src.startsWith("data:image/svg")) {
      sanitizedSrc = "";
    }

    return (
      <Image
        {...stylingProps}
        src={sanitizedSrc}
        onLoadingComplete={props.onImageLoadEnd}
        alt="Frame image"
        width={500} 
        height={500} 
        style={{ width: "100%", height: "auto" }}
      />
    );
  },
};

const theme: FrameUITheme<StylingProps> = {
  ButtonsContainer: { className: "flex gap-[8px] px-2 pb-2 bg-white" },
  Button: { className: "border text-sm text-gray-700 rounded flex-1 bg-white border-gray-300 p-2" },
  Root: { className: "flex flex-col w-full gap-2 border rounded-lg overflow-hidden bg-white relative" },
  Error: { className: "flex text-red-500 text-sm p-2 bg-white border border-red-500 rounded-md shadow-md aspect-square justify-center items-center" },
  LoadingScreen: { className: "absolute top-0 left-0 right-0 bottom-0 bg-gray-300 z-10" },
  Image: { className: "w-full object-cover max-h-full" },
  ImageContainer: { className: "relative w-full h-full border-b border-gray-300 overflow-hidden", style: { aspectRatio: "var(--frame-image-aspect-ratio)" } },
  TextInput: { className: "p-[6px] border rounded border-gray-300 box-border w-full" },
  TextInputContainer: { className: "w-full px-2" },
};

export default function Home() {
  const [url, setUrl] = useState("https://framesjs.org"); // Default frame URL
  const [currentFrameUrl, setCurrentFrameUrl] = useState(url);

  // Load a new frame URL when user clicks the button
  const loadFrame = () => {
    setCurrentFrameUrl(url);
  };

  const frameState = useFrame({
    homeframeUrl: currentFrameUrl, 
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    connectedAddress: undefined,
    frameContext: fallbackFrameContext,
    signerState: {
      hasSigner: false, // ✅ No signer needed
      signer: null, // ✅ Prevents errors
      isLoadingSigner: false,
      specification: "farcaster_v2", // ✅ Corrected value
      async onSignerlessFramePress() {
        console.log("A frame button was pressed without a signer.");
      },
      signFrameAction: async (context) => ({
        signature: "", // ✅ Empty signature (not required)
        signedPayload: {}, // ✅ Empty payload
        body: {
          action: "noop", // ✅ Dummy action
          timestamp: Date.now(), // ✅ Adds a timestamp for structure
        },
        searchParams: new URLSearchParams(), // ✅ Properly formatted empty `URLSearchParams`
      }),
      async logout() {
        console.log("logout");
      },
      withContext: (context) => ({
        signerState: {
          hasSigner: false,
          signer: null,
          isLoadingSigner: false,
          specification: "farcaster_v2",
          async onSignerlessFramePress() {
            console.log("A frame button was pressed without a signer.");
          },
          signFrameAction: async (context) => ({
            signature: "",
            signedPayload: {},
            body: { action: "noop", timestamp: Date.now() },
            searchParams: new URLSearchParams(),
          }),
          async logout() {
            console.log("logout");
          },
          withContext: (newContext) => ({
            signerState: {
              hasSigner: false,
              signer: null,
              isLoadingSigner: false,
              specification: "farcaster_v2",
              async onSignerlessFramePress() {
                console.log("A frame button was pressed without a signer.");
              },
              signFrameAction: async (context) => ({
                signature: "",
                signedPayload: {},
                body: { action: "noop", timestamp: Date.now() },
                searchParams: new URLSearchParams(),
              }),
              async logout() {
                console.log("logout");
              },
              withContext: (context) => ({
                signerState: {
                  hasSigner: false,
                  signer: null,
                  isLoadingSigner: false,
                  specification: "farcaster_v2",
                  async onSignerlessFramePress() {
                    console.log("A frame button was pressed without a signer.");
                  },
                  signFrameAction: async (context) => ({
                    signature: "",
                    signedPayload: {},
                    body: { action: "noop", timestamp: Date.now() },
                    searchParams: new URLSearchParams(),
                  }),
                  async logout() {
                    console.log("logout");
                  },
                },
                frameContext: context,
              }),
            },
            frameContext: newContext,
          }),
        },
        frameContext: context, // ✅ Required by `withContext`
      }),
    },
  });
  
  

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Farcaster V1 Frame Loader</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter frame URL..."
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
      />
      <button onClick={loadFrame} style={{ padding: "10px", width: "100%" }}>
        Load Frame
      </button>

      {/* Render the frame */}
      <FrameUI frameState={frameState} components={components} theme={theme} />
    </div>
  );
}
