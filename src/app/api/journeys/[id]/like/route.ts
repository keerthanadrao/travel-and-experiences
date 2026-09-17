import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const journeyId = params.id;
    const db = await getDb();

    const existing = await db.get(
      'SELECT 1 FROM journey_likes WHERE user_id = ? AND journey_id = ?',
      [user.userId, journeyId]
    );

    let isLiked = false;
    if (existing) {
      await db.run('DELETE FROM journey_likes WHERE user_id = ? AND journey_id = ?', [user.userId, journeyId]);
      isLiked = false;
    } else {
      await db.run('INSERT INTO journey_likes (user_id, journey_id) VALUES (?, ?)', [user.userId, journeyId]);
      isLiked = true;
    }

    const likesCount = (await db.get('SELECT COUNT(*) as count FROM journey_likes WHERE journey_id = ?', [journeyId]))?.count || 0;

    return NextResponse.json({ isLiked, likesCount });
  } catch (error: any) {
    return NextResponse.json({ error: 'Like toggle failed' }, { status: 500 });
  }
}
