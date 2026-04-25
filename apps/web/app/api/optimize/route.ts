import { NextResponse } from 'next/server';
import { optimizeRoutes } from '../../../services/optimizationService';

export async function POST() {
  try {
    const routes = await optimizeRoutes();
    return NextResponse.json({ data: routes });
  } catch (error: any) {
    console.error('Optimization Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
