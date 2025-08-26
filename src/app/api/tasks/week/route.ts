import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import type { Task } from '@/types/task';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startOfWeekStr = searchParams.get('startOfWeek');

    if (!startOfWeekStr) {
      return NextResponse.json({ message: 'startOfWeek parameter is required' }, { status: 400 });
    }
    
    const weekStart = new Date(startOfWeekStr);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    const client = await clientPromise;
    const db = client.db();
    
    const tasks = await db.collection('tasks').find({
      date: {
        $gte: format(weekStart, 'yyyy-MM-dd'),
        $lte: format(weekEnd, 'yyyy-MM-dd'),
      }
    }).sort({ isImportant: -1, _id: 1 }).toArray();
    
    const tasksByDay: Record<string, Task[]> = {};
    tasks.forEach(task => {
        const date = task.date;
        if (!tasksByDay[date]) {
            tasksByDay[date] = [];
        }
        tasksByDay[date].push(task as Task);
    });

    return NextResponse.json(tasksByDay);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: 'Internal Server Error', error: e.message }, { status: 500 });
  }
}
