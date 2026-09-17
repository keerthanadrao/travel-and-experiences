import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getChildLocationIds } from '@/lib/location';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.get('q')?.trim() || '';
    const experienceSlug = searchParams.get('exp')?.trim() || '';

    const db = await getDb();

    let matchingLocationIds: string[] = [];
    if (queryStr) {
      // Find matching location nodes
      const locations = await db.all(
        `SELECT id FROM locations WHERE name LIKE ? OR slug LIKE ?`,
        [`%${queryStr}%`, `%${queryStr}%`]
      );
      
      for (const loc of locations) {
        const childIds = await getChildLocationIds(loc.id);
        matchingLocationIds.push(...childIds);
      }
    }

    let sql = `
      SELECT DISTINCT j.id, j.title, j.subheading, j.brief, j.views_count, j.created_at,
             u.name as author_name, u.username as author_username,
             d.name as destination_name, d.slug as destination_slug,
             l.name as location_name,
             (SELECT url FROM media WHERE journey_id = j.id ORDER BY is_cover DESC, order_index ASC LIMIT 1) as cover_image_url,
             (SELECT COUNT(*) FROM journey_likes WHERE journey_id = j.id) as likes_count
      FROM journeys j
      JOIN users u ON j.author_id = u.id
      JOIN destinations d ON j.destination_id = d.id
      JOIN locations l ON j.location_id = l.id
      LEFT JOIN journey_experiences je ON j.id = je.journey_id
      LEFT JOIN experiences e ON je.experience_id = e.id
      LEFT JOIN journey_tags jt ON j.id = jt.journey_id
      LEFT JOIN tags t ON jt.tag_id = t.id
      WHERE j.status = 'PUBLISHED'
    `;

    const params: any[] = [];

    if (queryStr) {
      if (matchingLocationIds.length > 0) {
        const placeholders = matchingLocationIds.map(() => '?').join(',');
        sql += ` AND (j.location_id IN (${placeholders}) OR d.name LIKE ? OR j.title LIKE ? OR t.name LIKE ?)`;
        params.push(...matchingLocationIds, `%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`);
      } else {
        sql += ` AND (d.name LIKE ? OR j.title LIKE ? OR t.name LIKE ? OR u.name LIKE ?)`;
        params.push(`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`);
      }
    }

    if (experienceSlug) {
      sql += ` AND e.slug = ?`;
      params.push(experienceSlug);
    }

    sql += ` ORDER BY j.created_at DESC`;

    const journeys = await db.all(sql, params);

    return NextResponse.json({ query: queryStr, experience: experienceSlug, count: journeys.length, journeys });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: error.message || 'Search execution failed' }, { status: 500 });
  }
}
