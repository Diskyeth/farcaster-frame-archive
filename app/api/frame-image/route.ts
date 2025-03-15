import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v1Url = searchParams.get("v1Url") || "https://framesjs.org";

  return NextResponse.redirect(v1Url); // Redirects to the V1 frame image
}
