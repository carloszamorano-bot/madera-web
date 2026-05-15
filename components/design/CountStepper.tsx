'use client'

import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'

interface CountStepperProps {
  label: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export default function CountStepper({ label, value, min = 0, max = 10, onChange }: CountStepperProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          <Minus size={14} />
        </Button>
        <span className="w-6 text-center font-semibold text-gray-900">{value}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          <Plus size={14} />
        </Button>
      </div>
    </div>
  )
}
