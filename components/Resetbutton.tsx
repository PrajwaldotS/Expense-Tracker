'use client'

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

type Props = {
  onReset: () => void
  label?: string
  className?: string
}

export default function FormResetButton({
  onReset,
  label = "Reset",
  className = ""
}: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onReset}
      className={`flex items-center gap-2 ${className}`}
    >
      <RotateCcw size={16} />
      {label}
    </Button>
  )
}
