
"use client"

import { Button } from "@/components/ui/button"
import { CalendarDays, Copy } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AppHeaderProps {
  onMigrateTasks: () => void;
}

export default function AppHeader({ onMigrateTasks }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b shrink-0">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-8 h-8 text-primary" />
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
      </div>
    </header>
  )
}
