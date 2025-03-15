import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Query to get a specific frame by id
      const result = await client.query(
        `SELECT 
          id, 
          name, 
          creator_name, 
          url, 
          icon_url
        FROM frames
        WHERE id = $1`,
        [id]
      );
      
      // Check if we found the frame
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Frame not found' },
          { status: 404 }
        );
      }
      
      // Return the frame as JSON
      return NextResponse.json({ frame: result.rows[0] });
    } finally {
      // Make sure to release the client
      client.release();
    }
  } catch (error) {
    console.error('Error fetching frame:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frame' },
      { status: 500 }
    );
  }
}