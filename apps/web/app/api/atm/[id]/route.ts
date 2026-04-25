import { NextResponse } from 'next/server';
import { Atm } from '../../../../models/Atm';
import connectToDatabase from '../../../../lib/mongodb';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await connectToDatabase();

    const atm = await Atm.findOne({ atmId: id }).lean();

    if (!atm) {
      return NextResponse.json({ error: 'ATM not found' }, { status: 404 });
    }

    return NextResponse.json({ data: atm });
  } catch (error: any) {
    console.error('Get ATM Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
