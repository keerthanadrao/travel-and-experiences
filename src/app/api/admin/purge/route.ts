import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin authorization required' }, { status: 403 });
    }

    const { journeyId } = await req.json();
    if (!journeyId) {
      return NextResponse.json({ error: 'Journey ID required for purge' }, { status: 400 });
    }

    const db = await getDb();

    // Cascading purge execution across relational tables
    await db.run('DELETE FROM media WHERE journey_id = ?', [journeyId]);
    await db.run('DELETE FROM journey_likes WHERE journey_id = ?', [journeyId]);
    await db.run('DELETE FROM saved_journeys WHERE journey_id = ?', [journeyId]);
    await db.run('DELETE FROM journey_experiences WHERE journey_id = ?', [journeyId]);
    await db.run('DELETE FROM journey_tags WHERE journey_id = ?', [journeyId]);
    await db.run('DELETE FROM journeys WHERE id = ?', [journeyId]);

    return NextResponse.json({ message: `Journey ${journeyId} purged cleanly across platform feeds.` });
  } catch (error: any) {
    console.error('Admin Purge Error:', error);
    return NextResponse.json({ error: error.message || 'Purge failed' }, { status: 500 });
  }
}
