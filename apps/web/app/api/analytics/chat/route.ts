import { chatWithAnalytics } from '@/services/analyticsService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const reply = await chatWithAnalytics(message);
    
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Analytics Chat Error:', error);
    const msg = error?.message || 'Internal Server Error';

    // Friendly message for quota errors
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'AI quota exceeded (free tier: 20 requests/day). Please try again later or upgrade the API key.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
