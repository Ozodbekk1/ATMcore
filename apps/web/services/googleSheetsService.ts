import { google } from 'googleapis';
import { Atm } from '../models/Atm';
import { AtmTransaction } from '../models/AtmTransaction';
import connectToDatabase from '../lib/mongodb';
import { DateTime } from 'luxon';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Using a service account or API key
export async function getGoogleSheetsClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable');
  }

  const keys = JSON.parse(credentials);
  const client = new google.auth.JWT(
    keys.client_email,
    undefined,
    keys.private_key,
    SCOPES
  );

  await client.authorize();
  return google.sheets({ version: 'v4', auth: client });
}

export async function syncAtmDataFromSheets(spreadsheetId: string) {
  try {
    await connectToDatabase();
    const sheets = await getGoogleSheetsClient();

    // 1. Fetch ATM Registry
    const registryResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'ATM_Registry!A2:F', // Assuming headers in row 1
    });

    const registryRows = registryResponse.data.values;
    if (registryRows && registryRows.length > 0) {
      for (const row of registryRows) {
        // Expected columns: atmId, lat, lng, branch, capacity, currentCash
        const [atmId, lat, lng, branch, capacity, currentCash] = row;
        
        await Atm.findOneAndUpdate(
          { atmId },
          {
            location: { lat: parseFloat(lat), lng: parseFloat(lng) },
            branch,
            capacity: parseInt(capacity, 10),
            currentCash: parseInt(currentCash, 10),
            status: 'ONLINE' // Defaulting to ONLINE on sync
          },
          { upsert: true, new: true }
        );
      }
    }

    // 2. Fetch ATM Transactions
    const transactionResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Transactions!A2:G', // Expected: atmId, timestamp, withdrawAmount, depositAmount, cashRemaining, isHoliday, period
    });

    const transactionRows = transactionResponse.data.values;
    if (transactionRows && transactionRows.length > 0) {
      const operations = transactionRows.map((row) => {
        const [atmId, timestamp, withdrawAmount, depositAmount, cashRemaining, isHoliday, period] = row;
        
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
                isHoliday: isHoliday === 'TRUE' || isHoliday === '1',
                period: period || 'DAILY',
                weekOfYear: dt.weekNumber,
                month: dt.month,
                dayOfWeek: dt.weekday
              }
            },
            upsert: true
          }
        };
      });

      // Batch write with bulkWrite
      if (operations.length > 0) {
        await AtmTransaction.bulkWrite(operations, { ordered: false });
      }
    }

    return { success: true, message: 'Successfully synced data from Google Sheets' };
  } catch (error) {
    console.error('Error syncing data from Google Sheets:', error);
    throw error;
  }
}
