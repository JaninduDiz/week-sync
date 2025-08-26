
export type TaskCategory = 'learn' | 'code' | 'chores' | 'errands' | 'other';

export interface Task {
  _id?: string; // MongoDB's default ID is _id
  id?: string; // Kept for compatibility if used elsewhere
  text: string;
  completed: boolean;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  isImportant: boolean;
}
