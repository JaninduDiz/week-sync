"use client"

import WeekSyncLogo from "./WeekSyncLogo"
import AiTaskSuggestions from "./AiTaskSuggestions"
import { Button } from "@/components/ui/button"
import { Copy, Sparkles } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Task } from "@/types/task"

interface AppHeaderProps {
  onMigrateTasks: () => void;
  addSuggestedTasks: (tasks: string[], category: Task['category']) => void;
}

export default function AppHeader({ onMigrateTasks, addSuggestedTasks }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b shrink-0">
      <div className="flex items-center gap-2">
        <WeekSyncLogo />
        <h1 className="text-xl font-semibold tracking-tight">WeekSync</h1>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onMigrateTasks} aria-label="Migrate yesterday's tasks">
                <Copy className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Migrate incomplete tasks from yesterday</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AiTaskSuggestions addSuggestedTasks={addSuggestedTasks}>
           <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Get AI task suggestions">
                        <Sparkles className="w-5 h-5 text-accent-foreground" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get AI task suggestions</p>
                </TooltipContent>
             </Tooltip>
           </TooltipProvider>
        </AiTaskSuggestions>
      </div>
    </header>
  )
}
