"use client"

// Re-export SimpleDatePicker as DatePicker for backward compatibility
import { SimpleDatePicker } from "./simple-date-picker"

export type { SimpleDatePickerProps as DatePickerProps } from "./simple-date-picker"
export const DatePicker = SimpleDatePicker
