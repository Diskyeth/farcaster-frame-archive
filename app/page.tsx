import { Metadata } from "next";
import FrameList from "@/components/FrameList";  // We'll create this component

const appUrl = process.env.NEXT_PUBLIC_URL || "https://www.legacyframes.xyz";

const frame = {
  version: "1.0.0",
  imageUrl: `https://www.legacyframes.xyz/banner.png`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Legacy Frames Archive",
      url: `https://www.legacyframes.xyz/`,
      splashImageUrl: `https://www.legacyframes.xyz/icon.png`,
      splashBackgroundColor: "#10001D",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Legacy Frames Archive",
    description: "To preserve and enjoy V1 Frames",
    openGraph: {
      title: "Legacy Frames Archive",
      description: "To preserve and enjoy V1 Frames",
      images: [{ url: `https://www.legacyframes.xyz/banner.png` }],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <FrameList />;
}