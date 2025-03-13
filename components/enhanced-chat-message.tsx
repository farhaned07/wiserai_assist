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

  // Add custom styles for markdown content
  const markdownStyles = {
    p: "mb-2 last:mb-0", // Reduced margin between paragraphs
    h1: "text-2xl font-semibold mb-2 mt-3",
    h2: "text-xl font-semibold mb-2 mt-2",
    h3: "text-lg font-semibold mb-1.5 mt-2",
    ul: "mb-2 space-y-1", // Reduced space between list items
    ol: "mb-2 space-y-1",
    li: "ml-4",
    pre: "mb-2 rounded-md bg-gray-800/50 p-2",
    code: "rounded bg-gray-800/30 px-1 py-0.5",
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
        "relative flex w-full items-start gap-4 px-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      variants={messageVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover="hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={cn(
          "flex-1 space-y-2 overflow-hidden px-1",
          isUser ? "text-right" : "text-left"
        )}
      >
        <div className={cn(
          "inline-block rounded-lg px-3 py-2 text-sm",
          isUser ? "bg-gradient-to-br from-blue-500/5 via-blue-400/3 to-indigo-400/5 text-white/95" : 
                  "bg-gradient-to-br from-[#2A2B30]/5 to-[#1F2023]/5 text-gray-100/95"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none",
            "prose-p:mb-2 prose-p:last:mb-0", // Reduced margin between paragraphs
            "prose-headings:font-semibold",
            "prose-h1:text-2xl prose-h1:mb-2 prose-h1:mt-3",
            "prose-h2:text-xl prose-h2:mb-2 prose-h2:mt-2",
            "prose-h3:text-lg prose-h3:mb-1.5 prose-h3:mt-2",
            "prose-ul:mb-2 prose-ul:mt-0 prose-ul:space-y-1", // Reduced space between list items
            "prose-ol:mb-2 prose-ol:mt-0 prose-ol:space-y-1",
            "prose-li:ml-4",
            "prose-pre:mb-2 prose-pre:rounded-md prose-pre:bg-gray-800/50 prose-pre:p-2",
            "prose-code:rounded prose-code:bg-gray-800/30 prose-code:px-1 prose-code:py-0.5",
            isUser ? "text-right" : "text-left"
          )}>
            <SimpleMarkdownRenderer content={messageContent} />
          </div>
        </div>
      </div>

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

