import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import { Log } from '../../../models/Log';

// GET /api/logs
// Fetch system execution logs
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level');
    
    let query: any = {};
    if (level) {
        query.level = level;
    }

    const logs = await Log.find(query).sort({ timestamp: -1 }).limit(limit).lean();
    
    return NextResponse.json({ data: logs });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/logs
// Create a new log entry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { level, message, source, metadata } = body;

    if (!level || !message) {
      return NextResponse.json({ error: 'Level and message are required' }, { status: 400 });
    }

    await connectToDatabase();

    const log = new Log({
      level,
      message,
      source,
      metadata,
      timestamp: new Date()
    });

    await log.save();
    
    return NextResponse.json({ data: log }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating log:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
