"use client"

import TaskItem from "./TaskItem"
import type { Task } from "@/types/task"

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleImportance: (id: string) => void
}

export default function TaskList({
  tasks,
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
    // Fallback to sorting by _id, maybe creation time if available
    return (a._id || '').localeCompare(b._id || '');
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onToggleImportance={onToggleImportance}
        />
      ))}
    </div>
  )
}
