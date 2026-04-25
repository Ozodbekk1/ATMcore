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
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
