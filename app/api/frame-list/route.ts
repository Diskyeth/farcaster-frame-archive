// app/api/frame-list/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Query to get all frames with necessary information
    const result = await query(`
      SELECT 
        id, 
        name, 
        creator_name, 
        creator_profile_url,
        url, 
        icon_url,
        created_at
      FROM frames
      ORDER BY created_at DESC
    `, []);
    
    // Return the frames as JSON
    return NextResponse.json({ frames: result.rows });
  } catch (error) {
    console.error('Error fetching frames:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frames' },
      { status: 500 }
    );
  }
}