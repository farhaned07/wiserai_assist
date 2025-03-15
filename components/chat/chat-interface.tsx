import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import EnhancedChatMessage from "@/components/enhanced-chat-message"
import EnhancedTypingIndicator from "@/components/enhanced-typing-indicator"
import EnhancedChatInput from "@/components/enhanced-chat-input"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { Message } from "ai"
import { useSwipeable } from "react-swipeable"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { useDoubleTap } from "@/hooks/use-double-tap"
import { Copy, Share } from "lucide-react"

type ChatInterfaceProps = {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  language: "en" | "bn"
  handleRegenerateMessage: () => void
  handleCopyMessage: (content: string) => void
  handlePromptSelect: (prompt: string) => void
  handleVoiceInputToggle: () => void
  handleFileUploadToggle: () => void
  isVoiceInputActive: boolean
  handleClearChat: () => void
  handleQuickAction: (action: string) => void
  selectedText: string
}

export default function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  language,
  handleRegenerateMessage,
  handleCopyMessage,
  handlePromptSelect,
  handleVoiceInputToggle,
  handleFileUploadToggle,
  isVoiceInputActive,
  handleClearChat,
  handleQuickAction,
  selectedText,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const controls = useAnimation()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  // Handle scroll events to show/hide scroll to bottom button
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setShowScrollButton(distanceFromBottom > 200)
    }

    chatContainer.addEventListener('scroll', handleScroll)
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement
      if (chatContainer) {
        // Only auto-scroll if user is already near the bottom
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 200
        if (isNearBottom || messages[messages.length - 1]?.role === "user") {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }, [messages, isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Translations
  const translations = {
    en: {
      explain: "Explain this",
      summarize: "Summarize",
      translate: "Translate",
      code: "Write code",
      structured: "Structured response",
      stopVoice: "Stop voice",
      clearChat: "Clear chat",
      keyboardShortcuts: "Keyboard shortcuts: Ctrl+/ to focus, Ctrl+Enter to send"
    },
    bn: {
      explain: "ব্যাখ্যা করুন",
      summarize: "সারাংশ",
      translate: "অনুবাদ করুন",
      code: "কোড লিখুন",
      structured: "কাঠামোগত প্রতিক্রিয়া",
      stopVoice: "ভয়েস বন্ধ করুন"
    },
  }

  const t = translations[language]

  // Action buttons
  const actions = [
    { icon: null, text: t.explain },
    { icon: null, text: t.summarize },
    { icon: null, text: t.translate },
    { icon: null, text: t.code },
    { icon: null, text: t.structured },
  ]

  // Pull to refresh handler
  const { isPulling, pullProgress } = usePullToRefresh({
    onRefresh: async () => {
      setIsRefreshing(true)
      // Implement your refresh logic here
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsRefreshing(false)
    },
    containerRef: chatContainerRef
  })

  // Double tap to like/react
  const handleDoubleTap = useDoubleTap(() => {
    // Implement reaction logic
  }, 300)

  // Swipe handlers for message actions
  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      setShowActionsMenu(true)
    },
    onSwipedRight: (eventData) => {
      setShowActionsMenu(false)
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  })

  // Optimized animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  }

  const messageVariants = {
    hidden: { 
      opacity: 0,
      y: 10,
      transform: 'translateZ(0)' // Hardware acceleration
    },
    visible: { 
      opacity: 1,
      y: 0,
      transform: 'translateZ(0)',
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1.0], // Optimized easing
      }
    },
    exit: { 
      opacity: 0,
      transform: 'translateZ(0)',
      transition: { duration: 0.15 }
    }
  }

  return (
    <motion.div
      key="chat"
      ref={chatContainerRef}
      className="flex flex-col w-full h-full overflow-y-auto relative overscroll-y-contain"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ 
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
      {...swipeHandlers}
    >
      {/* Pull to refresh indicator - Optimized */}
      {isPulling && (
        <motion.div 
          className="absolute top-0 left-0 w-full flex justify-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: pullProgress }}
          style={{ transform: 'translateZ(0)' }}
        >
          <motion.div 
            className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full"
            animate={{ 
              rotate: 360,
              transition: { duration: 1, repeat: Infinity, ease: "linear" }
            }}
            style={{ transform: 'translateZ(0)' }}
          />
        </motion.div>
      )}

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
              className="relative"
              {...handleDoubleTap}
            >
              <EnhancedChatMessage
                message={message}
                language={language}
                onRegenerate={message.role === "assistant" ? handleRegenerateMessage : undefined}
                onCopy={handleCopyMessage}
                isLastMessage={index === messages.length - 1 && message.role === "assistant"}
              />

              {/* Swipeable actions menu - Optimized */}
              <AnimatePresence mode="wait">
                {showActionsMenu && (
                  <motion.div
                    className="absolute right-0 top-0 h-full flex items-center gap-2 px-3 bg-gradient-to-l from-[#1A1B1E] to-transparent"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      transition: { 
                        duration: 0.2,
                        ease: [0.25, 0.1, 0.25, 1.0]
                      }
                    }}
                    exit={{ 
                      x: 50, 
                      opacity: 0,
                      transition: { duration: 0.15 }
                    }}
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-150">
                      <Copy size={16} className="text-white/80" />
                    </button>
                    <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-150">
                      <Share size={16} className="text-white/80" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator - Optimized */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transform: 'translateZ(0)' }}
              className="w-full py-4"
            >
              <div className="inline-block bg-[#2A2B30] rounded-t-2xl rounded-br-2xl rounded-bl-sm p-4">
                <EnhancedTypingIndicator variant="modern" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll button - Optimized */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            className="fixed bottom-24 right-4 z-10 sm:right-6"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1.0]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              y: 10,
              transition: { duration: 0.15 }
            }}
            style={{ transform: 'translateZ(0)' }}
          >
            <Button
              onClick={scrollToBottom}
              size="icon"
              className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors duration-150"
            >
              <ChevronDown size={20} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick actions - Optimized */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            className="fixed bottom-24 left-1/2 z-10 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 p-1 max-w-[90vw] overflow-x-auto no-scrollbar"
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: {
                duration: 0.2,
                ease: [0.25, 0.1, 0.25, 1.0]
              }
            }}
            exit={{ 
              opacity: 0, 
              y: 20,
              transition: { duration: 0.15 }
            }}
            style={{ 
              transform: 'translateX(-50%) translateZ(0)',
              willChange: 'transform, opacity'
            }}
          >
            <div className="flex items-center gap-1 px-2">
              <Button
                onClick={() => handleQuickAction("explain")}
                size="sm"
                variant="ghost"
                className="rounded-full hover:bg-white/10 whitespace-nowrap text-sm"
              >
                {t.explain}
              </Button>
              <Button
                onClick={() => handleQuickAction("summarize")}
                size="sm"
                variant="ghost"
                className="rounded-full hover:bg-white/10 whitespace-nowrap text-sm"
              >
                {t.summarize}
              </Button>
              <Button
                onClick={() => handleQuickAction("translate")}
                size="sm"
                variant="ghost"
                className="rounded-full hover:bg-white/10 whitespace-nowrap text-sm"
              >
                {t.translate}
              </Button>
              <Button
                onClick={() => handleQuickAction("code")}
                size="sm"
                variant="ghost"
                className="rounded-full hover:bg-white/10 whitespace-nowrap text-sm"
              >
                {t.code}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat input - Optimized */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-[#1A1B1E]/80 backdrop-blur-md border-t border-white/5 p-4 sm:p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: {
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1.0]
          }
        }}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="w-full max-w-5xl mx-auto">
          <EnhancedChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            onVoiceInputToggle={handleVoiceInputToggle}
            onFileUploadToggle={handleFileUploadToggle}
            isVoiceInputActive={isVoiceInputActive}
            language={language}
            suggestions={actions.map(action => ({ icon: null, text: action.text }))}
            onSuggestionClick={handlePromptSelect}
            maxLength={4000}
          />

          {language === "en" && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-4">
              <div className="text-xs text-muted-foreground/60">
                {t.keyboardShortcuts}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs rounded-full hover:bg-white/5"
              >
                {t.clearChat}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
} 