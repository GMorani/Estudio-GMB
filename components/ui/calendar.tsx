"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onManualDateChange?: (date: Date) => void
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = es,
  onSelect,
  onManualDateChange,
  ...props
}: CalendarProps) {
  const [manualDate, setManualDate] = React.useState("")

  // Handle manual date input
  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")

    // Format with slashes
    if (value.length > 4) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8)
    } else if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2)
    }

    setManualDate(value)

    // Parse date if complete
    if (value.length === 10) {
      const parts = value.split("/")
      if (parts.length === 3) {
        const day = Number.parseInt(parts[0])
        const month = Number.parseInt(parts[1]) - 1
        const year = Number.parseInt(parts[2])

        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month, day)
          if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
            if (onSelect) onSelect(date)
            if (onManualDateChange) onManualDateChange(date)
          }
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        locale={locale}
        weekStartsOn={1}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: () => <span>←</span>,
          IconRight: () => <span>→</span>,
        }}
        onSelect={onSelect}
        {...props}
      />
      <div className="px-3 pb-3">
        <label className="block text-sm font-medium mb-1">Ingresar fecha manualmente (DD/MM/AAAA)</label>
        <Input
          value={manualDate}
          onChange={handleManualDateChange}
          placeholder="DD/MM/AAAA"
          maxLength={10}
          className="w-full"
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
