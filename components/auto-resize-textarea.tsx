"use client"

import type React from "react"
import { useRef, useEffect, useState, forwardRef, useCallback } from "react"
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

// Debounce function to limit how often a function is called
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  (
    {
      value,
      onChange,
      minRows = 1,
      maxRows = 5,
      className,
      showCharCount = false,
      maxLength,
      animateHeight = true,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [height, setHeight] = useState<number>(0)
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(0)

    // Combine the forwarded ref with our internal ref
    const combinedRef = (node: HTMLTextAreaElement) => {
      textareaRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    // Memoize the resize function with useCallback
    const resizeTextarea = useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"

      // Calculate the height based on scrollHeight
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight) || 24
      const paddingTop = Number.parseInt(getComputedStyle(textarea).paddingTop) || 8
      const paddingBottom = Number.parseInt(getComputedStyle(textarea).paddingBottom) || 8

      const minHeight = minRows * lineHeight + paddingTop + paddingBottom
      const maxHeight = maxRows * lineHeight + paddingTop + paddingBottom

      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      
      if (animateHeight) {
        setHeight(newHeight)
      } else {
        textarea.style.height = `${newHeight}px`
      }
      
      // Update character count
      setCharCount(value.length)
    }, [minRows, maxRows, animateHeight, value.length]);

    // Create a debounced version of resizeTextarea
    const debouncedResize = useCallback(debounce(resizeTextarea, 10), [resizeTextarea]);

    // Resize on value change
    useEffect(() => {
      debouncedResize();
    }, [value, debouncedResize]);

    // Initial resize
    useEffect(() => {
      resizeTextarea();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
          ref={combinedRef}
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
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"

export default AutoResizeTextarea

