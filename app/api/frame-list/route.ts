// app/api/frame-list/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tagSlug = searchParams.get('tag') || 'all';
    
    console.log(`Filtering frames by tag: ${tagSlug}`);
    
    let sql = '';
    let params: any[] = [];
    
    if (tagSlug === 'all') {
      // Get all frames
      sql = `
        SELECT 
          f.id, 
          f.name, 
          f.creator_name, 
          f.creator_profile_url,
          f.url, 
          f.icon_url,
          f.created_at,
          f.description
        FROM frames f
        ORDER BY f.created_at DESC
      `;
    } else {
      // Get frames with specific tag
      sql = `
        SELECT 
          f.id, 
          f.name, 
          f.creator_name, 
          f.creator_profile_url,
          f.url, 
          f.icon_url,
          f.created_at,
          f.description
        FROM frames f
        JOIN frame_tags ft ON f.id = ft.frame_id
        JOIN tags t ON ft.tag_id = t.id
        WHERE t.slug = $1
        ORDER BY f.created_at DESC
      `;
      
      params = [tagSlug];
    }
    
    const result = await query(sql, params);
    console.log(`Found ${result.rows.length} frames for tag: ${tagSlug}`);
    
    return NextResponse.json({ frames: result.rows });
  } catch (error) {
    console.error('Error fetching frames:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frames' },
      { status: 500 }
    );
  }
}