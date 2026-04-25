import { Atm } from '../models/Atm';
import { AtmTransaction } from '../models/AtmTransaction';
import connectToDatabase from '../lib/mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DateTime } from 'luxon';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

type AnalyticsChatResponse = {
  reply: string;
};

type NetworkAnalyticsReport = {
  daily_analysis: {
    top_high_usage_atms: any[];
    cash_out_risk: any[];
    underperforming_atms: any[];
    anomalies: any[];
  };
  weekly_analysis: {
    top_atms: any[];
    low_performing_atms: any[];
    trend_summary: string;
  };
  monthly_analysis: {
    growth_zones: any[];
    declining_zones: any[];
    expansion_opportunities: any[];
  };
  location_intelligence: {
    atm_id: string;
    status:
      | 'KEEP'
      | 'MOVE'
      | 'REMOVE'
      | 'INCREASE_CAPACITY'
      | 'DECREASE_CAPACITY';
    reason: string;
    confidence: number;
  }[];
  event_analysis: {
    high_impact_events: any[];
    holiday_effect: string;
    salary_day_effect: string;
  };
  optimization_recommendations: {
    refill_strategy: string;
    cash_distribution_plan: string;
    logistics_cost_reduction: string;
  };
  risk_analysis: {
    critical_atms: any[];
    warning_atms: any[];
  };
  final_summary: string;
};

function getGeminiModel(json = false) {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    ...(json
      ? {
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }
      : {}),
  });
}

export async function chatWithAnalytics(
  message: string
): Promise<AnalyticsChatResponse> {
  try {
    await connectToDatabase();

    const thirtyDaysAgo = DateTime.now()
      .minus({ days: 30 })
      .toJSDate();

    const atms = await Atm.find({})
      .select('_id location status cashCapacity')
      .lean();

    const transactions = await AtmTransaction.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$atmId',
          totalWithdrawals30d: {
            $sum: { $ifNull: ['$withdrawAmount', 0] },
          },
          totalDeposits30d: {
            $sum: { $ifNull: ['$depositAmount', 0] },
          },
          avgCashRemaining: {
            $avg: { $ifNull: ['$cashRemaining', 0] },
          },
          txnCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalWithdrawals30d: -1,
        },
      },
      {
        $limit: 20,
      },
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

    const text = result.response.text();

    return {
      reply: text,
    };
  } catch (error) {
    console.error('chatWithAnalytics Error:', error);
    throw error;
  }
}

export async function generateNetworkAnalyticsReport(): Promise<NetworkAnalyticsReport> {
  try {
    await connectToDatabase();

    const atms = await Atm.find({}).lean();

    const thirtyDaysAgo = DateTime.now()
      .minus({ days: 30 })
      .toJSDate();

    const transactions = await AtmTransaction.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$atmId',
          totalWithdrawals30d: {
            $sum: { $ifNull: ['$withdrawAmount', 0] },
          },
          totalDeposits30d: {
            $sum: { $ifNull: ['$depositAmount', 0] },
          },
          txnDays: { $sum: 1 },
          avgCashRemaining: {
            $avg: { $ifNull: ['$cashRemaining', 0] },
          },
          weekendTxns: {
            $sum: {
              $cond: [
                { $in: ['$dayOfWeek', [6, 7]] },
                1,
                0,
              ],
            },
          },
          holidayTxns: {
            $sum: {
              $cond: ['$isHoliday', 1, 0],
            },
          },
        },
      },
      {
        $sort: {
          totalWithdrawals30d: -1,
        },
      },
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

    const model = getGeminiModel(true);

    const result = await model.generateContent(prompt);

    const textOutput = result.response.text();

    return JSON.parse(textOutput);
  } catch (error) {
    console.error('generateNetworkAnalyticsReport Error:', error);
    throw error;
  }
}