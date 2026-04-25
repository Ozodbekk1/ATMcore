import { NextResponse } from 'next/server';
import { generateNetworkAnalyticsReport } from '../../../services/analyticsService';

export async function GET() {
  try {
    const report = await generateNetworkAnalyticsReport();
    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
