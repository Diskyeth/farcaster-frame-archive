// app/api/frame-action/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Parse the frame message
    const body = await req.json();
    
    // Log the frame data for debugging
    console.log('Frame action received:', body);
    
    // Get search input text if available
    const inputText = body.untrustedData?.inputText || '';
    
    // Query to search for frames
    const queryString = inputText 
      ? `SELECT id, name, creator_name FROM frames 
         WHERE name ILIKE $1 OR creator_name ILIKE $1
         ORDER BY created_at DESC LIMIT 6`
      : `SELECT id, name, creator_name FROM frames 
         ORDER BY created_at DESC LIMIT 6`;
    
    const queryParams = inputText ? [`%${inputText}%`] : [];
    
    // Execute the database query
    const result = await query(queryString, queryParams);
    const frames = result.rows;
    
    // Base URL for your site
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';
    
    // Generate the frame response with buttons
    // Using separate button arrays with different types
    const frameButtons = frames.map((frame) => ({
      label: frame.name,
      action: "link" as const,
      target: `${baseUrl}/frame/${frame.id}`
    }));
    
    const moreButton = frames.length === 6 ? [{
      label: "More Frames",
      action: "post" as const,
      target: `${baseUrl}/api/frame-action` // Add a target even for post buttons
    }] : [];
    
    // Combine the arrays
    const allButtons = [...frameButtons, ...moreButton];
    
    // Generate the frame response
    return NextResponse.json({
      frames: frames,
      frameMetadata: {
        buttons: allButtons,
        image: {
          url: `${baseUrl}/api/og?t=${Date.now()}${inputText ? `&q=${encodeURIComponent(inputText)}` : ''}`,
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