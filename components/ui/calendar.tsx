"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import { format, addMonths, subMonths } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
  const [currentMonth, setCurrentMonth] = React.useState<Date>(props.defaultMonth || new Date())

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

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1))
  }

  // Handle month change from month dropdown
  const handleMonthYearChange = (newMonth: Date) => {
    setCurrentMonth(newMonth)
  }

  // Custom caption component with month/year selectors
  const CustomCaption = ({ displayMonth }: { displayMonth: Date }) => {
    // Generate years array (current year ± 10 years)
    const currentYear = displayMonth.getFullYear()
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

    // Generate months array
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(displayMonth)
      date.setMonth(i)
      return { value: i, label: format(date, "MMMM", { locale: es }) }
    })

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newMonth = new Date(displayMonth)
      newMonth.setMonth(Number.parseInt(event.target.value))
      handleMonthYearChange(newMonth)
    }

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newMonth = new Date(displayMonth)
      newMonth.setFullYear(Number.parseInt(event.target.value))
      handleMonthYearChange(newMonth)
    }

    return (
      <div className="flex items-center justify-between w-full px-2">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToPreviousMonth} aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <select
            value={displayMonth.getMonth()}
            onChange={handleMonthChange}
            className="h-8 px-2 py-1 rounded border border-input bg-background text-sm"
            aria-label="Seleccionar mes"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            value={displayMonth.getFullYear()}
            onChange={handleYearChange}
            className="h-8 px-2 py-1 rounded border border-input bg-background text-sm"
            aria-label="Seleccionar año"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <Button variant="outline" size="icon" className="h-7 w-7" onClick={goToNextMonth} aria-label="Mes siguiente">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        locale={locale}
        weekStartsOn={1} // Semana comienza en lunes
        month={currentMonth}
        onMonthChange={handleMonthYearChange}
        captionLayout="buttons"
        components={{
          Caption: ({ displayMonth }) => <CustomCaption displayMonth={displayMonth} />,
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-sm font-medium hidden", // Hide default caption
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "grid grid-cols-7 w-full",
          head_cell: "text-muted-foreground text-center text-xs font-medium h-8 flex items-center justify-center",
          row: "grid grid-cols-7 w-full mt-1",
          cell: "text-center text-sm p-0 relative h-9 w-9 flex items-center justify-center focus-within:relative focus-within:z-20",
          day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
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
