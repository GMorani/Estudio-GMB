"use client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function DatePicker({ date, setDate, className, disabled, placeholder = "Seleccionar fecha" }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setOpen(false)
  }

  const handleManualDateChange = (selectedDate: Date) => {
    setDate(selectedDate)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 min-w-[320px]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          onManualDateChange={handleManualDateChange}
          initialFocus
          locale={es}
          showOutsideDays={true}
          className="border-none shadow-none p-1"
          captionLayout="dropdown-buttons"
          fromYear={1990}
          toYear={2050}
        />
      </PopoverContent>
    </Popover>
  )
}
