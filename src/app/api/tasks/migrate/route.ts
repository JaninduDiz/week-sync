import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { from, to } = await request.json();
    if (!from || !to) {
      return NextResponse.json({ message: 'Missing from or to date' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Do not migrate completed tasks
    const result = await db.collection('tasks').updateMany(
      { date: from, completed: false },
      { $set: { date: to } }
    );

    return NextResponse.json({ migratedCount: result.modifiedCount });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: 'Internal Server Error', error: e.message }, { status: 500 });
  }
}
