"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import type { Message } from "ai"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Copy, Check, Sparkles, BookOpen, HelpCircle, BarChart3, Code, Share, ThumbsUp, ThumbsDown, MoreHorizontal } from "lucide-react"
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

  // Memoize the message content to prevent unnecessary re-renders
  const messageContent = message.content;

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
    // Here you would typically send feedback to your backend
    setTimeout(() => setFeedback("none"), 3000)
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
        stiffness: 500,
        damping: 30,
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
      }
    }
  }

  return (
    <motion.div
      ref={messageRef}
      className={cn(
        "group relative px-4 py-3 rounded-2xl transition-all duration-300",
        isUser
          ? "bg-user text-user-foreground ml-auto max-w-[85%] sm:max-w-[75%]"
          : "bg-assistant text-assistant-foreground mr-auto max-w-[85%] sm:max-w-[75%]",
        isVisible ? "opacity-100" : "opacity-0 translate-y-2",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Message content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {isUser ? (
          <div className="whitespace-pre-wrap">{messageContent}</div>
        ) : (
          <MarkdownRenderer content={messageContent} />
        )}
      </div>

      {/* Feedback indicator */}
      <AnimatePresence>
        {feedback !== "none" && (
          <motion.div 
            className="absolute top-2 right-2 text-xs bg-white/10 backdrop-blur-md rounded-full px-2 py-1 flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {feedback === "positive" ? (
              <ThumbsUp size={12} className="text-green-400" />
            ) : (
              <ThumbsDown size={12} className="text-red-400" />
            )}
            <span className="text-muted-foreground">{t.thanks}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "flex items-center gap-2 px-4 py-2 border-t border-white/5",
          isUser ? "justify-end" : "justify-between",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {!isUser && (
          <div className="flex items-center gap-2">
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full text-xs bg-white/5 hover:bg-white/10"
                      onClick={() => handleFeedback("positive")}
                      disabled={feedback !== "none"}
                    >
                      <ThumbsUp size={14} className={feedback === "positive" ? "text-green-400" : ""} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.helpful}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
            
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-full text-xs bg-white/5 hover:bg-white/10"
                      onClick={() => handleFeedback("negative")}
                      disabled={feedback !== "none"}
                    >
                      <ThumbsDown size={14} className={feedback === "negative" ? "text-red-400" : ""} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.notHelpful}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!isUser && (
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-full text-xs bg-white/5 hover:bg-white/10"
                onClick={onRegenerate}
              >
                <Sparkles size={14} className="mr-1" />
                {t.regenerate}
              </Button>
            </motion.div>
          )}

          <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-full text-xs bg-white/5 hover:bg-white/10"
              onClick={copyToClipboard}
            >
              {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              {copied ? t.copied : t.copy}
            </Button>
          </motion.div>
          
          <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 rounded-full text-xs bg-white/5 hover:bg-white/10 p-0"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#2A2B30] border-white/10 text-white">
                <DropdownMenuItem onClick={shareMessage} className="cursor-pointer">
                  <Share size={14} className="mr-2" />
                  <span>{t.share}</span>
                </DropdownMenuItem>
                {!isUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleQuickAction("explain")} className="cursor-pointer">
                      <BookOpen size={14} className="mr-2" />
                      <span>{t.explain}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickAction("summarize")} className="cursor-pointer">
                      <HelpCircle size={14} className="mr-2" />
                      <span>{t.summarize}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickAction("translate")} className="cursor-pointer">
                      <BarChart3 size={14} className="mr-2" />
                      <span>{t.translate}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleQuickAction("code")} className="cursor-pointer">
                      <Code size={14} className="mr-2" />
                      <span>{t.code}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Quick action menu for text selection */}
      <AnimatePresence>
        {showQuickActions && selectedText && (
          <motion.div
            className="fixed z-50 bg-[#2A2B30] rounded-lg shadow-lg border border-white/10 p-1 quick-action-menu"
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
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs hover:bg-white/10"
                onClick={copySelectionToClipboard}
              >
                <Copy size={14} className="mr-1" />
                {t.copySelection}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs hover:bg-white/10"
                onClick={() => handleQuickAction("explain")}
              >
                <BookOpen size={14} className="mr-1" />
                {t.explain}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-xs hover:bg-white/10"
                onClick={() => handleQuickAction("translate")}
              >
                <BarChart3 size={14} className="mr-1" />
                {t.translate}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

EnhancedChatMessage.displayName = "EnhancedChatMessage"

export default EnhancedChatMessage

