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
      'SELECT 1 FROM saved_journeys WHERE user_id = ? AND journey_id = ?',
      [user.userId, journeyId]
    );

    let isSaved = false;
    if (existing) {
      await db.run('DELETE FROM saved_journeys WHERE user_id = ? AND journey_id = ?', [user.userId, journeyId]);
      isSaved = false;
    } else {
      await db.run('INSERT INTO saved_journeys (user_id, journey_id) VALUES (?, ?)', [user.userId, journeyId]);
      isSaved = true;
    }

    return NextResponse.json({ isSaved });
  } catch (error: any) {
    return NextResponse.json({ error: 'Save toggle failed' }, { status: 500 });
  }
}
