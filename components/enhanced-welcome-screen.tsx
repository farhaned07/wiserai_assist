"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Lightbulb, BookOpen, HelpCircle, BarChart3, Image, Code, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"

interface EnhancedWelcomeScreenProps {
  language: "en" | "bn"
  onSuggestionClick?: (suggestion: string) => void
}

export default function EnhancedWelcomeScreen({ language, onSuggestionClick }: EnhancedWelcomeScreenProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const translations = {
    en: {
      welcome: "Welcome to Wiser.",
      helpLine: "How can I help you today?",
      deepsearch: "DeepSearch",
      think: "Think",
      research: "Research",
      howto: "How to",
      analyze: "Analyze",
      createImages: "Create images",
      code: "Code",
      terms: "By messaging Wiser, you agree to our Terms and Privacy Policy.",
    },
    bn: {
      welcome: "ওয়াইজারে স্বাগতম।",
      helpLine: "আমি আপনাকে আজ কীভাবে সাহায্য করতে পারি?",
      deepsearch: "ডিপসার্চ",
      think: "চিন্তা",
      research: "গবেষণা",
      howto: "কিভাবে",
      analyze: "বিশ্লেষণ",
      createImages: "ছবি তৈরি",
      code: "কোড",
      terms: "ওয়াইজারকে মেসেজ করে, আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হচ্ছেন।",
    },
  }

  const t = translations[language]

  const actions = [
    { icon: <BookOpen size={18} />, text: t.research },
    { icon: <HelpCircle size={18} />, text: t.howto },
    { icon: <BarChart3 size={18} />, text: t.analyze },
    { icon: <Code size={18} />, text: t.code },
  ]

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div
        className="text-center space-y-3 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-semibold text-foreground">{t.welcome}</h1>
        <p className="text-2xl text-muted-foreground">{t.helpLine}</p>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          <div className="flex gap-2 absolute left-4 bottom-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full bg-background/10 hover:bg-background/20 backdrop-blur-sm"
              onClick={() => onSuggestionClick?.(t.deepsearch)}
            >
              <Search size={16} className="mr-2" />
              {t.deepsearch}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-full bg-background/10 hover:bg-background/20 backdrop-blur-sm"
              onClick={() => onSuggestionClick?.(t.think)}
            >
              <Lightbulb size={16} className="mr-2" />
              {t.think}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 bottom-4 h-8 w-8 rounded-full bg-background/10 hover:bg-background/20 backdrop-blur-sm"
          >
            <ArrowUp size={16} />
          </Button>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {actions.map((action) => (
            <Button
              key={action.text}
              variant="ghost"
              size="sm"
              className="h-8 rounded-full bg-background/5 hover:bg-background/10"
              onClick={() => onSuggestionClick?.(action.text)}
            >
              {action.icon}
              <span className="ml-2">{action.text}</span>
            </Button>
          ))}
        </div>

        <p className="text-xs text-center text-muted-foreground/60 mt-8">{t.terms}</p>
      </motion.div>
    </div>
  )
}

