// app/api/tags/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log("Fetching tags from database...");
    const result = await query(
      `SELECT id, name, slug FROM tags ORDER BY name = 'All' DESC, name ASC`,
      []
    );
    
    console.log("Retrieved tags:", result.rows);
    return NextResponse.json({ tags: result.rows });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}