
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeekView from '@/components/app/WeekView';
import { startOfWeek } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('day');
  const [weekTasks, setWeekTasks] = useState<Record<string, Task[]>>({});

  const { toast } = useToast();

  useEffect(() => {
    setSelectedDate(startOfDay(new Date()));
  }, []);

  const formattedDate = useMemo(() => {
    return selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  }, [selectedDate]);

  const weekStartDate = useMemo(() => {
    return selectedDate ? format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd') : null;
  }, [selectedDate]);

  const refetchDayTasks = useCallback(async () => {
    if (!formattedDate) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?date=${formattedDate}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
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
  }, [formattedDate, toast]);

  const refetchWeekTasks = useCallback(async () => {
    if (!weekStartDate) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/week?startOfWeek=${weekStartDate}`);
      if (!response.ok) throw new Error('Failed to fetch weekly tasks');
      const data = await response.json();
      setWeekTasks(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load weekly tasks. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [weekStartDate, toast]);

  const refetchCurrentView = useCallback(async () => {
    if (view === 'day') {
      await refetchDayTasks();
    } else if (view === 'week') {
      await refetchWeekTasks();
    }
  }, [view, refetchDayTasks, refetchWeekTasks]);
  
  useEffect(() => {
    if (view === 'day' && formattedDate) {
      refetchDayTasks();
    }
  }, [view, formattedDate, refetchDayTasks]);

  useEffect(() => {
    if (view === 'week' && weekStartDate) {
      refetchWeekTasks();
    }
  }, [view, weekStartDate, refetchWeekTasks]);


  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(startOfDay(date));
  }, []);

  const addTask = async (text: string, category: Task['category']) => {
    if (text.trim() === '' || !formattedDate) return;
    
    setIsDialogOpen(false);
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, date: formattedDate }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      
      await refetchCurrentView();

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleTask = useCallback(async (id: string, date: string) => {
     try {
      const taskToToggle = view === 'day'
        ? tasks.find(t => t._id === id)
        : weekTasks[date]?.find(t => t._id === id);

      if (!taskToToggle) return;

      const updatedCompletedState = !taskToToggle.completed;
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedCompletedState }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      await refetchCurrentView();

    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Failed to sync task update. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [tasks, view, weekTasks, refetchCurrentView, toast]);

  const deleteTask = useCallback(async (id: string, date: string) => {
    const originalTasks = tasks;
    const originalWeekTasks = weekTasks;

    // Optimistic update
    if (view === 'day') {
       setTasks(prev => prev.filter(t => t._id !== id));
    } else {
       setWeekTasks(prev => {
        const newDayTasks = (prev[date] || []).filter(t => t._id !== id);
        return {...prev, [date]: newDayTasks};
       });
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      // No refetch needed on success due to optimistic update
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      // Revert on failure
      if (view === 'day') {
        setTasks(originalTasks);
      } else {
        setWeekTasks(originalWeekTasks);
      }
    }
  }, [tasks, view, weekTasks, toast]);
  
  const toggleImportance = useCallback(async (id: string, date: string) => {
    try {
      const taskToToggle = view === 'day'
        ? tasks.find(t => t._id === id)
        : weekTasks[date]?.find(t => t._id === id);

      if (!taskToToggle) return;

      const updatedImportanceState = !taskToToggle.isImportant;
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isImportant: updatedImportanceState }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      await refetchCurrentView();

    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Failed to sync task update. Please check your connection.",
        variant: "destructive",
      });
    }
  }, [tasks, view, weekTasks, refetchCurrentView, toast]);

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
        await refetchCurrentView();
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

      <main className="flex flex-col flex-1 p-4 md:p-6 space-y-4 overflow-hidden">
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        <Tabs value={view} onValueChange={setView} className="w-full flex flex-col flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
          <TabsContent value="day" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
               <div className="pr-4 space-y-4">
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
                            date={formattedDate!}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onToggleImportance={toggleImportance}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="week" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="pr-4">
                <WeekView 
                  tasksByDay={weekTasks}
                  startDate={startOfWeek(selectedDate, { weekStartsOn: 1 })}
                  loading={loading}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onToggleImportance={toggleImportance}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
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
                What do you want to get done on {format(selectedDate, "MMM d")}?
              </DialogDescription>
            </DialogHeader>
            <AddTaskForm onAddTask={addTask} />
          </DialogContent>
        </Dialog>
      </footer>
    </div>
  );
}
