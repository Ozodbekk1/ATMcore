import { NextResponse } from 'next/server';
import { Alert } from '../../../models/Alert';
import connectToDatabase from '../../../lib/mongodb';
import { emitAlert } from '../../../services/websocketService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get('resolved');
    
    await connectToDatabase();
    
    let query = {};
    if (resolved !== null) {
        query = { resolved: resolved === 'true' };
    }

    const alerts = await Alert.find(query).sort({ triggeredAt: -1 }).limit(100).lean();

    return NextResponse.json({ data: alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { atmId, severity, message } = body;

        if (!atmId || !severity || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await connectToDatabase();
        
        const alert = new Alert({
            atmId,
            severity,
            message
        });

        await alert.save();
        
        // Emit via ws if setup
        emitAlert(atmId, severity, message);

        return NextResponse.json({ data: alert }, { status: 201 });
    } catch(err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
