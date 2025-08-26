import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import type { Task } from '@/types/task';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ message: 'Date parameter is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const tasks = await db.collection('tasks').find({ date }).sort({ isImportant: -1, _id: 1 }).toArray();
    
    return NextResponse.json(tasks);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: 'Internal Server Error', error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const taskData: Omit<Task, '_id'> = await request.json();

    const newTask: Omit<Task, '_id'> = {
      text: taskData.text,
      completed: false,
      category: taskData.category,
      date: taskData.date,
      isImportant: false,
    };

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('tasks').insertOne(newTask);
    
    const insertedTask = {
      _id: result.insertedId.toString(),
      ...newTask
    }

    return NextResponse.json(insertedTask, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: 'Internal Server Error', error: e.message }, { status: 500 });
  }
}
