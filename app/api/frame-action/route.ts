// app/api/frame-action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Parse the frame message
    const body = await req.json();
    
    // Log the frame data for debugging
    console.log('Frame action received:', body);
    
    // Get the most recent frames
    const result = await query(
      `SELECT id, name, creator_name FROM frames ORDER BY created_at DESC LIMIT 6`,
      []
    );
    
    const frames = result.rows;
    
    // Handle different states based on button presses
    const buttonIndex = body.untrustedData?.buttonIndex || 1;
    const inputText = body.untrustedData?.inputText || '';
    
    let responseFrames = frames;
    
    // If there's search input, filter the frames
    if (inputText) {
      // Search for frames
      const searchResult = await query(
        `SELECT id, name, creator_name 
         FROM frames 
         WHERE 
           name ILIKE $1 OR 
           creator_name ILIKE $1 
         ORDER BY created_at DESC 
         LIMIT 6`,
        [`%${inputText}%`]
      );
      
      responseFrames = searchResult.rows;
    }
    
    // Base URL for your site
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
    
    // Generate the frame response
    return NextResponse.json({
      frames: frames,
      frameMetadata: {
        buttons: responseFrames.map((frame, index) => ({
          label: frame.name,
          action: "link",
          target: `${baseUrl}/frame/${frame.id}`
        })).concat({
          label: "More Frames",
          action: "post"
        }),
        image: {
          url: `${baseUrl}/api/og?t=${Date.now()}`,
          aspectRatio: "1.91:1"
        },
        postUrl: `${baseUrl}/api/frame-action`,
        inputText: {
          label: "Search frames..."
        }
      }
    });
  } catch (error) {
    console.error('Error handling frame action:', error);
    return NextResponse.json(
      { error: 'Failed to handle frame action' },
      { status: 500 }
    );
  }
}