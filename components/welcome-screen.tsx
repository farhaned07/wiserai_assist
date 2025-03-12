"use client"

import { Card } from "@/components/ui/card"
import { MessageSquare, Lightbulb, BookOpen, Briefcase, Sparkles, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeScreenProps {
  language: "en" | "bn"
  onSuggestionClick?: (suggestion: string) => void
}

export default function WelcomeScreen({ language, onSuggestionClick }: WelcomeScreenProps) {
  const translations = {
    en: {
      welcome: "Welcome to Bangladesh AI",
      description: "Your AI assistant optimized for Bangla and English. Ask me anything!",
      suggestions: "Try asking about:",
      suggestion1: "Tell me about the history of Bangladesh",
      suggestion2: "How can I start a small business in Dhaka?",
      suggestion3: "Explain quantum computing in simple terms",
      suggestion4: "Write a poem about the beauty of Bangladesh",
      suggestion5: "What are the top tourist spots in Bangladesh?",
      suggestion6: "Give me a recipe for traditional Bengali food",
    },
    bn: {
      welcome: "বাংলাদেশ এআই-তে স্বাগতম",
      description: "বাংলা এবং ইংরেজির জন্য অপটিমাইজ করা আপনার এআই সহকারী। আমাকে যেকোনো কিছু জিজ্ঞাসা করুন!",
      suggestions: "এই বিষয়ে জিজ্ঞাসা করে দেখুন:",
      suggestion1: "বাংলাদেশের ইতিহাস সম্পর্কে বলুন",
      suggestion2: "ঢাকায় একটি ছোট ব্যবসা কীভাবে শুরু করব?",
      suggestion3: "সহজ ভাষায় কোয়ান্টাম কম্পিউটিং ব্যাখ্যা করুন",
      suggestion4: "বাংলাদেশের সৌন্দর্য নিয়ে একটি কবিতা লিখুন",
      suggestion5: "বাংলাদেশের শীর্ষ পর্যটন স্পটগুলি কী কী?",
      suggestion6: "ঐতিহ্যবাহী বাঙালি খাবারের রেসিপি দিন",
    },
  }

  const t = translations[language]

  const suggestions = [
    { icon: <MessageSquare size={16} />, text: t.suggestion1, color: "bg-blue-100 dark:bg-blue-900" },
    { icon: <Briefcase size={16} />, text: t.suggestion2, color: "bg-green-100 dark:bg-green-900" },
    { icon: <Lightbulb size={16} />, text: t.suggestion3, color: "bg-yellow-100 dark:bg-yellow-900" },
    { icon: <BookOpen size={16} />, text: t.suggestion4, color: "bg-purple-100 dark:bg-purple-900" },
    { icon: <Globe size={16} />, text: t.suggestion5, color: "bg-indigo-100 dark:bg-indigo-900" },
    { icon: <Sparkles size={16} />, text: t.suggestion6, color: "bg-pink-100 dark:bg-pink-900" },
  ]

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-4 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary">{t.welcome}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <div className="w-full space-y-4">
        <p className="text-sm font-medium text-center">{t.suggestions}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className={cn("p-3 hover:bg-accent transition-colors cursor-pointer floating-element", suggestion.color)}
              onClick={() => handleSuggestionClick(suggestion.text)}
            >
              <div className="flex items-center gap-2">
                {suggestion.icon}
                <span className="text-sm">{suggestion.text}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

