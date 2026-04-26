import { NextResponse } from 'next/server';
import { Atm } from '../../../../models/Atm';
import { AtmTransaction } from '../../../../models/AtmTransaction';
import { Alert } from '../../../../models/Alert';
import { Log } from '../../../../models/Log';
import connectToDatabase from '../../../../lib/mongodb';

const uzbekistanAtms = [
  { atmId: 'ATM-TAS-001', branch: 'Tashkent Hub - Yunusobod', lat: 41.3111, lng: 69.2797, capacity: 500000, currentCash: 425000 },
  { atmId: 'ATM-TAS-002', branch: 'Tashkent Hub - Chilonzor 9-kv', lat: 41.2756, lng: 69.1848, capacity: 400000, currentCash: 60000 },
  { atmId: 'ATM-TAS-003', branch: 'Tashkent Hub - Mirzo Ulugbek', lat: 41.3394, lng: 69.3346, capacity: 400000, currentCash: 20000 },
  { atmId: 'ATM-TAS-004', branch: "Tashkent Hub - Sirg'ali 7A", lat: 41.2267, lng: 69.2259, capacity: 350000, currentCash: 308000 },
  { atmId: 'ATM-FER-001', branch: "Fergana Node - Marg'ilon Markaz", lat: 40.4680, lng: 71.7180, capacity: 300000, currentCash: 180000 },
  { atmId: 'ATM-FER-002', branch: "Fergana Node - Qo'qon Avtoshow", lat: 40.5310, lng: 70.9380, capacity: 300000, currentCash: 135000 },
  { atmId: 'ATM-FER-003', branch: "Fergana Node - Farg'ona City", lat: 40.3864, lng: 71.7864, capacity: 350000, currentCash: 283500 },
  { atmId: 'ATM-SAM-001', branch: 'Samarkand Core - Registon Maydoni', lat: 39.6542, lng: 66.9597, capacity: 400000, currentCash: 80000 },
  { atmId: 'ATM-SAM-002', branch: 'Samarkand Core - Siyob Bozori', lat: 39.6615, lng: 66.9639, capacity: 350000, currentCash: 35000 },
  { atmId: 'ATM-SAM-003', branch: "Samarkand Core - So'g'diyona Makro", lat: 39.6270, lng: 66.9749, capacity: 300000, currentCash: 165000 },
  { atmId: 'ATM-BUX-001', branch: 'Bukhara Point - Labi Hovuz', lat: 39.7740, lng: 64.4230, capacity: 300000, currentCash: 195000 },
  { atmId: 'ATM-BUX-002', branch: 'Bukhara Point - Buxoro Vokzal', lat: 39.7681, lng: 64.4556, capacity: 300000, currentCash: 234000 },
  { atmId: 'ATM-NUK-001', branch: 'Nukus Terminal - Markaziy Box', lat: 42.4630, lng: 59.6037, capacity: 250000, currentCash: 7500 },
  { atmId: 'ATM-NUK-002', branch: 'Nukus Terminal - Amudaryo Mahalla', lat: 42.4608, lng: 59.6105, capacity: 250000, currentCash: 17500 },
  { atmId: 'ATM-TER-001', branch: 'Termez Gateway - City Mall', lat: 37.2275, lng: 67.2770, capacity: 300000, currentCash: 264000 },
  { atmId: 'ATM-TER-002', branch: 'Termez Gateway - Aeroport', lat: 37.2242, lng: 67.2783, capacity: 300000, currentCash: 276000 },
  { atmId: 'ATM-NAV-001', branch: 'Navoi Vault - Bozor Hududi', lat: 40.0844, lng: 65.3792, capacity: 300000, currentCash: 150000 },
  { atmId: 'ATM-NAV-002', branch: 'Navoi Vault - Navoi AZS', lat: 40.1030, lng: 65.3501, capacity: 300000, currentCash: 255000 },
  { atmId: 'ATM-AND-001', branch: 'Andijan Link - Jahon Bozori', lat: 40.7821, lng: 72.3442, capacity: 350000, currentCash: 262500 },
  { atmId: 'ATM-AND-002', branch: 'Andijan Link - Eski Shahar', lat: 40.8154, lng: 72.2837, capacity: 350000, currentCash: 287000 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Create ATMs
    for (const atm of uzbekistanAtms) {
      await Atm.findOneAndUpdate(
        { atmId: atm.atmId },
        {
          atmId: atm.atmId,
          branch: atm.branch,
          location: { lat: atm.lat, lng: atm.lng },
          capacity: atm.capacity,
          currentCash: atm.currentCash,
          status: atm.currentCash < atm.capacity * 0.05 ? 'MAINTENANCE' : 'ONLINE',
        },
        { upsert: true, new: true }
      );
    }

    // 2. Generate transactions for last 30 days
    const now = new Date();
    let txnCount = 0;
    for (const atm of uzbekistanAtms) {
      // Check if transactions already exist
      const existingCount = await AtmTransaction.countDocuments({ atmId: atm.atmId });
      if (existingCount > 10) continue;

      for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
        const date = new Date(now);
        date.setDate(date.getDate() - dayOffset);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const month = date.getMonth() + 1;

        // Get week of year
        const start = new Date(date.getFullYear(), 0, 1);
        const diff = date.getTime() - start.getTime();
        const weekOfYear = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);

        const withdrawBase = isWeekend ? randomInt(30000, 80000) : randomInt(15000, 50000);
        const depositBase = randomInt(5000, 20000);
        const cashRemaining = Math.max(0, atm.currentCash - withdrawBase + depositBase + randomInt(-10000, 10000));

        await AtmTransaction.create({
          atmId: atm.atmId,
          timestamp: date,
          withdrawAmount: withdrawBase,
          depositAmount: depositBase,
          cashRemaining,
          isHoliday: false,
          period: 'DAILY',
          weekOfYear,
          month,
          dayOfWeek,
        });
        txnCount++;
      }
    }

    // 3. Generate alerts
    const alertSamples = [
      { atmId: 'ATM-NUK-001', severity: 'CRITICAL', message: 'Cash level critically low (3%). Immediate refill required.' },
      { atmId: 'ATM-NUK-002', severity: 'HIGH', message: 'Cash level below 10%. Schedule urgent refill.' },
      { atmId: 'ATM-TAS-003', severity: 'CRITICAL', message: 'Cash level at 5%. ATM may run out within hours.' },
      { atmId: 'ATM-TAS-002', severity: 'HIGH', message: 'Cash level at 15%. Refill recommended within 24 hours.' },
      { atmId: 'ATM-SAM-002', severity: 'CRITICAL', message: 'Cash at 10%. High withdrawal velocity detected.' },
      { atmId: 'ATM-SAM-001', severity: 'HIGH', message: 'Cash level at 20%. Weekend approaching.' },
      { atmId: 'ATM-TAS-001', severity: 'LOW', message: 'Routine maintenance check completed successfully.' },
      { atmId: 'ATM-FER-001', severity: 'MEDIUM', message: 'Receipt printer paper running low. Replace within 48 hours.' },
      { atmId: 'ATM-BUX-001', severity: 'MEDIUM', message: 'Network latency spike detected (450ms). Monitoring.' },
      { atmId: 'ATM-AND-001', severity: 'LOW', message: 'Software update applied. All systems nominal.' },
    ];

    const existingAlerts = await Alert.countDocuments({});
    if (existingAlerts < 5) {
      for (const alert of alertSamples) {
        const date = new Date(now);
        date.setMinutes(date.getMinutes() - randomInt(5, 720));
        await Alert.create({
          ...alert,
          triggeredAt: date,
          resolved: alert.severity === 'LOW',
        });
      }
    }

    // 4. Generate logs
    const logSamples = [
      { level: 'AUTH', message: "Validated signature for 'admin@atm.uz'", source: 'auth-service' },
      { level: 'NODE', message: 'Admin executed bypass cache on Route Alpha', source: 'node-manager' },
      { level: 'WARN', message: 'High latency detected on socket connection (512ms)', source: 'ws-monitor' },
      { level: 'CRIT', message: "Unhandled route conflict in 'Nukus Terminal' dispatch", source: 'route-engine' },
      { level: 'AUTH', message: "'super@atm.uz' engaged root shell privileges", source: 'auth-service' },
      { level: 'SYNC', message: 'Database replication confirmed on standby shard', source: 'db-sync' },
      { level: 'INFO', message: 'Cash prediction model v2.5 initialized successfully', source: 'ai-engine' },
      { level: 'WARN', message: 'ATM-SAM-002 approaching cash depletion threshold', source: 'cash-monitor' },
      { level: 'INFO', message: 'Route optimization completed - 3 routes generated', source: 'route-engine' },
      { level: 'ERROR', message: 'Failed to connect to external payment gateway. Retry scheduled.', source: 'payment-service' },
    ];

    const existingLogs = await Log.countDocuments({});
    if (existingLogs < 5) {
      for (const log of logSamples) {
        const date = new Date(now);
        date.setMinutes(date.getMinutes() - randomInt(1, 1440));
        await Log.create({
          ...log,
          timestamp: date,
        });
      }
    }

    return NextResponse.json({
      message: 'Test data generated successfully',
      counts: {
        atms: uzbekistanAtms.length,
        transactions: txnCount,
        alerts: alertSamples.length,
        logs: logSamples.length,
      }
    });
  } catch (error: any) {
    console.error('Generate Data Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
