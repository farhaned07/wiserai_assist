"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Crown, Sparkles, Menu, Settings, User, HelpCircle, Bell } from "lucide-react"
import LanguageToggle from "@/components/language-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface EnhancedHeaderProps {
  language: "en" | "bn"
  toggleLanguage: () => void
  theme: string
  toggleTheme: () => void
  onUpgradeClick: () => void
  onSettingsClick?: () => void
  onHelpClick?: () => void
  hasNotifications?: boolean
}

export default function EnhancedHeader({
  language,
  toggleLanguage,
  theme,
  toggleTheme,
  onUpgradeClick,
  onSettingsClick,
  onHelpClick,
  hasNotifications = false,
}: EnhancedHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const translations = {
    en: {
      title: "Wiser",
      upgrade: "Upgrade",
      settings: "Settings",
      help: "Help & FAQ",
      profile: "Profile",
      notifications: "Notifications",
      menu: "Menu",
      darkMode: "Dark Mode",
      language: "Language",
    },
    bn: {
      title: "ওয়াইজার",
      upgrade: "আপগ্রেড",
      settings: "সেটিংস",
      help: "সাহায্য ও প্রশ্নোত্তর",
      profile: "প্রোফাইল",
      notifications: "বিজ্ঞপ্তি",
      menu: "মেনু",
      darkMode: "ডার্ক মোড",
      language: "ভাষা",
    },
  }

  const t = translations[language]

  return (
    <header className="border-b p-3 flex justify-between items-center shadow-sm bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] sm:w-[300px]">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-foreground">{t.title}</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  onUpgradeClick()
                  setIsMobileMenuOpen(false)
                }}
              >
                <Crown size={16} className="text-primary" />
                <span>{t.upgrade}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  if (onSettingsClick) onSettingsClick()
                  setIsMobileMenuOpen(false)
                }}
              >
                <Settings size={16} />
                <span>{t.settings}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  if (onHelpClick) onHelpClick()
                  setIsMobileMenuOpen(false)
                }}
              >
                <HelpCircle size={16} />
                <span>{t.help}</span>
              </Button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.darkMode}</span>
                  <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">{t.language}</span>
                  <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="md:hidden flex items-center">
        <Sparkles className="h-5 w-5 text-primary mr-1" />
        <h1 className="text-lg font-bold text-foreground">{t.title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <LanguageToggle language={language} toggleLanguage={toggleLanguage} />

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative"
            onClick={onHelpClick}
            aria-label="Help and FAQ"
          >
            <HelpCircle size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full relative"
            onClick={onSettingsClick}
            aria-label="Settings"
          >
            <Settings size={20} />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notifications">
            <Bell size={20} />
            {hasNotifications && <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>}
          </Button>
        </div>

        <Button variant="outline" size="sm" className="gap-1 hidden md:flex" onClick={onUpgradeClick}>
          <Crown size={16} className="text-primary" />
          <span>{t.upgrade}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="hidden md:flex">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.profile}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t.settings}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onHelpClick}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>{t.help}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

