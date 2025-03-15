import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v1Url = searchParams.get("v1Url") || "https://framesjs.org"; // Default V1 frame

  return NextResponse.json({
    type: "frame",
    version: "v2",
    image: `https://yourdomain.com/api/frame-image?v1Url=${encodeURIComponent(v1Url)}`,
    buttons: [
      { label: "Load Another V1 Frame", action: "post" },
      { label: "Visit V1 Frame", action: "link", target: v1Url },
    ],
    post_url: "https://yourdomain.com/api/frame",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const v1Url = body.input || "https://framesjs.org"; // Use input from user

  return NextResponse.json({
    type: "frame",
    version: "v2",
    image: `https://yourdomain.com/api/frame-image?v1Url=${encodeURIComponent(v1Url)}`,
    buttons: [
      { label: "Load Another V1 Frame", action: "post" },
      { label: "Visit V1 Frame", action: "link", target: v1Url },
    ],
    post_url: "https://yourdomain.com/api/frame",
  });
}
