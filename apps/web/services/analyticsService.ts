import { Atm } from '../models/Atm';
import { AtmTransaction } from '../models/AtmTransaction';
import connectToDatabase from '../lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DateTime } from 'luxon';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type AnalyticsChatResponse = { reply: string };

type NetworkAnalyticsReport = {
  daily_analysis: { top_high_usage_atms: any[]; cash_out_risk: any[]; underperforming_atms: any[]; anomalies: any[] };
  weekly_analysis: { top_atms: any[]; low_performing_atms: any[]; trend_summary: string };
  monthly_analysis: { growth_zones: any[]; declining_zones: any[]; expansion_opportunities: any[] };
  location_intelligence: { atm_id: string; status: 'KEEP' | 'MOVE' | 'REMOVE' | 'INCREASE_CAPACITY' | 'DECREASE_CAPACITY'; reason: string; confidence: number }[];
  event_analysis: { high_impact_events: any[]; holiday_effect: string; salary_day_effect: string };
  optimization_recommendations: { refill_strategy: string; cash_distribution_plan: string; logistics_cost_reduction: string };
  risk_analysis: { critical_atms: any[]; warning_atms: any[] };
  final_summary: string;
};

// =================== CACHING ===================
const CACHE_TTL_MS = 15 * 60 * 1000;
interface CacheEntry<T> { data: T; timestamp: number }
let analyticsCache: CacheEntry<NetworkAnalyticsReport> | null = null;

export function getCachedReport(): NetworkAnalyticsReport | null {
  if (analyticsCache && (Date.now() - analyticsCache.timestamp) < CACHE_TTL_MS) {
    return analyticsCache.data;
  }
  return null;
}

export function setCachedReport(data: NetworkAnalyticsReport): void {
  analyticsCache = { data, timestamp: Date.now() };
}

export function clearAnalyticsCache(): void {
  analyticsCache = null;
}

// =================== GEMINI ===================
export function getGeminiModel(json = false) {
  return genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    ...(json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
  });
}

// =================== DATA PREP ===================
export async function prepareAnalyticsData() {
  await connectToDatabase();
  const atms = await Atm.find({}).lean();
  const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate();

  const transactions = await AtmTransaction.aggregate([
    { $match: { timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: '$atmId',
        totalWithdrawals30d: { $sum: { $ifNull: ['$withdrawAmount', 0] } },
        totalDeposits30d: { $sum: { $ifNull: ['$depositAmount', 0] } },
        txnDays: { $sum: 1 },
        avgCashRemaining: { $avg: { $ifNull: ['$cashRemaining', 0] } },
        weekendTxns: { $sum: { $cond: [{ $in: ['$dayOfWeek', [6, 7]] }, 1, 0] } },
        holidayTxns: { $sum: { $cond: ['$isHoliday', 1, 0] } },
      },
    },
    { $sort: { totalWithdrawals30d: -1 } },
  ]);

  const topPerformers = transactions.slice(0, 10);
  const bottomPerformers = transactions.slice(-10);

  const prompt = `
You are a senior financial data scientist and ATM optimization expert.

ATM Network Size: ${atms.length}

Top 10 ATMs:
${JSON.stringify(topPerformers, null, 2)}

Bottom 10 ATMs:
${JSON.stringify(bottomPerformers, null, 2)}

Return STRICT valid JSON with actionable business intelligence.
`;

  return { prompt, atmCount: atms.length };
}

// =================== CHAT ===================
export async function chatWithAnalytics(message: string): Promise<AnalyticsChatResponse> {
  try {
    await connectToDatabase();
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate();
    const atms = await Atm.find({}).select('_id location status cashCapacity').lean();

    const transactions = await AtmTransaction.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$atmId',
          totalWithdrawals30d: { $sum: { $ifNull: ['$withdrawAmount', 0] } },
          totalDeposits30d: { $sum: { $ifNull: ['$depositAmount', 0] } },
          avgCashRemaining: { $avg: { $ifNull: ['$cashRemaining', 0] } },
          txnCount: { $sum: 1 },
        },
      },
      { $sort: { totalWithdrawals30d: -1 } },
      { $limit: 20 },
    ]);

    const prompt = `
You are a senior ATM banking analytics AI assistant.

Network overview:
- Total ATMs: ${atms.length}
- Top transaction data:
${JSON.stringify(transactions, null, 2)}

User question:
${message}

Provide a clear professional business answer.
Focus on:
- ATM usage insights
- refill risks
- anomalies
- optimization opportunities
- business recommendations
`;

    const model = getGeminiModel(false);
    const result = await model.generateContent(prompt);
    return { reply: result.response.text() };
  } catch (error) {
    console.error('chatWithAnalytics Error:', error);
    throw error;
  }
}

// =================== DB-ONLY FALLBACK REPORT ===================
export async function generateFallbackReport() {
  await connectToDatabase();
  const atms = await Atm.find({}).lean();
  const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate();

  const transactions = await AtmTransaction.aggregate([
    { $match: { timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: '$atmId',
        totalWithdrawals30d: { $sum: { $ifNull: ['$withdrawAmount', 0] } },
        totalDeposits30d: { $sum: { $ifNull: ['$depositAmount', 0] } },
        txnDays: { $sum: 1 },
        avgCashRemaining: { $avg: { $ifNull: ['$cashRemaining', 0] } },
      },
    },
    { $sort: { totalWithdrawals30d: -1 } },
  ]);

  const topPerformers = transactions.slice(0, 5);
  const bottomPerformers = transactions.slice(-5);
  const cashOutRisk = transactions.filter((t: any) => t.avgCashRemaining < 50000 && t.totalWithdrawals30d > 0).slice(0, 5);
  const criticalAtms = transactions.filter((t: any) => t.avgCashRemaining < 30000 && t.totalWithdrawals30d > 100000).slice(0, 5)
    .map((t: any) => ({ atm_id: t._id, risk: 'HIGH', reason: `Low avg cash (${Math.round(t.avgCashRemaining).toLocaleString()}) with high withdrawals (${Math.round(t.totalWithdrawals30d).toLocaleString()})` }));
  const warningAtms = transactions.filter((t: any) => t.avgCashRemaining < 100000 && t.avgCashRemaining >= 30000 && t.totalWithdrawals30d > 50000).slice(0, 5)
    .map((t: any) => ({ atm_id: t._id, reason: `Moderate cash (${Math.round(t.avgCashRemaining).toLocaleString()}) with significant withdrawals` }));

  const onlineCount = atms.filter((a: any) => a.status === 'ONLINE').length;
  const offlineCount = atms.filter((a: any) => a.status === 'OFFLINE').length;
  const maintenanceCount = atms.filter((a: any) => a.status === 'MAINTENANCE').length;
  const totalWithdrawals = transactions.reduce((s: number, t: any) => s + t.totalWithdrawals30d, 0);
  const totalDeposits = transactions.reduce((s: number, t: any) => s + t.totalDeposits30d, 0);

  const report = {
    daily_analysis: {
      top_high_usage_atms: topPerformers.map((t: any) => ({ atm_id: t._id, withdrawals: Math.round(t.totalWithdrawals30d), deposits: Math.round(t.totalDeposits30d), avg_cash: Math.round(t.avgCashRemaining) })),
      cash_out_risk: cashOutRisk.map((t: any) => ({ atm_id: t._id, avg_cash_remaining: Math.round(t.avgCashRemaining), daily_withdrawal_rate: Math.round(t.totalWithdrawals30d / 30) })),
      underperforming_atms: bottomPerformers.map((t: any) => ({ atm_id: t._id, withdrawals: Math.round(t.totalWithdrawals30d), transaction_days: t.txnDays })),
      anomalies: [],
    },
    weekly_analysis: {
      top_atms: topPerformers.map((t: any) => ({ atm_id: t._id, volume: Math.round(t.totalWithdrawals30d) })),
      low_performing_atms: bottomPerformers.map((t: any) => ({ atm_id: t._id, reason: `Low volume: ${Math.round(t.totalWithdrawals30d).toLocaleString()}` })),
      trend_summary: `Network: ${atms.length} ATMs (${onlineCount} online, ${offlineCount} offline, ${maintenanceCount} maintenance). 30-day: ${Math.round(totalWithdrawals).toLocaleString()} withdrawals, ${Math.round(totalDeposits).toLocaleString()} deposits. ${cashOutRisk.length} ATM(s) at cash-out risk.`,
    },
    monthly_analysis: { growth_zones: [], declining_zones: [], expansion_opportunities: [] },
    location_intelligence: [] as any[],
    event_analysis: { high_impact_events: [], holiday_effect: 'Data from database only — AI analysis unavailable.', salary_day_effect: 'Data from database only — AI analysis unavailable.' },
    optimization_recommendations: {
      refill_strategy: `Prioritize ${cashOutRisk.length} cash-out risk ATMs. Network daily avg withdrawal: ${Math.round(totalWithdrawals / 30).toLocaleString()}.`,
      cash_distribution_plan: `Redistribute from ${bottomPerformers.length} low-volume ATMs to ${topPerformers.length} high-demand ATMs.`,
      logistics_cost_reduction: `${offlineCount} ATM(s) offline — investigate. Consolidate refill routes for efficiency.`,
    },
    risk_analysis: { critical_atms: criticalAtms, warning_atms: warningAtms },
    final_summary: `[Database Report] ${atms.length} ATMs — ${onlineCount} online, ${offlineCount} offline, ${maintenanceCount} maintenance. 30-day: ${Math.round(totalWithdrawals).toLocaleString()} withdrawals, ${Math.round(totalDeposits).toLocaleString()} deposits. ${criticalAtms.length} critical, ${warningAtms.length} warnings. AI analysis unavailable (quota exceeded) — click "Regenerate Report" when quota resets for full AI insights.`,
  };

  setCachedReport(report);
  return report;
}

// =================== FULL REPORT (tries AI, falls back to DB) ===================
export async function generateNetworkAnalyticsReport() {
  const cached = getCachedReport();
  if (cached) return cached;

  try {
    const { prompt } = await prepareAnalyticsData();
    const model = getGeminiModel(true);
    const result = await model.generateContent(prompt);
    const report = JSON.parse(result.response.text());
    setCachedReport(report);
    return report;
  } catch {
    return generateFallbackReport();
  }
}