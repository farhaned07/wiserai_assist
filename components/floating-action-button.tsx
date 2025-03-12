"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, X, Lightbulb, Sparkles, Newspaper, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  language: "en" | "bn"
  onPromptSelect: (prompt: string) => void
}

export default function FloatingActionButton({ language, onPromptSelect }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const translations = {
    en: {
      suggestions: "Quick Prompts",
      news: "What's happening in Bangladesh today?",
      idea: "Give me a business idea for Bangladesh",
      facts: "Tell me an interesting fact about Bangladesh",
      chat: "Let's have a casual conversation",
    },
    bn: {
      suggestions: "দ্রুত প্রম্পট",
      news: "আজ বাংলাদেশে কী ঘটছে?",
      idea: "বাংলাদেশের জন্য একটি ব্যবসার ধারণা দিন",
      facts: "বাংলাদেশ সম্পর্কে একটি আকর্ষণীয় তথ্য বলুন",
      chat: "আসুন একটি অনানুষ্ঠানিক কথোপকথন করি",
    },
  }

  const t = translations[language]

  const prompts = [
    { icon: <Newspaper size={16} />, text: t.news },
    { icon: <Lightbulb size={16} />, text: t.idea },
    { icon: <Sparkles size={16} />, text: t.facts },
    { icon: <Coffee size={16} />, text: t.chat },
  ]

  const handlePromptClick = (prompt: string) => {
    onPromptSelect(prompt)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {isOpen && (
        <Card className="p-3 mb-3 w-64 animate-fade-up floating-element">
          <h3 className="text-sm font-medium mb-2">{t.suggestions}</h3>
          <div className="space-y-2">
            {prompts.map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto py-2 rounded-xl"
                onClick={() => handlePromptClick(prompt.text)}
              >
                <span className="flex items-center gap-2">
                  {prompt.icon}
                  <span className="text-sm">{prompt.text}</span>
                </span>
              </Button>
            ))}
          </div>
        </Card>
      )}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg fab-container",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </Button>
    </div>
  )
}

