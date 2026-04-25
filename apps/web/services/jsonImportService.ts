import { Atm } from '../models/Atm';
import { AtmTransaction } from '../models/AtmTransaction';
import connectToDatabase from '../lib/mongodb';
import { DateTime } from 'luxon';

export async function importAtmJsonData(data: any) {
  try {
    await connectToDatabase();

    const { atms, transactions } = data;
    
    let importedAtms = 0;
    let importedTransactions = 0;

    // 1. Import ATMs
    if (atms && Array.isArray(atms) && atms.length > 0) {
      for (const atm of atms) {
        if (!atm.atmId) continue;
        
        await Atm.findOneAndUpdate(
          { atmId: atm.atmId },
          {
            location: { 
              lat: parseFloat(atm.lat || atm.location?.lat || 0), 
              lng: parseFloat(atm.lng || atm.location?.lng || 0) 
            },
            branch: atm.branch || 'Unknown',
            capacity: parseInt(atm.capacity, 10) || 0,
            currentCash: parseInt(atm.currentCash, 10) || 0,
            status: atm.status || 'ONLINE'
          },
          { upsert: true, new: true }
        );
        importedAtms++;
      }
    }

    // 2. Import Transactions
    if (transactions && Array.isArray(transactions) && transactions.length > 0) {
      const operations = transactions.map((row: any) => {
        const { atmId, timestamp, withdrawAmount, depositAmount, cashRemaining, isHoliday, period } = row;
        
        if (!atmId || !timestamp) return null;

        const date = new Date(timestamp);
        const dt = DateTime.fromJSDate(date);
        
        return {
          updateOne: {
            filter: { atmId, timestamp: date },
            update: {
              $set: {
                atmId,
                timestamp: date,
                withdrawAmount: parseFloat(withdrawAmount) || 0,
                depositAmount: parseFloat(depositAmount) || 0,
                cashRemaining: parseFloat(cashRemaining) || 0,
                isHoliday: isHoliday === true || isHoliday === 'TRUE' || isHoliday === '1',
                period: period || 'DAILY',
                weekOfYear: dt.weekNumber,
                month: dt.month,
                dayOfWeek: dt.weekday
              }
            },
            upsert: true
          }
        };
      }).filter((op) => op !== null) as any[]; 

      if (operations.length > 0) {
        await AtmTransaction.bulkWrite(operations, { ordered: false });
        importedTransactions = operations.length;
      }
    }

    return { 
      success: true, 
      message: 'Successfully imported JSON data', 
      details: { 
        atmsUpdated: importedAtms, 
        transactionsUpdated: importedTransactions 
      } 
    };
  } catch (error) {
    console.error('Error importing JSON data:', error);
    throw error;
  }
}
