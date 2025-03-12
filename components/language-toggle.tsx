"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LanguageToggleProps {
  language: "en" | "bn"
  toggleLanguage: () => void
}

export default function LanguageToggle({ language, toggleLanguage }: LanguageToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={cn(
        "text-xs font-medium rounded-full px-3 floating-element",
        language === "bn" ? "bg-primary/10 text-primary border-primary/20" : "",
      )}
    >
      {language === "en" ? "বাংলা" : "English"}
    </Button>
  )
}

