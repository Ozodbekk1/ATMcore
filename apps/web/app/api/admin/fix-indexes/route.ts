import { NextResponse } from 'next/server';
import { Atm } from '@/models/Atm';
import connectToDatabase from '@/lib/mongodb';

// One-time migration: drop stale indexes from previous schema versions
export async function POST() {
    try {
        await connectToDatabase();

        const collection = Atm.collection;
        const indexes = await collection.indexes();

        const staleIndexNames = indexes
            .filter((idx: any) => {
                const keys = Object.keys(idx.key);
                // Drop indexes for fields that don't exist in current schema
                const validFields = ['_id', 'atmId', 'createdAt', 'updatedAt'];
                return keys.some((k: string) => !validFields.includes(k) && k !== 'location.lat' && k !== 'location.lng');
            })
            .map((idx: any) => idx.name)
            .filter((name: string) => name !== '_id_'); // never drop _id index

        const dropped: string[] = [];
        for (const name of staleIndexNames) {
            try {
                await collection.dropIndex(name);
                dropped.push(name);
            } catch (e: any) {
                // Index might not exist, skip
            }
        }

        // Ensure current schema indexes exist
        await Atm.syncIndexes();

        return NextResponse.json({
            success: true,
            message: `Dropped ${dropped.length} stale index(es) and synced current indexes`,
            droppedIndexes: dropped,
        });
    } catch (error: any) {
        console.error('Fix Indexes Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
