import { NextResponse } from 'next/server';
import { syncAtmDataFromSheets } from '../../../services/googleSheetsService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { spreadsheetId } = body;

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'spreadsheetId is required' }, { status: 400 });
    }

    const result = await syncAtmDataFromSheets(spreadsheetId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
