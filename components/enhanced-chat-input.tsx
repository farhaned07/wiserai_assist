"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Search, Lightbulb, Mic, Paperclip, ArrowUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AutoResizeTextarea from "@/components/auto-resize-textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Suggestion {
  icon: React.ReactNode
  text: string
}

interface EnhancedChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  onVoiceInputToggle: () => void
  onFileUploadToggle: () => void
  isVoiceInputActive: boolean
  language: "en" | "bn"
  suggestions?: Suggestion[]
  onSuggestionClick?: (suggestion: string) => void
  disabled?: boolean
  maxLength?: number
}

const EnhancedChatInput = React.memo(({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  onVoiceInputToggle,
  onFileUploadToggle,
  isVoiceInputActive,
  language,
  suggestions = [],
  onSuggestionClick,
  disabled = false,
  maxLength = 4000,
}: EnhancedChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Translations
  const t = {
    en: {
      placeholder: "Ask me anything...",
      deepsearch: "Deep search",
      think: "Think step by step",
      sendMessage: "Send message",
      shortcuts: "Keyboard shortcuts: Ctrl+Enter to send",
      startRecording: "Start recording",
      stopRecording: "Stop recording",
      attachFile: "Attach file",
      voiceInput: "Voice input",
      fileUpload: "Upload file",
      charactersLeft: "characters left",
    },
    bn: {
      placeholder: "আমাকে যেকোনো প্রশ্ন করুন...",
      deepsearch: "গভীর অনুসন্ধান",
      think: "ধাপে ধাপে চিন্তা করুন",
      sendMessage: "বার্তা পাঠান",
      shortcuts: "কীবোর্ড শর্টকাট: পাঠাতে Ctrl+Enter",
      startRecording: "অনুসন্ধান শুরু করুন",
      stopRecording: "অনুসন্ধান শেষ করুন",
      attachFile: "ফাইল সংযোগ করুন",
      voiceInput: "ভয়েস ইনপুট",
      fileUpload: "ফাইল আপলোড করুন",
      charactersLeft: "অক্ষর বাকি আছে",
    },
  }[language]

  // Focus management
  useEffect(() => {
    if (!isVoiceInputActive && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isVoiceInputActive])

  // Show suggestions only when focused and empty
  useEffect(() => {
    setShowSuggestions(isFocused && !input.trim())
  }, [isFocused, input])

  // Keyboard shortcuts with preventDefault
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (input.trim() && !isLoading && !disabled) {
          e.preventDefault()
          e.stopPropagation()
          formRef.current?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true })
          )
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [input, isLoading, disabled])

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion)
    }
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // Animation variants
  const containerVariants = {
    focused: {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.3)",
    },
    unfocused: {
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      borderColor: "rgba(255, 255, 255, 0.1)",
    }
  }

  const buttonVariants = {
    active: { scale: 1, opacity: 1 },
    inactive: { scale: 0.95, opacity: 0.5 },
  }

  const suggestionVariants = {
    hidden: { opacity: 0, y: 10, height: 0 },
    visible: { opacity: 1, y: 0, height: "auto" },
  }

  // Handle Ctrl+Enter to submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      if (input.trim() && !isLoading) {
        formRef.current?.requestSubmit()
      }
    }
  }, [input, isLoading])

  // Calculate remaining characters
  const remainingChars = maxLength - input.length
  const isNearLimit = remainingChars < maxLength * 0.1
  const isAtLimit = remainingChars <= 0

  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="w-full">
        <motion.div
          className={cn(
            "relative flex flex-col w-full max-w-3xl mx-auto",
            isFocused ? "expanded-chat shadow-glow-enhanced" : "minimized-chat shadow-glow",
            "transition-all duration-300 ease-in-out transform",
            isFocused ? "scale-[1.02]" : "scale-100"
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-end gap-2 p-2">
            <AutoResizeTextarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t.placeholder}
              maxLength={maxLength}
              disabled={disabled || isLoading}
              className={cn(
                "flex-1 min-h-[44px] max-h-[200px] bg-transparent border-0 focus:ring-0 resize-none",
                "placeholder:text-muted-foreground/50 text-sm sm:text-base",
                "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                "transition-all duration-300 ease-in-out",
                "focus:placeholder:text-muted-foreground/70",
                disabled && "opacity-50 cursor-not-allowed",
                isAtLimit ? "text-red-400" : ""
              )}
            />

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      className="shadow-glow"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-full bg-white/5",
                          "hover:bg-white/10 hover:text-blue-400 transition-all duration-300",
                          "transform hover:scale-105",
                          isVoiceInputActive && "text-red-400 hover:text-red-500 animate-pulse"
                        )}
                        onClick={onVoiceInputToggle}
                        disabled={disabled || isLoading}
                        title={t.voiceInput}
                      >
                        <Mic size={16} className={isVoiceInputActive ? "animate-bounce" : ""} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{isVoiceInputActive ? t.stopRecording : t.startRecording}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      className="shadow-glow"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 hover:text-blue-400 transition-all duration-300 transform hover:scale-105"
                        onClick={onFileUploadToggle}
                        disabled={disabled || isLoading}
                        title={t.fileUpload}
                      >
                        <Paperclip size={16} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{t.attachFile}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={buttonVariants}
                      animate={input.trim() && !isLoading ? "active" : "inactive"}
                      whileHover={input.trim() && !isLoading ? { scale: 1.1 } : {}}
                      whileTap={input.trim() && !isLoading ? { scale: 0.9 } : {}}
                      className="shadow-glow"
                    >
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim() || isAtLimit}
                        className={cn(
                          "h-8 w-8 rounded-full",
                          "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
                          "hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600",
                          "text-white shadow-lg transition-all duration-300",
                          "transform hover:scale-105",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          "disabled:hover:from-blue-500 disabled:hover:via-indigo-500 disabled:hover:to-purple-500"
                        )}
                        title={t.sendMessage}
                      >
                        <ArrowUp size={16} className={isLoading ? "animate-bounce" : ""} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{t.sendMessage} (Ctrl+Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Character count */}
          {input.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-1 right-24 text-xs text-muted-foreground/70"
            >
              <span className={cn(
                input.length > maxLength * 0.9 && "text-yellow-400",
                input.length >= maxLength && "text-red-400"
              )}>
                {input.length}
              </span>
              /{maxLength}
            </motion.div>
          )}
        </motion.div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              className="mt-3 space-y-2"
              variants={suggestionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs text-muted-foreground mb-2">
                {language === "en" ? "Try asking about:" : "এ সম্পর্কে জিজ্ঞাসা করুন:"}
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                      {suggestion.icon}
                      <span className="ml-2">{suggestion.text}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
})

EnhancedChatInput.displayName = "EnhancedChatInput"

export default EnhancedChatInput


