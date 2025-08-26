
"use client";

import { useState, useMemo, useEffect } from 'react';
import { format, startOfDay, subDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import type { Task } from '@/types/task';
import AppHeader from '@/components/app/AppHeader';
import WeeklyCalendar from '@/components/app/WeeklyCalendar';
import ProgressTracker from '@/components/app/ProgressTracker';
import TaskList from '@/components/app/TaskList';
import AddTaskForm from '@/components/app/AddTaskForm';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedDate(startOfDay(new Date()));
  }, []);

  const formattedDate = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  }, [selectedDate]);

  useEffect(() => {
    if (!formattedDate) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tasks?date=${formattedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [formattedDate, toast]);


  const handleDateSelect = (date: Date) => {
    setSelectedDate(startOfDay(date));
  };

  const addTask = async (text: string, category: Task['category']) => {
    if (text.trim() === '' || !formattedDate) return;
    const optimisticTask: Task = {
      _id: new Date().toISOString(), // temporary id
      text,
      completed: false,
      category,
      date: formattedDate,
      isImportant: false,
    };

    setTasks(prev => [...prev, optimisticTask]);
    setIsDialogOpen(false);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, date: formattedDate }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const newTask = await response.json();
      setTasks(prev => prev.map(t => t._id === optimisticTask._id ? newTask : t));
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
      setTasks(prev => prev.filter(t => t._id !== optimisticTask._id));
    }
  };
  
  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    setTasks(tasks.map(t => t._id === id ? updatedTask : t));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');
    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Failed to sync task update. Please check your connection.",
        variant: "destructive",
      });
      // Revert optimistic update
      setTasks(tasks.map(t => t._id === id ? task : t));
    }
  };

  const deleteTask = async (id: string) => {
    const originalTasks = [...tasks];
    setTasks(tasks.filter(task => task._id !== id));
    
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      setTasks(originalTasks);
    }
  };
  
  const toggleImportance = async (id: string) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const updatedTask = { ...task, isImportant: !task.isImportant };
    setTasks(tasks.map(t => t._id === id ? updatedTask : t));

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isImportant: updatedTask.isImportant }),
      });
      if (!response.ok) throw new Error('Failed to update task');
    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Failed to sync task update. Please check your connection.",
        variant: "destructive",
      });
      setTasks(tasks.map(t => t._id === id ? task : t));
    }
  };

  const migrateTasks = async () => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      const response = await fetch('/api/tasks/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: yesterday, to: today }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Migration failed');

      if (data.migratedCount > 0) {
        if(formattedDate === today) {
            // Refetch tasks for today to show migrated ones
            const fetchResponse = await fetch(`/api/tasks?date=${formattedDate}`);
            const fetchedTasks = await fetchResponse.json();
            setTasks(fetchedTasks);
        }

        toast({
          title: "Tasks Migrated",
          description: `${data.migratedCount} incomplete task(s) from yesterday have been moved to today.`,
        });
      } else {
        toast({
          title: "No Tasks to Migrate",
          description: "There were no incomplete tasks from yesterday.",
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Migration Error",
        description: error.message || "Could not migrate tasks.",
        variant: "destructive"
      });
    }
  };

  if (!selectedDate) {
    return (
       <div className="flex flex-col h-dvh bg-background text-foreground">
        <AppHeader onMigrateTasks={() => {}} />
         <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <div className="p-2 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2 px-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-10 w-10" />
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-[72px] w-full" />
                    ))}
                </div>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <p>Daily Progress</p>
                              <p>0 / 0 completed</p>
                           </div>
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-[68px] w-full" />
                            <Skeleton className="h-[68px] w-full" />
                            <Skeleton className="h-[68px] w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </main>
         <footer className="p-4 border-t shrink-0 bg-background">
            <Skeleton className="h-12 w-full" />
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-background text-foreground">
      <AppHeader onMigrateTasks={migrateTasks} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        <Card className="overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
               <ProgressTracker tasks={tasks} />
                {loading ? (
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-[68px] w-full" />
                    <Skeleton className="h-[68px] w-full" />
                    <Skeleton className="h-[68px] w-full" />
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onToggleImportance={toggleImportance}
                  />
                )}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="p-4 border-t shrink-0 bg-background">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new task</DialogTitle>
              <DialogDescription>
                What do you want to get done?
              </DialogDescription>
            </DialogHeader>
            <AddTaskForm onAddTask={addTask} />
          </DialogContent>
        </Dialog>
      </footer>
    </div>
  );
}
