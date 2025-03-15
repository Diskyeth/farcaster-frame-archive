"use client";

import { useState } from "react";
import {
  type FarcasterSigner,
  signFrameAction,
} from "@frames.js/render/farcaster";
import { useFrame } from "@frames.js/render/use-frame";
import { fallbackFrameContext, type FrameContext } from "@frames.js/render";
import { FrameUI, type FrameUIComponents, type FrameUITheme } from "@frames.js/render/ui";

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

export default function Home() {
  const [url, setUrl] = useState("https://framesjs.org");
  const [currentFrameUrl, setCurrentFrameUrl] = useState(url);

  const farcasterSigner: FarcasterSigner = {
    fid: 1,
    status: "approved",
    publicKey: "0x00000000000000000000000000000000000000000000000000000000000000000",
    privateKey: "0x00000000000000000000000000000000000000000000000000000000000000000",
  };

  const loadFrame = () => setCurrentFrameUrl(url);

  // Use type 'any' for the entire signerState to bypass type checking
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
    homeframeUrl: currentFrameUrl,
    frameActionProxy: "/frames",
    frameGetProxy: "/frames",
    connectedAddress: undefined,
    frameContext: fallbackFrameContext,
    signerState,
  });

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-lg font-bold">Farcaster V1 Frame Loader</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter frame URL..."
        className="w-full p-2 border rounded my-2"
      />
      <button onClick={loadFrame} className="w-full p-2 bg-blue-500 text-white rounded">
        Load Frame
      </button>

      {/* Frame UI */}
      <FrameUI frameState={frameState} components={components} theme={theme} />
    </div>
  );
}