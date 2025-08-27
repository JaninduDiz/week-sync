
"use client"

import TaskItem from "./TaskItem"
import type { Task } from "@/types/task"

interface TaskListProps {
  tasks: Task[]
  date: string;
  onToggle: (id: string, date: string) => void
  onDelete: (id: string, date: string) => void
  onToggleImportance: (id: string, date: string) => void
}

export default function TaskList({
  tasks,
  date,
  onToggle,
  onDelete,
  onToggleImportance,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p className="text-lg">No tasks for this day.</p>
        <p>Add a new task or enjoy your free time!</p>
      </div>
    )
  }

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
    <div className="space-y-2">
      {sortedTasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={(id) => onToggle(id, date)}
          onDelete={(id) => onDelete(id, date)}
          onToggleImportance={(id) => onToggleImportance(id, date)}
        />
      ))}
    </div>
  )
}
