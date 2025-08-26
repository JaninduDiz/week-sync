
"use client"

import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Flag, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task, TaskCategory } from "@/types/task"

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onToggleImportance: (id: string) => void
}

const categoryColors: Record<TaskCategory, string> = {
  learn: "bg-blue-400",
  code: "bg-green-400",
  chores: "bg-yellow-400",
  errands: "bg-purple-400",
  other: "bg-gray-400",
};

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onToggleImportance,
}: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
        task.completed && "bg-secondary"
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-labelledby={`task-label-${task.id}`}
        className="w-5 h-5 rounded-full"
      />
      <div className="flex-1">
        <label
          id={`task-label-${task.id}`}
          htmlFor={`task-${task.id}`}
          className={cn(
            "font-medium transition-colors",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.text}
        </label>
        <div className="flex items-center gap-2 mt-1">
           <div className={cn("w-2 h-2 rounded-full", categoryColors[task.category])} />
           <p className="text-xs text-muted-foreground capitalize">{task.category}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onToggleImportance(task.id)}
        aria-label={task.isImportant ? "Unmark as important" : "Mark as important"}
      >
        <Flag className={cn("h-4 w-4 text-muted-foreground", task.isImportant && "fill-current text-primary")} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </motion.div>
  )
}
