import { AtmTransaction } from '../models/AtmTransaction';
import connectToDatabase from '../lib/mongodb';
import { DateTime } from 'luxon';

export async function generateFeaturesForAtm(atmId: string) {
  await connectToDatabase();
  
  // Get last 30 days of transactions sorted descending
  const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate();
  
  const transactions = await AtmTransaction.find({ 
    atmId, 
    timestamp: { $gte: thirtyDaysAgo } 
  }).sort({ timestamp: -1 });

  if (transactions.length === 0) {
    return null;
  }

  let totalWithdrawal7 = 0;
  let totalWithdrawal14 = 0;
  let totalWithdrawal30 = 0;
  let days7 = 0;
  let days14 = 0;
  let days30 = 0;

  const now = DateTime.now();

  transactions.forEach((t) => {
    const tDate = DateTime.fromJSDate(t.timestamp);
    const diffDays = now.diff(tDate, 'days').days;
    
    totalWithdrawal30 += t.withdrawAmount;
    days30++;

    if (diffDays <= 14) {
      totalWithdrawal14 += t.withdrawAmount;
      days14++;
    }
    if (diffDays <= 7) {
      totalWithdrawal7 += t.withdrawAmount;
      days7++;
    }
  });

  const rollingAvg7 = days7 > 0 ? totalWithdrawal7 / days7 : 0;
  const rollingAvg14 = days14 > 0 ? totalWithdrawal14 / days14 : 0;
  const rollingAvg30 = days30 > 0 ? totalWithdrawal30 / days30 : 0;
  
  // Withdrawal velocity: ratio of 7-day avg to 30-day avg
  const withdrawalVelocity = rollingAvg30 > 0 ? rollingAvg7 / rollingAvg30 : 1;

  // Recent weekday vs weekend patterns
  const recentTx = transactions[0];
  const isWeekend = recentTx.dayOfWeek === 6 || recentTx.dayOfWeek === 7;

  return {
    atmId,
    rollingAvg7,
    rollingAvg14,
    rollingAvg30,
    withdrawalVelocity,
    isWeekend,
    isHoliday: recentTx.isHoliday,
    lastCashRemaining: recentTx.cashRemaining,
    lastRecordedAt: recentTx.timestamp
  };
}
