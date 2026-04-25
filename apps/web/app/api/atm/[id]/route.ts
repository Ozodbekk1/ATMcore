import { NextRequest, NextResponse } from 'next/server';
import { Atm } from '../../../../models/Atm';
import connectToDatabase from '../../../../lib/mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const atm = await Atm.findOne({ atmId: id }).lean();

    if (!atm) {
      return NextResponse.json({ error: 'ATM not found' }, { status: 404 });
    }

    return NextResponse.json({ data: atm });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Get ATM Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
