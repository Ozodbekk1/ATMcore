import { NextRequest, NextResponse } from 'next/server';
import { Alert } from '../../../../../models/Alert';
import connectToDatabase from '../../../../../lib/mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectToDatabase();

    const alert = await Alert.findByIdAndUpdate(
      id,
      { resolved: true },
      { new: true }
    );

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ data: alert });
  } catch (error: any) {
    console.error('Resolve Alert Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
