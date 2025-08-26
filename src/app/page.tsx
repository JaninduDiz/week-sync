"use client";

import { useState, useMemo } from 'react';
import { format, startOfDay, addDays, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Task } from '@/types/task';
import AppHeader from '@/components/app/AppHeader';
import WeeklyCalendar from '@/components/app/WeeklyCalendar';
import ProgressTracker from '@/components/app/ProgressTracker';
import TaskList from '@/components/app/TaskList';
import AddTaskForm from '@/components/app/AddTaskForm';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const { toast } = useToast();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(startOfDay(date));
  };

  const addTask = (text: string, category: Task['category']) => {
    if (text.trim() === '') return;
    const newTask: Task = {
      id: uuidv4(),
      text,
      completed: false,
      category,
      date: format(selectedDate, 'yyyy-MM-dd'),
      isImportant: false,
    };
    setTasks([...tasks, newTask]);
  };
  
  const toggleTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const toggleImportance = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, isImportant: !task.isImportant } : task
      )
    );
  };

  const migrateTasks = () => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    let migratedCount = 0;

    const updatedTasks = tasks.map(task => {
      if (task.date === yesterday && !task.completed) {
        migratedCount++;
        return { ...task, date: today };
      }
      return task;
    });

    if (migratedCount > 0) {
      setTasks(updatedTasks);
      toast({
        title: "Tasks Migrated",
        description: `${migratedCount} incomplete task(s) from yesterday have been moved to today.`,
      })
    } else {
       toast({
        title: "No Tasks to Migrate",
        description: "There were no incomplete tasks from yesterday.",
      })
    }
  };

  const filteredTasks = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return tasks.filter(task => task.date === dateStr);
  }, [tasks, selectedDate]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background text-foreground">
      <AppHeader onMigrateTasks={migrateTasks} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        <Card className="overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
               <ProgressTracker tasks={filteredTasks} />
               <TaskList
                 tasks={filteredTasks}
                 onToggle={toggleTask}
                 onDelete={deleteTask}
                 onToggleImportance={toggleImportance}
               />
               <AddTaskForm onAddTask={addTask} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
