import { NextResponse } from 'next/server';
import { Prediction } from '../../../../models/Prediction';
import connectToDatabase from '../../../../lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();

    // Get latest prediction per ATM
    const predictions = await Prediction.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$atmId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { riskScore: -1 } },
    ]);

    return NextResponse.json({ data: predictions });
  } catch (error: any) {
    console.error('Fetch All Predictions Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
