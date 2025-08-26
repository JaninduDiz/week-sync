export type TaskCategory = 'learn' | 'code' | 'chores' | 'errands';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  isImportant: boolean;
}
