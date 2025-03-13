"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import {
  Settings,
  ArrowUp,
  Search,
  Lightbulb,
  BookOpen,
  HelpCircle,
  BarChart3,
  Code,
  Mic,
  Paperclip,
  Crown,
  ChevronDown,
} from "lucide-react"
import EnhancedChatMessage from "@/components/enhanced-chat-message"
import FileUpload from "@/components/file-upload"
import PaymentModal from "@/components/payment-modal"
import EnhancedTypingIndicator from "@/components/enhanced-typing-indicator"
import VoiceInput from "@/components/voice-input"
import EnhancedChatInput from "@/components/enhanced-chat-input"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import AutoResizeTextarea from "@/components/auto-resize-textarea"

export default function ChatPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [language, setLanguage] = useState<"en" | "bn">("en")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, error, setMessages, reload } = useChat({
    api: "/api/chat",
    body: {},
    onResponse: (response) => {
      if (!response.ok) {
        toast({
          title: language === "en" ? "Error" : "ত্রুটি",
          description:
            language === "en"
              ? "There was an error communicating with the AI. Please try again."
              : "এআই-এর সাথে যোগাযোগে একটি ত্রুটি ছিল। অনুগ্রহ করে আবার চেষ্টা করুন।",
          variant: "destructive",
        })
      }
      setShowWelcome(false)
    },
    onError: (error) => {
      toast({
        title: language === "en" ? "Error" : "ত্রুটি",
        description: error.message,
        variant: "destructive",
      })
    },
  })

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

  // Handle text selection in chat
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim())
      } else {
        setSelectedText("")
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ to focus chat input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        const textarea = document.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en")
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleFileClear = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    let interval: NodeJS.Timeout | undefined

    try {
      // Simulate upload progress
      let progress = 0
      interval = setInterval(() => {
        progress += 10
        setUploadProgress(Math.min(progress, 90))
      }, 300)

      // Create form data
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Send file to API
      const response = await fetch("/api/process-file", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process file")
      }

      const data = await response.json()
      if (interval) clearInterval(interval)
      setUploadProgress(100)

      // Add the file analysis to the chat
      append({
        role: "user",
        content: `${language === "en" ? "I uploaded a file: " : "আমি একটি ফাইল আপলোড করেছি: "}${selectedFile.name}`,
      })

      setTimeout(() => {
        append({
          role: "assistant",
          content: data.analysis,
        })
        setIsUploading(false)
        setSelectedFile(null)
        setUploadProgress(0)
        setShowFileUpload(false)
      }, 1000)
    } catch (error) {
      if (interval) clearInterval(interval)
      setIsUploading(false)
      setUploadProgress(0)
      toast({
        title: language === "en" ? "Error" : "ত্রুটি",
        description:
          language === "en"
            ? "There was an error processing your file. Please try again."
            : "আপনার ফাইল প্রক্রিয়াকরণে একটি ত্রুটি ছিল। অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      })
    }
  }

  const handleVoiceInput = (transcript: string) => {
    handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLTextAreaElement>)
    setIsVoiceInputActive(false)
  }

  const handleVoiceInputToggle = () => {
    setIsVoiceInputActive(!isVoiceInputActive)
  }

  const handleClearChat = () => {
    setMessages([])
    setShowWelcome(true)
  }

  const handleCopyMessage = (content: string) => {
    toast({
      title: language === "en" ? "Copied to clipboard" : "ক্লিপবোর্ডে কপি করা হয়েছে",
      description:
        language === "en"
          ? "The message has been copied to your clipboard."
          : "বার্তাটি আপনার ক্লিপবোর্ডে কপি করা হয়েছে।",
    })
  }

  const handleRegenerateMessage = () => {
    reload()
  }

  const handlePromptSelect = (prompt: string) => {
    // For structured response, add a prefix if it's just the button text
    if (prompt === t.structured) {
      prompt = language === "en" 
        ? "Provide a structured response about " 
        : "এটি সম্পর্কে একটি কাঠামোগত প্রতিক্রিয়া দিন ";
    }
    
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>)
  }

  // Handle quick actions on selected text
  const handleQuickAction = (action: string) => {
    if (!selectedText) return
    
    let prompt = ""
    switch (action) {
      case "explain":
        prompt = `${language === "en" ? "Explain this: " : "এটি ব্যাখ্যা করুন: "}${selectedText}`
        break
      case "summarize":
        prompt = `${language === "en" ? "Summarize this: " : "এটি সারাংশ করুন: "}${selectedText}`
        break
      case "translate":
        prompt = `${language === "en" ? "Translate this: " : "এটি অনুবাদ করুন: "}${selectedText}`
        break
      case "code":
        prompt = `${language === "en" ? "Write code for this: " : "এটির জন্য কোড লিখুন: "}${selectedText}`
        break
      case "structured":
        prompt = `${language === "en" ? "Provide a structured response about: " : "এটি সম্পর্কে একটি কাঠামোগত প্রতিক্রিয়া দিন: "}${selectedText}`
        break
    }
    
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>)
    setSelectedText("")
    
    // Focus the textarea
    const textarea = document.querySelector('textarea')
    if (textarea) {
      textarea.focus()
    }
  }

  // Create a function to manually stop generation
  const handleStopGeneration = () => {
    // Since we can't directly access the abort controller,
    // we'll use a different approach to stop generation
    
    // Add the current user message to indicate stopping
    if (isLoading) {
      append({
        role: 'user',
        content: language === "en" ? '[Generation stopped by user]' : '[উৎপাদন ব্যবহারকারী দ্বারা বন্ধ করা হয়েছে]'
      })
      
      toast({
        title: language === "en" ? "Generation stopped" : "উৎপাদন বন্ধ করা হয়েছে",
        description: language === "en" 
          ? "The AI response generation was stopped." 
          : "এআই প্রতিক্রিয়া উৎপাদন বন্ধ করা হয়েছে।",
      })
    }
  }

  // Translations
  const translations = {
    en: {
      welcome: "Welcome to Wiser AI",
      helpLine: "How can I assist you today?",
      placeholder: "Ask me anything...",
      deepsearch: "Deep search",
      think: "Think step by step",
      explain: "Explain this",
      summarize: "Summarize",
      translate: "Translate",
      code: "Write code",
      structured: "Structured response",
      stopVoice: "Stop voice",
      clearChat: "Clear chat",
      terms: "Wiser AI may produce inaccurate information about people, places, or facts.",
      keyboardShortcuts: "Keyboard shortcuts: Ctrl+/ to focus, Ctrl+Enter to send"
    },
    bn: {
      welcome: "ওয়াইজার এআই-তে স্বাগতম",
      helpLine: "আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      placeholder: "আমাকে যেকোনো প্রশ্ন করুন...",
      deepsearch: "গভীর অনুসন্ধান",
      think: "ধাপে ধাপে চিন্তা করুন",
      explain: "ব্যাখ্যা করুন",
      summarize: "সারাংশ",
      translate: "অনুবাদ করুন",
      code: "কোড লিখুন",
      structured: "কাঠামোগত প্রতিক্রিয়া",
      stopVoice: "ভয়েস বন্ধ করুন",
      clearChat: "চ্যাট মুছুন",
      terms: "ওয়াইজার এআই মানুষ, স্থান বা তথ্য সম্পর্কে অসঠিক তথ্য উৎপন্ন করতে পারে।",
      keyboardShortcuts: "কীবোর্ড শর্টকাট: ফোকাস করতে Ctrl+/, পাঠাতে Ctrl+Enter"
    },
  }

  const t = translations[language]

  // Action buttons
  const actions = [
    { icon: <BookOpen size={18} />, text: t.explain },
    { icon: <HelpCircle size={18} />, text: t.summarize },
    { icon: <BarChart3 size={18} />, text: t.translate },
    { icon: <Code size={18} />, text: t.code },
    { icon: <Lightbulb size={18} />, text: t.structured },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  const headerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: 0.1,
      },
    },
  }

  return (
    <main className="flex flex-col h-screen bg-[#1A1B1E] overflow-hidden">
      {/* Minimal Header */}
      <motion.header
        className="flex justify-between items-center p-4 border-b border-white/5"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            wiser
          </span>
        </motion.div>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-full bg-white/5 hover:bg-white/10"
            >
              {language === "en" ? "বাং" : "EN"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPaymentModal(true)}
              className="rounded-full bg-white/5 hover:bg-white/10 relative"
              title={language === "en" ? "Premium subscription" : "প্রিমিয়াম সাবস্ক্রিপশন"}
            >
              <Crown size={18} className="text-yellow-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettingsDialog(!showSettingsDialog)}
              className="rounded-full bg-white/5 hover:bg-white/10"
            >
              <Settings size={18} />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size="sm" className="rounded-full bg-white/5 hover:bg-white/10 border-white/10">
              {language === "en" ? "Sign up" : "সাইন আপ"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="sm" className="rounded-full bg-white/5 hover:bg-white/10 border-white/10">
              {language === "en" ? "Sign in" : "সাইন ইন"}
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <motion.div
              key="welcome"
              className="flex flex-col items-center justify-center w-full max-w-2xl"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              <motion.div className="text-center space-y-3 mb-10" variants={itemVariants}>
                <h1 className="text-4xl font-semibold text-foreground bg-gradient-to-r from-blue-100 to-white bg-clip-text">
                  {t.welcome}
                </h1>
                <p className="text-2xl text-muted-foreground">{t.helpLine}</p>
              </motion.div>

              {/* Input area */}
              <motion.div className="w-full max-w-2xl mb-8" variants={itemVariants}>
                <form onSubmit={handleSubmit} className="w-full">
                  <motion.div
                    className={`relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border ${isFocused ? "border-blue-500/30" : "border-white/10"} transition-all duration-300`}
                    animate={{ boxShadow: isFocused ? "0 0 20px rgba(59, 130, 246, 0.1)" : "0 0 0 rgba(0, 0, 0, 0)" }}
                  >
                    <AutoResizeTextarea
                      value={input}
                      onChange={handleInputChange}
                      placeholder={t.placeholder}
                      className="w-full px-4 py-3 bg-transparent border-0 focus:ring-0 text-lg resize-none"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />

                    <div className="flex items-center mt-3">
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
                            onClick={() => handlePromptSelect(t.deepsearch)}
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
                            onClick={() => handlePromptSelect(t.think)}
                          >
                            <Lightbulb size={16} className="mr-2" />
                            {t.think}
                          </Button>
                        </motion.div>
                      </div>

                      <div className="flex-1"></div>

                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                          opacity: input.trim() ? 1 : 0.5,
                          scale: input.trim() ? 1 : 0.95,
                        }}
                      >
                        <Button
                          type="submit"
                          size="icon"
                          disabled={isLoading || !input.trim()}
                          className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300"
                        >
                          <ArrowUp size={16} />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </form>
              </motion.div>

              {/* Action buttons */}
              <motion.div className="flex justify-center gap-2 flex-wrap" variants={itemVariants}>
                {actions.map((action, index) => (
                  <motion.div
                    key={action.text}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.3 + index * 0.1 },
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300"
                      onClick={() => handlePromptSelect(action.text)}
                    >
                      {action.icon}
                      <span className="ml-2">{action.text}</span>
                    </Button>
                  </motion.div>
                ))}
              </motion.div>

              {/* Terms */}
              <motion.p
                className="text-xs text-center text-muted-foreground/60 mt-10"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 0.6,
                  transition: { delay: 0.8 },
                }}
              >
                {t.terms}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              ref={chatContainerRef}
              className="w-full max-w-3xl mx-auto h-full overflow-y-auto py-4 px-2 chat-container no-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        delay: index * 0.05,
                      }}
                    >
                      <EnhancedChatMessage
                        message={message}
                        language={language}
                        onRegenerate={message.role === "assistant" ? handleRegenerateMessage : undefined}
                        onCopy={handleCopyMessage}
                        isLastMessage={index === messages.length - 1 && message.role === "assistant"}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="max-w-3xl mx-auto py-4"
                  >
                    <div className="inline-block bg-[#2A2B30] rounded-t-2xl rounded-br-2xl rounded-bl-sm p-4">
                      <EnhancedTypingIndicator variant="modern" />
                      
                      <motion.div 
                        className="mt-3 flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStopGeneration}
                          className="bg-red-500/10 hover:bg-red-500/20 text-xs rounded-full px-3 py-1 h-auto"
                        >
                          <span className="mr-1">⏹️</span>
                          {language === "en" ? "Stop generating" : "উৎপাদন বন্ধ করুন"}
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              <AnimatePresence>
                {showScrollButton && (
                  <motion.div
                    className="fixed bottom-24 right-4 z-10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={scrollToBottom}
                      size="icon"
                      className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                    >
                      <ChevronDown size={20} />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected text quick actions */}
              <AnimatePresence>
                {selectedText && (
                  <motion.div
                    className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md rounded-full shadow-lg border border-white/20 p-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleQuickAction("explain")}
                        size="sm"
                        variant="ghost"
                        className="rounded-full hover:bg-white/10"
                      >
                        <BookOpen size={16} className="mr-1" />
                        {t.explain}
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("summarize")}
                        size="sm"
                        variant="ghost"
                        className="rounded-full hover:bg-white/10"
                      >
                        <HelpCircle size={16} className="mr-1" />
                        {t.summarize}
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("translate")}
                        size="sm"
                        variant="ghost"
                        className="rounded-full hover:bg-white/10"
                      >
                        <BarChart3 size={16} className="mr-1" />
                        {t.translate}
                      </Button>
                      <Button
                        onClick={() => handleQuickAction("code")}
                        size="sm"
                        variant="ghost"
                        className="rounded-full hover:bg-white/10"
                      >
                        <Code size={16} className="mr-1" />
                        {t.code}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat input when in chat mode */}
              <motion.div
                className="fixed bottom-0 left-0 right-0 p-4 bg-[#1A1B1E]/80 backdrop-blur-md border-t border-white/5"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <div className="max-w-3xl mx-auto">
                  {isVoiceInputActive ? (
                    <div className="flex items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                      <VoiceInput onTranscription={handleVoiceInput} language={language} />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsVoiceInputActive(false)}
                        className="ml-4 rounded-full"
                      >
                        {t.stopVoice}
                      </Button>
                    </div>
                  ) : (
                    <EnhancedChatInput
                      input={input}
                      handleInputChange={handleInputChange}
                      handleSubmit={handleSubmit}
                      isLoading={isLoading}
                      onVoiceInputToggle={handleVoiceInputToggle}
                      onFileUploadToggle={() => setShowFileUpload(!showFileUpload)}
                      isVoiceInputActive={isVoiceInputActive}
                      language={language}
                      suggestions={actions.map(action => ({ icon: action.icon, text: action.text }))}
                      onSuggestionClick={handlePromptSelect}
                      maxLength={4000}
                    />
                  )}

                  <div className="flex justify-between items-center mt-2">
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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File upload area */}
        <AnimatePresence>
          {showFileUpload && (
            <motion.div
              className="fixed bottom-24 left-0 right-0 p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="max-w-md mx-auto">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onClear={handleFileClear}
                  language={language}
                  selectedFile={selectedFile}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} language={language} />
    </main>
  )
}

