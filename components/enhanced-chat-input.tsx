"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Lightbulb, Mic, Paperclip, ArrowUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AutoResizeTextarea from "@/components/auto-resize-textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  onVoiceInputToggle: () => void
  onFileUploadToggle: () => void
  isVoiceInputActive: boolean
  language: "en" | "bn"
  suggestions?: { icon: React.ReactNode; text: string }[]
  onSuggestionClick?: (suggestion: string) => void
  disabled?: boolean
  maxLength?: number
  onFocus?: () => void
  onBlur?: () => void
}

export default function EnhancedChatInput({
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
  onFocus,
  onBlur,
}: EnhancedChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Translations
  const t = {
    en: {
      placeholder: "Ask me anything...",
      deepsearch: "Deep search",
      think: "Think step by step",
      sendMessage: "Send message",
      shortcuts: "Keyboard shortcuts: Ctrl+Enter to send"
    },
    bn: {
      placeholder: "আমাকে যেকোনো প্রশ্ন করুন...",
      deepsearch: "গভীর অনুসন্ধান",
      think: "ধাপে ধাপে চিন্তা করুন",
      sendMessage: "বার্তা পাঠান",
      shortcuts: "কীবোর্ড শর্টকাট: পাঠাতে Ctrl+Enter"
    },
  }[language]

  // Handle typing indicator
  useEffect(() => {
    if (input.trim() && !isTyping) {
      setIsTyping(true)
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 1000)

    setTypingTimeout(timeout)

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [input])

  // Focus the input when component mounts
  useEffect(() => {
    if (!isVoiceInputActive && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isVoiceInputActive])

  // Show suggestions when input is focused and empty
  useEffect(() => {
    setShowSuggestions(isFocused && !input.trim())
  }, [isFocused, input])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (input.trim() && !isLoading && !disabled) {
          e.preventDefault()
          formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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

  // Handle focus and blur events
  const handleFocus = () => {
    setIsFocused(true)
    if (onFocus) onFocus()
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) onBlur()
  }

  return (
    <div className="w-full">
      <form ref={formRef} onSubmit={handleSubmit} className="w-full">
        <motion.div
          className="relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border transition-all duration-300"
          variants={containerVariants}
          animate={isFocused ? "focused" : "unfocused"}
          initial="unfocused"
        >
          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && !isLoading && (
              <motion.div
                className="absolute -top-6 left-4 text-xs text-blue-400 flex items-center gap-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>{language === "en" ? "Typing..." : "টাইপিং..."}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AutoResizeTextarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            placeholder={t.placeholder}
            className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-lg resize-none"
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxRows={6}
            showCharCount={true}
            maxLength={maxLength}
            animateHeight={true}
            disabled={disabled || isLoading}
          />

          <div className="flex items-center mt-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
                  onClick={() => handleSuggestionClick(t.deepsearch)}
                  disabled={disabled || isLoading}
                >
                  <Search size={16} className="mr-2" />
                  {t.deepsearch}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
                  onClick={() => handleSuggestionClick(t.think)}
                  disabled={disabled || isLoading}
                >
                  <Lightbulb size={16} className="mr-2" />
                  {t.think}
                </Button>
              </motion.div>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10"
                  onClick={onVoiceInputToggle}
                  disabled={disabled || isLoading}
                >
                  <Mic size={16} />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10"
                  onClick={onFileUploadToggle}
                  disabled={disabled || isLoading}
                >
                  <Paperclip size={16} />
                </Button>
              </motion.div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={buttonVariants}
                      animate={input.trim() && !isLoading ? "active" : "inactive"}
                      whileHover={input.trim() && !isLoading ? { scale: 1.1 } : {}}
                      whileTap={input.trim() && !isLoading ? { scale: 0.9 } : {}}
                    >
                      <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim() || disabled}
                        className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                      >
                        <ArrowUp size={16} />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.sendMessage} (Ctrl+Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
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
}


