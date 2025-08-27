
"use client"

import { useState, useMemo, memo, useEffect } from 'react'
import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  isToday,
  isSameDay,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WeeklyCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

function WeeklyCalendar({
  selectedDate,
  onDateSelect,
}: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(selectedDate, { weekStartsOn: 1 }))

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeek,
      end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
    })
  }, [currentWeek])
  
  // This ensures the calendar view syncs up if the selectedDate is changed from an external source
  // that falls outside the currently displayed week.
  useEffect(() => {
    const newCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
    if (!isSameDay(newCurrentWeek, currentWeek)) {
      setCurrentWeek(newCurrentWeek);
    }
  }, [selectedDate, currentWeek]);


  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }

  return (
    <div className="bg-card p-2 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-2 px-2">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek} aria-label="Previous week">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-semibold text-center">
          {format(currentWeek, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextWeek} aria-label="Next week">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
              {
                'bg-primary text-primary-foreground hover:bg-primary/90': isSameDay(day, selectedDate),
                'hover:bg-secondary': !isSameDay(day, selectedDate),
                'text-primary font-bold': isToday(day) && !isSameDay(day, selectedDate)
              }
            )}
          >
            <span className="text-xs uppercase tracking-wider opacity-70">
              {format(day, 'E')}
            </span>
            <span className="text-lg font-bold mt-1">
              {format(day, 'd')}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(WeeklyCalendar);
