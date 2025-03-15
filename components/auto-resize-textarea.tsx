"use client"

import React, { useEffect, useRef, useCallback } from "react"
import { rafThrottle } from "@/utils/performance"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  minRows?: number
  maxRows?: number
  showCharCount?: boolean
  maxLength?: number
  animateHeight?: boolean
}

const AutoResizeTextarea = React.memo(React.forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({
    value,
    onChange,
    minRows = 1,
    maxRows = 10,
    className,
    showCharCount = false,
    maxLength,
    animateHeight = true,
    ...props
  }, forwardedRef) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [height, setHeight] = React.useState<number>(0)
    const [isFocused, setIsFocused] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)

    // Combine the forwarded ref with our local ref
    const setRef = useCallback((element: HTMLTextAreaElement | null) => {
      textareaRef.current = element
      
      // Handle forwarded ref
      if (typeof forwardedRef === 'function') {
        forwardedRef(element)
      } else if (forwardedRef) {
        forwardedRef.current = element
      }
    }, [forwardedRef])

    // Resize function using requestAnimationFrame for performance
    const resizeTextarea = rafThrottle(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      
      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto'
      
      // Calculate min and max heights based on rows
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
      const minHeight = minRows * lineHeight
      const maxHeight = maxRows * lineHeight
      
      // Set the new height based on content, constrained by min/max
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
      
      // Add overflow if content exceeds max height
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
      
      // Update character count
      setCharCount(value.length)
    })

    // Resize on value change
    useEffect(() => {
      resizeTextarea()
    }, [value, resizeTextarea])

    // Resize on window resize
    useEffect(() => {
      window.addEventListener('resize', resizeTextarea)
      return () => window.removeEventListener('resize', resizeTextarea)
    }, [resizeTextarea])

    // Apply animated height
    useEffect(() => {
      if (animateHeight && height > 0 && textareaRef.current) {
        textareaRef.current.style.height = `${height}px`
      }
    }, [height, animateHeight])

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      if (props.onFocus) {
        props.onFocus(e)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      if (props.onBlur) {
        props.onBlur(e)
      }
    }

    return (
      <div className="relative w-full">
        <textarea
          ref={setRef}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "auto-resize-textarea w-full px-3 py-2 border rounded-md focus:outline-none transition-all duration-200",
            isFocused ? "border-blue-500/30 shadow-glow" : "border-transparent",
            className,
          )}
          rows={minRows}
          maxLength={maxLength}
          style={{
            transition: animateHeight ? "height 0.2s ease" : undefined,
          }}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <motion.div 
            className="absolute bottom-2 right-3 text-xs text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isFocused || charCount > 0 ? 1 : 0,
              color: charCount > maxLength * 0.8 ? (charCount > maxLength * 0.95 ? "#ef4444" : "#f59e0b") : "currentColor"
            }}
            transition={{ duration: 0.2 }}
          >
            {charCount}/{maxLength}
          </motion.div>
        )}
      </div>
    )
  }
))

AutoResizeTextarea.displayName = 'AutoResizeTextarea'

export default AutoResizeTextarea

