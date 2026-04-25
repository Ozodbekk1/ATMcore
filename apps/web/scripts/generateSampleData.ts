import connectToDatabase from '../lib/mongodb';
import { Atm } from '../models/Atm';
import { AtmTransaction } from '../models/AtmTransaction';
import { DateTime } from 'luxon';

const NUM_ATMS = 500;
const DAYS_HISTORY = 90;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

const BRANCHES = ['Downtown', 'Northside', 'West End', 'Airport', 'Mall Central'];

async function generateData() {
  console.log('Connecting to database...');
  await connectToDatabase();

  console.log('Clearing existing data...');
  await Atm.deleteMany({});
  await AtmTransaction.deleteMany({});

  console.log(`Generating ${NUM_ATMS} ATMs...`);
  const atms = [];
  
  for (let i = 1; i <= NUM_ATMS; i++) {
    const atmId = `ATM${String(i).padStart(4, '0')}`;
    const branch = BRANCHES[randomInt(0, BRANCHES.length - 1)];
    const capacity = randomInt(100000, 300000); // 100k to 300k
    
    // Most ATMs are nearly full when started
    const currentCash = Math.floor(capacity * randomFloat(0.5, 0.9));
    
    atms.push({
      atmId,
      location: {
        lat: randomFloat(34.0, 35.0, 6), // Sample coordinates
        lng: randomFloat(-118.0, -117.0, 6)
      },
      branch,
      capacity,
      currentCash,
      status: Math.random() > 0.05 ? 'ONLINE' : 'OFFLINE',
    });
  }

  await Atm.insertMany(atms);

  console.log(`Generating ${DAYS_HISTORY} days of transactions for ${NUM_ATMS} ATMs...`);
  
  // Bulk chunks for memory efficiency
  let transactions = [];
  const today = DateTime.now();
  
  // A few fixed holidays
  const holidays = [
    today.minus({ days: 15 }).toISODate(), // recent holiday
    today.minus({ days: 45 }).toISODate()  // older holiday
  ];

  for (const atm of atms) {
    let currentBalance = atm.capacity; // Assume started full 90 days ago

    for (let day = DAYS_HISTORY; day >= 1; day--) {
      const txDate = today.minus({ days: day });
      
      const isWeekend = txDate.weekday >= 6;
      const isHoliday = holidays.includes(txDate.toISODate());

      let baseWithdrawal = randomFloat(1000, 10000);
      
      // Spikes
      if (isWeekend) baseWithdrawal *= randomFloat(1.2, 1.8);
      if (isHoliday) baseWithdrawal *= randomFloat(1.5, 2.5);
      
      // Random anomalies
      if (Math.random() < 0.02) {
          baseWithdrawal *= 3; // Huge unexpected withdrawal event
      }

      currentBalance -= baseWithdrawal;

      // Restock triggered
      let depositAmount = 0;
      if (currentBalance < atm.capacity * 0.2) {
        depositAmount = atm.capacity - currentBalance;
        currentBalance = atm.capacity;
      }

      // Add to array
      transactions.push({
        atmId: atm.atmId,
        timestamp: txDate.toJSDate(),
        withdrawAmount: Number(baseWithdrawal.toFixed(2)),
        depositAmount: Number(depositAmount.toFixed(2)),
        cashRemaining: Number(currentBalance.toFixed(2)),
        isHoliday,
        period: 'DAILY',
        weekOfYear: txDate.weekNumber,
        month: txDate.month,
        dayOfWeek: txDate.weekday
      });
      
      if (transactions.length >= 10000) {
        await AtmTransaction.insertMany(transactions);
        transactions = [];
      }
    }
  }

  // Insert remainder
  if (transactions.length > 0) {
    await AtmTransaction.insertMany(transactions);
  }

  console.log('Sample Data Generation Complete!');
  process.exit(0);
}

generateData().catch(err => {
  console.error('Error in script', err);
  process.exit(1);
});
