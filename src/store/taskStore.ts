
import { create } from 'zustand';
import type { Task, TaskCategory } from '@/types/task';
import { toast } from '@/hooks/use-toast';

interface TaskState {
  tasks: Task[];
  weekTasks: Record<string, Task[]>;
  loading: boolean;
  fetchDayTasks: (date: string) => Promise<void>;
  fetchWeekTasks: (startDate: string) => Promise<void>;
  addTask: (text: string, category: TaskCategory, date: string) => Promise<void>;
  toggleTask: (id: string, date: string) => Promise<void>;
  deleteTask: (id: string, date: string) => Promise<void>;
  toggleImportance: (id: string, date: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  weekTasks: {},
  loading: false,

  fetchDayTasks: async (date) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/tasks?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      set({ tasks: data, loading: false });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load tasks.",
        variant: "destructive",
      });
      set({ loading: false });
    }
  },

  fetchWeekTasks: async (startDate) => {
    set({ loading: true });
    try {
      const response = await fetch(`/api/tasks/week?startOfWeek=${startDate}`);
      if (!response.ok) throw new Error('Failed to fetch weekly tasks');
      const data = await response.json();
      set({ weekTasks: data, loading: false });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load weekly tasks.",
        variant: "destructive",
      });
      set({ loading: false });
    }
  },

  addTask: async (text, category, date) => {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      _id: tempId,
      text,
      category,
      date,
      completed: false,
      isImportant: false,
    };

    // Optimistic update for day view
    set(state => ({
      tasks: [...state.tasks, newTask]
    }));

    // Optimistic update for week view
    set(state => {
        const newWeekTasks = { ...state.weekTasks };
        if (!newWeekTasks[date]) {
            newWeekTasks[date] = [];
        }
        newWeekTasks[date].push(newTask);
        return { weekTasks: newWeekTasks };
    });

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category, date }),
      });

      if (!response.ok) throw new Error('Failed to add task');
      
      const savedTask = await response.json();
      
      // Replace temporary task with real one from server
      set(state => ({
        tasks: state.tasks.map(t => t._id === tempId ? savedTask : t)
      }));
      set(state => {
        const newWeekTasks = { ...state.weekTasks };
        if(newWeekTasks[date]){
            newWeekTasks[date] = newWeekTasks[date].map(t => t._id === tempId ? savedTask : t);
        }
        return { weekTasks: newWeekTasks };
      });
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== tempId)
      }));
      set(state => {
        const newWeekTasks = { ...state.weekTasks };
        if(newWeekTasks[date]){
            newWeekTasks[date] = newWeekTasks[date].filter(t => t._id !== tempId);
        }
        return { weekTasks: newWeekTasks };
      });
    }
  },

  toggleTask: async (id: string, date: string) => {
    const originalState = get();

    const updateState = (task: Task) => ({ ...task, completed: !task.completed });

    // Optimistic update
    set(state => ({
        tasks: state.tasks.map(t => t._id === id ? updateState(t) : t),
        weekTasks: {
            ...state.weekTasks,
            [date]: (state.weekTasks[date] || []).map(t => t._id === id ? updateState(t) : t)
        }
    }));
    
    try {
        const taskToToggle = originalState.tasks.find(t => t._id === id) || originalState.weekTasks[date]?.find(t => t._id === id);
        if (!taskToToggle) return;

        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !taskToToggle.completed }),
        });
        if (!response.ok) throw new Error('Failed to update task');
    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Failed to sync task. Reverting.",
            variant: "destructive",
        });
        // Revert on failure
        set(originalState);
    }
  },
  
  deleteTask: async (id: string, date: string) => {
    const originalState = get();
    
    // Optimistic update
    set(state => ({
        tasks: state.tasks.filter(t => t._id !== id),
        weekTasks: {
            ...state.weekTasks,
            [date]: (state.weekTasks[date] || []).filter(t => t._id !== id)
        }
    }));

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete task. Reverting.",
        variant: "destructive",
      });
      // Revert on failure
      set(originalState);
    }
  },

  toggleImportance: async (id: string, date: string) => {
    const originalState = get();
    const updateState = (task: Task) => ({ ...task, isImportant: !task.isImportant });

    // Optimistic update
    set(state => ({
        tasks: state.tasks.map(t => t._id === id ? updateState(t) : t),
        weekTasks: {
            ...state.weekTasks,
            [date]: (state.weekTasks[date] || []).map(t => t._id === id ? updateState(t) : t)
        }
    }));

    try {
        const taskToToggle = originalState.tasks.find(t => t._id === id) || originalState.weekTasks[date]?.find(t => t._id === id);
        if (!taskToToggle) return;
        
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isImportant: !taskToToggle.isImportant }),
        });

        if (!response.ok) throw new Error('Failed to update task');
    } catch (error) {
       console.error(error);
       toast({
        title: "Error",
        description: "Failed to sync task update. Reverting.",
        variant: "destructive",
      });
      set(originalState);
    }
  },
}));
