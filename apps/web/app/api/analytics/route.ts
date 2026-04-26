import {
  getCachedReport,
  setCachedReport,
  clearAnalyticsCache,
  prepareAnalyticsData,
  getGeminiModel,
  generateFallbackReport,
} from '../../../services/analyticsService';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';

  // Regular load (no force): always return DB data, never call AI
  if (!force) {
    const cached = getCachedReport();
    if (cached) {
      return NextResponse.json({ data: cached, cached: true });
    }
    // No cache — generate DB-only report (no AI call)
    try {
      const report = await generateFallbackReport();
      return NextResponse.json({ data: report, cached: false });
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Failed to load analytics' }, { status: 500 });
    }
  }

  // Force = true: User clicked "Regenerate Report" → stream from AI
  clearAnalyticsCache();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, any>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {}
      };

      try {
        send({ type: 'status', message: 'Connecting to database...' });
        const { prompt, atmCount } = await prepareAnalyticsData();
        send({ type: 'status', message: `Analyzing ${atmCount} ATMs with AI...` });

        const model = getGeminiModel(true);
        const result = await model.generateContentStream(prompt);

        let fullText = '';
        for await (const chunk of result.stream) {
          const text = chunk.text();
          fullText += text;
          send({ type: 'chunk', text });
        }

        const report = JSON.parse(fullText);
        setCachedReport(report);
        send({ type: 'complete', data: report });
      } catch (error: any) {
        const errMsg = error?.message || 'AI analysis failed';
        console.error('Analytics Stream Error:', errMsg);
        send({ type: 'error', message: errMsg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
