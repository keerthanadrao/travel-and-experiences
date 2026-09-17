import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized login required' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const subheading = formData.get('subheading') as string;
    const brief = formData.get('brief') as string;
    const body_rich_text = formData.get('body_rich_text') as string;
    const destination_id = formData.get('destination_id') as string;
    const location_id = formData.get('location_id') as string;
    const status = (formData.get('status') as string) || 'PUBLISHED';
    const experience_ids_json = formData.get('experience_ids') as string;
    const tags_raw = (formData.get('tags') as string) || '';

    if (!title || !subheading || !brief || !body_rich_text || !destination_id || !location_id) {
      return NextResponse.json({ error: 'Missing required journey fields' }, { status: 400 });
    }

    const experience_ids: string[] = experience_ids_json ? JSON.parse(experience_ids_json) : [];
    if (!experience_ids || experience_ids.length === 0) {
      return NextResponse.json({ error: 'Must select at least 1 approved experience tag' }, { status: 400 });
    }

    const db = await getDb();
    const journeyId = `journey-${Date.now()}`;

    await db.run(
      `INSERT INTO journeys (id, author_id, destination_id, location_id, title, subheading, brief, body_rich_text, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [journeyId, user.userId, destination_id, location_id, title, subheading, brief, body_rich_text, status]
    );

    // Map experiences
    for (const expId of experience_ids) {
      await db.run(`INSERT INTO journey_experiences (journey_id, experience_id) VALUES (?, ?)`, [journeyId, expId]);
    }

    // Map tags
    const tagsList = tags_raw.split(',').map(t => t.trim()).filter(Boolean);
    for (const tagStr of tagsList) {
      const tagSlug = tagStr.toLowerCase().replace(/\s+/g, '-');
      const tagId = `tag-${tagSlug}`;
      await db.run(`INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)`, [tagId, tagStr, tagSlug]);
      await db.run(`INSERT OR IGNORE INTO journey_tags (journey_id, tag_id) VALUES (?, ?)`, [journeyId, tagId]);
    }

    // Process media links/files
    const coverIndex = parseInt((formData.get('cover_index') as string) || '0');
    const image_urls_json = formData.get('image_urls') as string;
    const image_urls: string[] = image_urls_json ? JSON.parse(image_urls_json) : [];

    if (image_urls && image_urls.length > 0) {
      for (let i = 0; i < image_urls.length; i++) {
        const mediaId = `media-${Date.now()}-${i}`;
        const isCover = i === coverIndex ? 1 : 0;
        await db.run(
          `INSERT INTO media (id, journey_id, url, type, is_cover, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
          [mediaId, journeyId, image_urls[i], 'IMAGE', isCover, i]
        );
      }
    } else {
      // Fallback default nature cover if no file provided
      const defaultUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
      await db.run(
        `INSERT INTO media (id, journey_id, url, type, is_cover, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
        [`media-${Date.now()}-def`, journeyId, defaultUrl, 'IMAGE', 1, 0]
      );
    }

    return NextResponse.json({ message: 'Journey created successfully', journeyId }, { status: 201 });
  } catch (error: any) {
    console.error('Create Journey Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
