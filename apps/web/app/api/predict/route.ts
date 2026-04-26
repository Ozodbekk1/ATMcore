import { NextResponse } from 'next/server';
import { predictAtmCashDemand } from '../../../services/geminiAiService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { atmId } = body;

    if (!atmId) {
      return NextResponse.json({ error: 'atmId is required' }, { status: 400 });
    }

    const prediction = await predictAtmCashDemand(atmId);
    
    return NextResponse.json({ data: prediction });
  } catch (error: any) {
    console.error('Prediction Error:', error);
    const msg = error?.message || 'Internal Server Error';

    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'AI quota exceeded (free tier: 20 req/day). Try again later or upgrade the API key.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
