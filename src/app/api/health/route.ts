import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    // Use the admin command to ping the database and check the connection.
    await client.db('admin').command({ ping: 1 });
    return NextResponse.json({ status: 'ok', message: 'Database is connected' });
  } catch (e: any) {
    console.error('Database health check failed:', e);
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed', error: e.message },
      { status: 500 }
    );
  }
}
