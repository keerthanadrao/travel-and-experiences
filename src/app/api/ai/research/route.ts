import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Login required for AI research panel' }, { status: 401 });
    }

    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query prompt required' }, { status: 400 });
    }

    // Mock research output formatting
    const topic = query.trim();
    const facts = [
      `Historical Context: ${topic} has deep heritage roots dating back several centuries.`,
      `Key Highlights: Renowned for architectural landmarks, scenic photography spots, and tranquil nature trails.`,
      `Traveler Tip: Best visited during early morning or sunset hours to avoid heat and capture cinematic lighting.`
    ];

    const sources = [
      'Archaeological & Geographical Survey Records',
      'Regional Travel & Heritage Gazetteers'
    ];

    return NextResponse.json({
      query: topic,
      facts,
      sources,
      disclaimer: 'Research findings are provided as reference only and will not auto-insert into your published narrative.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'AI Research execution error' }, { status: 500 });
  }
}
