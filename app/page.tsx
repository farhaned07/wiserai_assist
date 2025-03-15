"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useChat } from "ai/react"
import { BookOpen, HelpCircle, BarChart3, Code, Lightbulb } from "lucide-react"
import FileUpload from "@/components/file-upload"
import PaymentModal from "@/components/payment-modal"
import VoiceInput from "@/components/voice-input"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useChatPerformance } from "@/hooks/use-chat-performance"

// Import our new components
import WelcomeScreen from "@/components/chat/welcome-screen"
import ChatInterface from "@/components/chat/chat-interface"
import ChatHeader from "@/components/chat/chat-header"

export default function ChatPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [language, setLanguage] = useState<"en" | "bn">("bn")
  const [showWelcome, setShowWelcome] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Use our custom performance hook
  const {
    showScrollButton,
    selectedText,
    isTyping,
    inputDraft,
    messagesEndRef,
    chatContainerRef,
    abortControllerRef,
    handleOptimizedInputChange,
    scrollToBottom,
    setSelectedText,
  } = useChatPerformance()

  // Memoize translations to prevent recreation on each render
  const translations = useMemo(() => ({
    en: {
      explain: "Explain this",
      summarize: "Summarize",
      translate: "Translate",
      code: "Write code",
      structured: "Structured response",
      deepsearch: "Deep search",
      think: "Think step by step",
    },
    bn: {
      explain: "ব্যাখ্যা করুন",
      summarize: "সারাংশ",
      translate: "অনুবাদ করুন",
      code: "কোড লিখুন",
      structured: "কাঠামোগত প্রতিক্রিয়া",
      deepsearch: "গভীর অনুসন্ধান",
      think: "ধাপে ধাপে চিন্তা করুন",
    },
  }), [])

  const t = translations[language]

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

  // Optimized input change handler
  const handleOptimizedChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleOptimizedInputChange(e, handleInputChange)
  }, [handleInputChange, handleOptimizedInputChange])

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

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "bn" : "en")
  }, [language])

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
  }, [])

  const handleFileClear = useCallback(() => {
    setSelectedFile(null)
    setUploadProgress(0)
  }, [])

  const handleFileUpload = useCallback(async () => {
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
  }, [selectedFile, language, append, toast])

  const handleVoiceInput = useCallback((transcript: string) => {
    handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLTextAreaElement>)
    setIsVoiceInputActive(false)
  }, [handleInputChange])

  const handleVoiceInputToggle = useCallback(() => {
    setIsVoiceInputActive(!isVoiceInputActive)
  }, [isVoiceInputActive])

  const handleFileUploadToggle = useCallback(() => {
    setShowFileUpload(!showFileUpload)
  }, [showFileUpload])

  const handleClearChat = useCallback(() => {
    setMessages([])
    setShowWelcome(true)
  }, [setMessages])

  const handleCopyMessage = useCallback((content: string) => {
    toast({
      title: language === "en" ? "Copied to clipboard" : "ক্লিপবোর্ডে কপি করা হয়েছে",
      description:
        language === "en"
          ? "The message has been copied to your clipboard."
          : "বার্তাটি আপনার ক্লিপবোর্ডে কপি করা হয়েছে।",
    })
  }, [language, toast])

  const handleRegenerateMessage = useCallback(() => {
    reload()
  }, [reload])

  const handlePromptSelect = useCallback((prompt: string) => {
    // For structured response, add a prefix if it's just the button text
    if (prompt === t.structured) {
      prompt = language === "en" 
        ? "Provide a structured response about " 
        : "এটি সম্পর্কে একটি কাঠামোগত প্রতিক্রিয়া দিন ";
    }
    
    handleInputChange({ target: { value: prompt } } as React.ChangeEvent<HTMLTextAreaElement>)
  }, [t, language, handleInputChange])

  // Handle quick actions on selected text
  const handleQuickAction = useCallback((action: string) => {
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
  }, [selectedText, language, handleInputChange, setSelectedText])

  return (
    <main className="flex flex-col h-screen bg-[#1A1B1E] overflow-hidden">
      {/* Header Component */}
      <ChatHeader 
            language={language} 
        toggleLanguage={toggleLanguage}
        setShowPaymentModal={setShowPaymentModal}
        setShowSettingsDialog={setShowSettingsDialog}
        showSettingsDialog={showSettingsDialog}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <WelcomeScreen
              input={input}
              handleInputChange={handleOptimizedChange}
              handleSubmit={handleSubmit}
              handlePromptSelect={handlePromptSelect}
              isLoading={isLoading}
              language={language}
            />
          ) : (
            <ChatInterface
              messages={messages}
              input={input}
              handleInputChange={handleOptimizedChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              language={language}
              handleRegenerateMessage={handleRegenerateMessage}
              handleCopyMessage={handleCopyMessage}
              handlePromptSelect={handlePromptSelect}
              handleVoiceInputToggle={handleVoiceInputToggle}
              handleFileUploadToggle={handleFileUploadToggle}
              isVoiceInputActive={isVoiceInputActive}
              handleClearChat={handleClearChat}
              handleQuickAction={handleQuickAction}
              selectedText={selectedText}
            />
          )}
        </AnimatePresence>

        {/* Voice Input Component */}
        <AnimatePresence>
          {isVoiceInputActive && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-md p-6 bg-background rounded-2xl shadow-xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                      <VoiceInput onTranscription={handleVoiceInput} language={language} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File Upload Modal */}
        <AnimatePresence>
          {showFileUpload && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFileUpload(false)}
            >
              <motion.div
                className="w-full max-w-md p-6 bg-background rounded-2xl shadow-xl"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <FileUpload
                  onFileSelect={handleFileSelect}
                  onClear={handleFileClear}
                  language={language}
                  selectedFile={selectedFile}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                />
                {selectedFile && !isUploading && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={handleFileUpload} className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2">
                      {language === "en" ? "Process File" : "ফাইল প্রসেস করুন"}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Modal */}
      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} language={language} />
    </main>
  )
}

