"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface WiserLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "icon-only"
}

export default function WiserLogo({ className, size = "md", variant = "default" }: WiserLogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
  }

  // Only show icon if not mounted yet (to prevent hydration mismatch)
  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10",
          sizeClasses[size],
          size === "sm" ? "w-6" : size === "md" ? "w-8" : "w-10",
          className,
        )}
      >
        <span
          className={cn(
            "text-primary font-semibold",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
          )}
        >
          w
        </span>
      </div>
    )
  }

  const isDark = theme === "dark"

  if (variant === "icon-only") {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br",
          isDark ? "from-blue-500 to-indigo-600" : "from-blue-400 to-indigo-500",
          sizeClasses[size],
          size === "sm" ? "w-6" : size === "md" ? "w-8" : "w-10",
          className,
        )}
      >
        <span
          className={cn(
            "text-white font-semibold",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
          )}
        >
          w
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br",
          isDark ? "from-blue-500 to-indigo-600" : "from-blue-400 to-indigo-500",
          sizeClasses[size],
          size === "sm" ? "w-6" : size === "md" ? "w-8" : "w-10",
        )}
      >
        <span
          className={cn(
            "text-white font-semibold",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base",
          )}
        >
          w
        </span>
      </div>
      <span
        className={cn(
          "font-semibold tracking-tight",
          size === "sm" ? "text-sm" : size === "md" ? "text-lg" : "text-xl",
          isDark ? "text-white" : "text-gray-900",
        )}
      >
        wiser
      </span>
    </div>
  )
}

