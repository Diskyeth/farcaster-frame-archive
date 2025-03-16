// app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

// Use the Node.js runtime instead of Edge
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Get the most recent frames for the preview
    const result = await query(
      `SELECT name, creator_name FROM frames ORDER BY created_at DESC LIMIT 3`,
      []
    );
    
    const frames = result.rows;
    
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom, #1e40af, #60a5fa)',
            color: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 50,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>
            Frame Archive
          </div>
          <div style={{ fontSize: 36, marginBottom: 40 }}>
            Browse and interact with Farcaster Frames
          </div>
          {frames.length > 0 && (
            <div style={{ fontSize: 24, opacity: 0.8 }}>
              Featured frames:
              {frames.map((frame, i) => (
                <div key={i} style={{ marginTop: 10 }}>
                  • {frame.name} by {frame.creator_name}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}