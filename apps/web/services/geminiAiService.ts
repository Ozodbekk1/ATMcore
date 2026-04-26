import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateFeaturesForAtm } from './featureEngineeringService';
import { Atm } from '../models/Atm';
import { Prediction } from '../models/Prediction';
import connectToDatabase from '../lib/mongodb';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function predictAtmCashDemand(atmId: string) {
  try {
    await connectToDatabase();

    // 1. Gather context
    const atmInfo = await Atm.findOne({ atmId });
    if (!atmInfo) {
      throw new Error(`ATM ${atmId} not found`);
    }

    const features = await generateFeaturesForAtm(atmId);
    if (!features) {
      throw new Error(`Not enough data for ATM ${atmId}`);
    }

    // 2. Prepare Prompt
    const prompt = `
You are an expert system optimizing ATM cash flows. Analyze the following ATM profile and historical features to predict future cash demand and cash-out risk.
Ensure output is STRICTLY a valid JSON strictly adhering to the specified schema, without markdown blocks.

ATM Context:
- ID: ${atmId}
- Capacity: ${atmInfo.capacity}
- Current Cash: ${atmInfo.currentCash}
- Branch: ${atmInfo.branch}

Learned Features:
- 7-day rolling avg withdrawal: ${features.rollingAvg7}
- 14-day rolling avg withdrawal: ${features.rollingAvg14}
- 30-day rolling avg withdrawal: ${features.rollingAvg30}
- Withdrawal Velocity (7d / 30d): ${features.withdrawalVelocity}
- Is Weekend: ${features.isWeekend}
- Is Holiday: ${features.isHoliday}

Consider: Use deterministic calculations where reasonable (e.g., if current cash is less than the 7-day avg, risk is high and ETA is low).

Output JSON Schema:
{
  "predictedCashDemand": number, // Estimated amount needed for the next 7 days
  "riskScore": number, // 0-100 indicating risk of running out
  "etaToCashOutHours": number, // Estimated hours until cash runs out, based on current velocity
  "confidence": number // 0.0-1.0 AI confidence score
}
`;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);

    const textOutput = result.response.text();
    const parsedData = JSON.parse(textOutput);

    // 4. Save Prediction
    const prediction = new Prediction({
      atmId,
      predictedCashDemand: parsedData.predictedCashDemand,
      riskScore: parsedData.riskScore,
      confidence: parsedData.confidence,
      predictedTimeToCashout: parsedData.etaToCashOutHours,
      modelVersion: 'gemini-flash-latest',
      timestamp: new Date()
    });

    await prediction.save();

    return prediction;
  } catch (error) {
    console.error(`AI Prediction error for ${atmId}:`, error);
    throw error;
  }
}
