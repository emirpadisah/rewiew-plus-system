import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  text?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2
        className={cn("animate-spin text-primary", sizeMap[size])}
        aria-label="Loading"
        role="status"
      />
      {text && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingSpinner({ className, size = "md" }: Omit<LoadingProps, "text">) {
  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeMap[size], className)}
      aria-label="Loading"
      role="status"
    />
  )
}

export function LoadingPage() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Loading size="lg" text="Yükleniyor..." />
    </div>
  )
}

