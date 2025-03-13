"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface EnhancedTypingIndicatorProps {
  className?: string
  variant?: "default" | "minimal" | "dots" | "modern"
}

export default function EnhancedTypingIndicator({ className, variant = "modern" }: EnhancedTypingIndicatorProps) {
  const [dots, setDots] = useState(1)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev < 3 ? prev + 1 : 1))
    }, 500)
    
    // Add timer to track elapsed time
    const startTime = Date.now()
    const timerInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    
    return () => {
      clearInterval(dotsInterval)
      clearInterval(timerInterval)
    }
  }, [])

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds < 5) return ""; // Don't show time for quick responses
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-400/70 rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center p-2", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400/70 rounded-full"
              animate={{
                y: [0, -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.6,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === "modern") {
    return (
      <div className={cn("flex items-center gap-3 p-2", className)}>
        <motion.div
          className="relative w-6 h-6 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Loader2 className="h-5 w-5 text-blue-400" />
        </motion.div>
        <motion.div
          className="text-sm font-medium text-muted-foreground flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="mr-1">
            Thinking
            {elapsedTime > 5 && (
              <span className="text-xs ml-1 opacity-70">({formatTime(elapsedTime)})</span>
            )}
          </span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            >
              .
            </motion.span>
          ))}
        </motion.div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn("flex items-center space-x-2 p-2", className)}>
      <motion.div
        className="relative w-6 h-6 rounded-full bg-blue-400/10 flex items-center justify-center"
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <motion.div
          className="absolute inset-0 border-t-2 border-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </motion.div>
      <div className="text-sm font-medium text-muted-foreground">
        Thinking
        {elapsedTime > 5 && (
          <span className="text-xs ml-1 opacity-70">({formatTime(elapsedTime)})</span>
        )}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0 }}
        >
          {".".repeat(dots)}
        </motion.span>
      </div>
    </div>
  )
}

