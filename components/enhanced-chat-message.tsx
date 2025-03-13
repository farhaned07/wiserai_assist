"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import type { Message } from "ai"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import SimpleMarkdownRenderer from "@/components/simple-markdown-renderer"
import { Copy, Check, Sparkles, BookOpen, HelpCircle, BarChart3, Code, Share, ThumbsUp, ThumbsDown, MoreHorizontal, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancedChatMessageProps {
  message: Message
  language: "en" | "bn"
  isLoading?: boolean
  onRegenerate?: () => void
  onCopy?: (content: string) => void
  isLastMessage?: boolean
}

// Memoized component to prevent unnecessary re-renders
const EnhancedChatMessage = memo(function EnhancedChatMessage({
  message,
  language,
  isLoading = false,
  onRegenerate,
  onCopy,
  isLastMessage = false,
}: EnhancedChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [quickActionPosition, setQuickActionPosition] = useState({ x: 0, y: 0 })
  const [feedback, setFeedback] = useState<"none" | "positive" | "negative">("none")
  const [showFeedbackThanks, setShowFeedbackThanks] = useState(false)

  // Memoize the message content to prevent unnecessary re-renders
  const messageContent = message.content;
  
  // Check if the message has a structured format (contains headings or lists)
  const isStructured = !isUser && (
    messageContent.includes('##') || 
    messageContent.includes('- ') || 
    messageContent.includes('1. ')
  );

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Intersection observer for animation
  useEffect(() => {
    if (!messageRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(messageRef.current)
    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current)
      }
    }
  }, [])

  // Handle text selection within the message
  useEffect(() => {
    if (!messageRef.current) return

    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection) return
      
      // Check if the selection is within this message
      let node = selection.anchorNode
      let isWithinMessage = false
      
      while (node) {
        if (node === messageRef.current) {
          isWithinMessage = true
          break
        }
        node = node.parentNode
      }
      
      if (isWithinMessage && selection.toString().trim()) {
        const text = selection.toString().trim()
        setSelectedText(text)
        
        // Get position for quick actions menu
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        setQuickActionPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10
        })
        
        setShowQuickActions(true)
      } else {
        setSelectedText("")
        setShowQuickActions(false)
      }
    }
    
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
    }
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    if (onCopy) onCopy(message.content)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const copySelectionToClipboard = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowQuickActions(false)
    }
  }
  
  const handleQuickAction = (action: string) => {
    if (!selectedText) return
    
    // This would typically dispatch an action to the parent component
    // For now, we'll just copy the text and hide the menu
    copySelectionToClipboard()
    setShowQuickActions(false)
  }
  
  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    // Show thank you message
    setShowFeedbackThanks(true)
    // Hide thank you message after 3 seconds
    setTimeout(() => setShowFeedbackThanks(false), 3000)
  }
  
  const shareMessage = () => {
    // Implementation would depend on your sharing mechanism
    // For now, just copy to clipboard
    copyToClipboard()
  }

  const translations = {
    en: {
      you: "You",
      ai: "Wiser",
      copy: "Copy",
      copied: "Copied!",
      regenerate: "Regenerate",
      explain: "Explain",
      summarize: "Summarize",
      translate: "Translate",
      code: "Code",
      share: "Share",
      feedback: "Feedback",
      helpful: "Helpful",
      notHelpful: "Not helpful",
      thanks: "Thanks for your feedback!",
      moreOptions: "More options",
      copySelection: "Copy selection"
    },
    bn: {
      you: "আপনি",
      ai: "ওয়াইজার",
      copy: "কপি করুন",
      copied: "কপি করা হয়েছে!",
      regenerate: "পুনরায় তৈরি করুন",
      explain: "ব্যাখ্যা করুন",
      summarize: "সারাংশ",
      translate: "অনুবাদ করুন",
      code: "কোড লিখুন",
      share: "শেয়ার করুন",
      feedback: "প্রতিক্রিয়া",
      helpful: "সহায়ক",
      notHelpful: "সহায়ক নয়",
      thanks: "আপনার প্রতিক্রিয়ার জন্য ধন্যবাদ!",
      moreOptions: "আরও অপশন",
      copySelection: "নির্বাচন কপি করুন"
    },
  }

  const t = translations[language]

  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
    hover: {
      scale: 1.005,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  }
  
  const quickActionVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
      },
    },
  }

  return (
    <motion.div
      ref={messageRef}
      className={cn(
        "group relative mb-8 flex flex-col",
        isUser ? "items-end" : "items-start"
      )}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover="hover"
      variants={messageVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "relative max-w-[85%] px-4 py-3 text-sm sm:text-base",
          isUser ? "text-white/95" : "text-gray-100/95",
          "transform-gpu transition-all duration-300",
          "hover:translate-x-[2px]"
        )}
      >
        <motion.div 
          className={cn(
            "flex items-center gap-3 mb-2.5 pb-2",
            "border-b",
            isUser ? "border-white/[0.02]" : "border-gray-700/[0.05]"
          )}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className={cn(
            "font-medium text-xs flex items-center gap-2",
            isUser ? "text-blue-200/80" : "text-blue-300/80"
          )}>
            {isUser ? t.you : (
              <>
                <motion.span
                  animate={{
                    scale: [1, 1.15, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <Sparkles size={12} className="text-blue-400/90" />
                </motion.span>
                {t.ai}
              </>
            )}
          </span>
          
          {isStructured && !isUser && (
            <motion.span 
              className="text-[11px] bg-blue-500/5 text-blue-300/90 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 hover:bg-blue-500/10 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Code size={10} />
              Structured
            </motion.span>
          )}
          
          {/* Show feedback thank you message */}
          <AnimatePresence>
            {showFeedbackThanks && !isUser && (
              <motion.div 
                className="text-[11px] text-green-400/90 flex items-center gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              >
                <motion.span
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 1,
                  }}
                >
                  <Check size={12} />
                </motion.span>
                {t.thanks}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.div 
          className={cn(
            "prose prose-invert max-w-none",
            isUser ? "text-white/90" : "text-gray-100/90",
            "leading-relaxed tracking-[-0.01em] space-y-3"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SimpleMarkdownRenderer content={messageContent} />
        </motion.div>
        
        {/* Enhanced feedback buttons for AI messages */}
        {!isUser && isLastMessage && (
          <motion.div 
            className={cn(
              "flex items-center gap-2.5 mt-3 pt-2",
              "border-t border-gray-700/[0.05]"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div 
                    whileHover={{ scale: 1.1 }} 
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 w-7 rounded-full p-0",
                        "hover:bg-white/[0.02] transition-all duration-300",
                        "transform hover:scale-105",
                        feedback === "positive" && "text-green-400/90 hover:text-green-400"
                      )}
                      onClick={() => handleFeedback("positive")}
                      disabled={feedback !== "none"}
                    >
                      <ThumbsUp size={13} />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="tooltip-animation">
                  <p>{t.helpful}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 rounded-full p-0",
                      "hover:bg-white/[0.02] transition-all duration-200",
                      feedback === "negative" && "text-red-400/90 hover:text-red-400"
                    )}
                    onClick={() => handleFeedback("negative")}
                    disabled={feedback !== "none"}
                  >
                    <ThumbsDown size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="tooltip-animation">
                  <p>{t.notHelpful}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 rounded-full p-0 hover:bg-white/[0.02] hover:text-blue-400/90 transition-all duration-200"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check size={13} className="text-green-400/90" /> : <Copy size={13} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="tooltip-animation">
                  <p>{copied ? t.copied : t.copy}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onRegenerate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 rounded-full p-0 hover:bg-white/[0.02] hover:text-blue-400/90 transition-all duration-200"
                      onClick={onRegenerate}
                    >
                      <RefreshCw size={13} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{t.regenerate}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </motion.div>
        )}
      </div>

      {/* Quick action menu for text selection */}
      <AnimatePresence>
        {showQuickActions && selectedText && (
          <motion.div
            className="fixed z-50 bg-[#1F2023]/70 backdrop-blur-sm rounded-lg shadow-sm border border-white/[0.02] p-1.5"
            style={{ 
              left: `${quickActionPosition.x}px`, 
              top: `${quickActionPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={quickActionVariants}
          >
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-xs hover:bg-white/[0.02] hover:text-blue-400 transition-all duration-200"
                      onClick={copySelectionToClipboard}
                    >
                      <Copy size={14} className="mr-1" />
                      {t.copySelection}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{t.copy}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-xs hover:bg-white/[0.02] hover:text-blue-400 transition-all duration-200"
                      onClick={() => handleQuickAction("explain")}
                    >
                      <BookOpen size={14} className="mr-1" />
                      {t.explain}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{t.explain}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full text-xs hover:bg-white/[0.02] hover:text-blue-400 transition-all duration-200"
                      onClick={() => handleQuickAction("summarize")}
                    >
                      <HelpCircle size={14} className="mr-1" />
                      {t.summarize}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="tooltip-animation">
                    <p>{t.summarize}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

EnhancedChatMessage.displayName = "EnhancedChatMessage"

export default EnhancedChatMessage

