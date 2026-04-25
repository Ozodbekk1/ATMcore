import { NextResponse } from 'next/server';
// import { Atm } from '../../../models/Atm';
// import connectToDatabase from '../../../lib/mongodb';
import { Atm } from '@/models/Atm';
import connectToDatabase from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const atms = await Atm.find({}).skip(skip).limit(limit).lean();
    const total = await Atm.countDocuments({});

    return NextResponse.json({
      data: atms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('List ATMs Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
