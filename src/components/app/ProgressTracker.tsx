"use client"

import { Progress } from "@/components/ui/progress"
import type { Task } from "@/types/task"

interface ProgressTrackerProps {
  tasks: Task[]
}

export default function ProgressTracker({ tasks }: ProgressTrackerProps) {
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-sm text-muted-foreground">
          <p>Daily Progress</p>
          <p>{completedTasks} / {totalTasks} completed</p>
       </div>
      <Progress value={progress} aria-label={`${Math.round(progress)}% of tasks complete`}/>
    </div>
  )
}
