
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TaskCategory } from "@/types/task"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTaskFormProps {
  onAddTask: (text: string, category: TaskCategory) => void
}

const categories: TaskCategory[] = ['learn', 'code', 'chores', 'errands', 'other'];

export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [text, setText] = useState("")
  const [category, setCategory] = useState<TaskCategory>('learn')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() === '') return
    onAddTask(text, category)
    setText("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-4">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a new task..."
          className="h-11 md:col-span-2"
        />
        <Select onValueChange={(value: TaskCategory) => setCategory(value)} defaultValue={category}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full h-11">
        <Plus className="h-5 w-5 mr-2" />
        Add Task
      </Button>
    </form>
  )
}
