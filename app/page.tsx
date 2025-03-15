"use client";

import { useState } from "react";
import {
  type FarcasterSigner,
  signFrameAction,
} from "@frames.js/render/farcaster";
import { useFrame } from "@frames.js/render/use-frame";
import { fallbackFrameContext } from "@frames.js/render";
import { type FrameUIComponents, FrameUI, type FrameUITheme } from "@frames.js/render/ui";
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
        width={500} // Adjust width as needed
        height={500} // Adjust height as needed
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

  const farcasterSigner: FarcasterSigner = {
    fid: 1,
    status: "approved",
    publicKey: "0x00000000000000000000000000000000000000000000000000000000000000000",
    privateKey: "0x00000000000000000000000000000000000000000000000000000000000000000",
  };

  // Update the frame when the user clicks "Load Frame"
  const loadFrame = () => {
    setCurrentFrameUrl(url);
  };

  const frameState = useFrame({
    homeframeUrl: currentFrameUrl, // Dynamically updates frame
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    connectedAddress: undefined,
    frameContext: fallbackFrameContext,
    signerState: {
      hasSigner: farcasterSigner.status === "approved",
      signer: farcasterSigner,
      isLoadingSigner: false,
      async onSignerlessFramePress() {
        console.log("A frame button was pressed without a signer.");
      },
      signFrameAction,
      async logout() {
        console.log("logout");
      },
      specification: "farcaster-signature", // ✅ Fix: Added required property
      withContext: (context) => ({ ...context }), // ✅ Fix: Added required property
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

      {/* Frame UI */}
      <FrameUI frameState={frameState} components={components} theme={theme} />
    </div>
  );
}
