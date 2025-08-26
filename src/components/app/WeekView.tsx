"use client"

import { format, addDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "@/types/task"
import TaskItem from "./TaskItem"
import { Skeleton } from '../ui/skeleton'

interface WeekViewProps {
  tasksByDay: Record<string, Task[]>;
  startDate: Date;
  loading: boolean;
  onToggleTask: (id: string, date: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleImportance: (id: string, date: string) => void;
}

export default function WeekView({ tasksByDay, startDate, loading, onToggleTask, onDeleteTask, onToggleImportance }: WeekViewProps) {
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {days.map(day => (
          <Card key={day.toString()} className="flex flex-col">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                <span>{format(day, 'EEE')}</span>
                <span className="text-xs font-normal text-muted-foreground">{format(day, 'MMM d')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 flex-1">
               <Skeleton className="h-[68px] w-full" />
               <Skeleton className="h-[68px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 items-start">
      {days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const tasks = tasksByDay[dateKey] || [];
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            if (a.isImportant !== b.isImportant) {
              return a.isImportant ? -1 : 1;
            }
            return (a._id || '').localeCompare(b._id || '');
          });

        return (
          <Card key={dateKey} className="flex flex-col h-full">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                <span>{format(day, 'EEE')}</span>
                <span className="text-xs font-normal text-muted-foreground">{format(day, 'MMM d')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 flex-1">
              {sortedTasks.length > 0 ? (
                sortedTasks.map(task => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggle={(id) => onToggleTask(id, dateKey)}
                    onDelete={onDeleteTask}
                    onToggleImportance={(id) => onToggleImportance(id, dateKey)}
                  />
                ))
              ) : (
                <div className="text-center text-xs text-muted-foreground py-4 h-full flex items-center justify-center">
                  <p>No tasks.</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
