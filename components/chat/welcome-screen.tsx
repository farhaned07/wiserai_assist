import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, Lightbulb, BookOpen, HelpCircle, BarChart3, Code, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"
import AutoResizeTextarea from "@/components/auto-resize-textarea"

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

type WelcomeScreenProps = {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent) => void
  handlePromptSelect: (prompt: string) => void
  isLoading: boolean
  language: "en" | "bn"
}

export default function WelcomeScreen({
  input,
  handleInputChange,
  handleSubmit,
  handlePromptSelect,
  isLoading,
  language,
}: WelcomeScreenProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Translations
  const translations = {
    en: {
      welcome: "Welcome to Onnesha AI",
      helpLine: "How can I assist you today?",
      placeholder: "Ask me anything...",
      deepsearch: "Deep search",
      think: "Think step by step",
      explain: "Explain this",
      summarize: "Summarize",
      translate: "Translate",
      code: "Write code",
      structured: "Structured response",
      terms: "Onnesha AI may produce inaccurate information about people, places, or facts.",
    },
    bn: {
      welcome: "অন্বেষা এআই-তে স্বাগতম",
      helpLine: "আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
      placeholder: "আমাকে যেকোনো প্রশ্ন করুন...",
      deepsearch: "গভীর অনুসন্ধান",
      think: "ধাপে ধাপে চিন্তা করুন",
      explain: "ব্যাখ্যা করুন",
      summarize: "সারাংশ",
      translate: "অনুবাদ করুন",
      code: "কোড লিখুন",
      structured: "কাঠামোগত প্রতিক্রিয়া",
      terms: "অন্বেষা এআই মানুষ, স্থান বা তথ্য সম্পর্কে অসঠিক তথ্য উৎপন্ন করতে পারে।",
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

  return (
    <motion.div
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
            className={`relative bg-white/5 backdrop-blur-md rounded-2xl p-4 border ${
              isFocused ? "border-blue-500/30" : "border-white/10"
            } transition-all duration-300`}
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
  )
} 