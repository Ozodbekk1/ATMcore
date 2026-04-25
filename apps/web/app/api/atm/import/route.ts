import { NextResponse } from 'next/server';
import { importAtmJsonData } from '../../../services/jsonImportService';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || (!body.atms && !body.transactions)) {
      return NextResponse.json({ error: 'Invalid JSON payload. Expected { atms: [], transactions: [] }' }, { status: 400 });
    }

    const result = await importAtmJsonData(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('JSON Import Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
