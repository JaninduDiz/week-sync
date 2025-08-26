"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskCategory } from "@/types/task"

interface AddTaskFormProps {
  onAddTask: (text: string, category: TaskCategory) => void
}

const categories: TaskCategory[] = ['learn', 'code', 'chores', 'errands'];

export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [text, setText] = useState("")
  const [category, setCategory] = useState<TaskCategory>('learn')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddTask(text, category)
    setText("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
      <div className="flex gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            type="button"
            variant={category === cat ? "default" : "secondary"}
            size="sm"
            onClick={() => setCategory(cat)}
            className="capitalize flex-1"
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="flex w-full items-center gap-2">
        <Input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a new task..."
          className="h-11"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Add task">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}
