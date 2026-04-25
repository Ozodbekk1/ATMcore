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
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
