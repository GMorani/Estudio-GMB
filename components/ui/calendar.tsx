"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type CaptionProps } from "react-day-picker"
import { es } from "date-fns/locale"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onManualDateChange?: (date: Date) => void
}

function CustomCaption(props: CaptionProps) {
  const { displayMonth, onMonthChange } = props
  const [view, setView] = React.useState<"calendar" | "month" | "year">("calendar")

  // Generate months
  const months = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(displayMonth.getFullYear(), i, 1)),
    [displayMonth],
  )

  // Generate years (current year ± 10 years)
  const currentYear = displayMonth.getFullYear()
  const years = React.useMemo(() => Array.from({ length: 21 }, (_, i) => currentYear - 10 + i), [currentYear])

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(displayMonth)
    newDate.setMonth(monthIndex)
    onMonthChange(newDate)
    setView("calendar")
  }

  // Handle year selection
  const handleYearSelect = (year: number) => {
    const newDate = new Date(displayMonth)
    newDate.setFullYear(year)
    onMonthChange(newDate)
    setView("month")
  }

  // Render year selection view
  if (view === "year") {
    return (
      <div className="p-2">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(displayMonth)
              newDate.setFullYear(newDate.getFullYear() - 10)
              onMonthChange(newDate)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Años anteriores</span>
          </Button>
          <h2 className="text-sm font-medium">
            {years[0]} - {years[years.length - 1]}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(displayMonth)
              newDate.setFullYear(newDate.getFullYear() + 10)
              onMonthChange(newDate)
            }}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Años siguientes</span>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant={year === displayMonth.getFullYear() ? "default" : "outline"}
              className="h-9"
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // Render month selection view
  if (view === "month") {
    return (
      <div className="p-2">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={() => setView("year")}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Volver a años</span>
          </Button>
          <h2 className="text-sm font-medium cursor-pointer hover:underline" onClick={() => setView("year")}>
            {displayMonth.getFullYear()}
          </h2>
          <Button variant="ghost" size="sm" className="opacity-0" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={index}
              variant={index === displayMonth.getMonth() ? "default" : "outline"}
              className="h-9"
              onClick={() => handleMonthSelect(index)}
            >
              {format(month, "MMM", { locale: es })}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  // Default calendar view caption
  return (
    <div className="flex justify-center items-center gap-1">
      <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => setView("month")}>
        {format(displayMonth, "MMMM", { locale: es })}
      </Button>
      <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => setView("year")}>
        {displayMonth.getFullYear()}
      </Button>
    </div>
  )
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
        className={cn("p-4", className)}
        locale={locale}
        weekStartsOn={1} // Semana comienza en lunes
        components={{
          Caption: CustomCaption,
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
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
          table: "w-full border-collapse space-y-1",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] flex items-center justify-center",
          row: "flex w-full mt-2",
          cell: "text-center text-sm relative p-0 flex items-center justify-center h-9 w-9",
          day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal rounded-md aria-selected:opacity-100"),
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
