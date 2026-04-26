import { NextResponse } from 'next/server';
import { Atm } from '@/models/Atm';
import { AtmTransaction } from '@/models/AtmTransaction';
import connectToDatabase from '@/lib/mongodb';

export async function DELETE() {
    try {
        await connectToDatabase();

        const atmResult = await Atm.deleteMany({});
        const txnResult = await AtmTransaction.deleteMany({});

        return NextResponse.json({
            success: true,
            message: 'All ATM data cleared successfully',
            details: {
                atmsDeleted: atmResult.deletedCount,
                transactionsDeleted: txnResult.deletedCount,
            },
        });
    } catch (error: any) {
        console.error('Clear ATMs Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
