"use client"

import React, { useState } from "react"
import { DatePicker } from "@/components/ui/date-picker"

export default function DatePickerExample() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Date Picker Example</h1>
      <div className="max-w-sm">
        <DatePicker date={date} setDate={setDate} />
      </div>
      <div className="mt-6">
        <p className="text-muted-foreground">
          Selected date: {date ? date.toDateString() : "None"}
        </p>
      </div>
    </div>
  )
} 