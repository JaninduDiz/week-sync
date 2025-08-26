"use client"

import { useState, type ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { suggestTasksAction } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PlusCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TaskCategory } from "@/types/task"

interface AiTaskSuggestionsProps {
  children: ReactNode;
  addSuggestedTasks: (tasks: string[], category: TaskCategory) => void;
}

export default function AiTaskSuggestions({ children, addSuggestedTasks }: AiTaskSuggestionsProps) {
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState<TaskCategory>('learn')
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt) return

    setIsLoading(true)
    setSuggestedTasks([])
    
    const result = await suggestTasksAction({ prompt });
    
    setIsLoading(false)
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
    } else {
      setSuggestedTasks(result.tasks);
    }
  }

  const handleAddTasks = () => {
    addSuggestedTasks(suggestedTasks, category);
    setSuggestedTasks([]);
    setPrompt("");
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>AI Task Suggestions</SheetTitle>
          <SheetDescription>
            Describe a goal or area of focus, and let AI generate task ideas for you.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="prompt">Prompt</Label>
            <Input
              id="prompt"
              type="text"
              placeholder="e.g., 'Learn React hooks'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>
           <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="category">Category</Label>
             <Select onValueChange={(value: TaskCategory) => setCategory(value)} defaultValue={category}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learn">Learn</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="chores">Chores</SelectItem>
                  <SelectItem value="errands">Errands</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <Button type="submit" disabled={isLoading || !prompt}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Tasks
          </Button>
        </form>

        {suggestedTasks.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Suggestions</h3>
            <ul className="space-y-2 rounded-md border p-2">
              {suggestedTasks.map((task, index) => (
                <li key={index} className="text-sm p-2 bg-secondary rounded-md">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        )}
        <SheetFooter className="mt-4">
            {suggestedTasks.length > 0 && (
                 <SheetClose asChild>
                    <Button onClick={handleAddTasks}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add all to my list
                    </Button>
                 </SheetClose>
            )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
