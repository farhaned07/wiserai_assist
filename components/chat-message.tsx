"use client"

import type { Message } from "ai"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import SimpleMarkdownRenderer from "@/components/simple-markdown-renderer"
import MessageReactions from "@/components/message-reactions"
import { useState } from "react"
import { Copy, Check, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatMessageProps {
  message: Message
  language: "en" | "bn"
  isLoading?: boolean
}

export default function ChatMessage({ message, language, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("group flex items-start gap-3 message-enter", isUser ? "flex-row-reverse" : "")}>
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0 select-none",
          isUser ? "bg-user text-user-foreground" : "bg-assistant text-assistant-foreground",
        )}
      >
        <span className="text-xs font-semibold">{isUser ? (language === "en" ? "You" : "আপনি").charAt(0) : "AI"}</span>
      </Avatar>

      <div className={cn("flex flex-col max-w-[85%] md:max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? (language === "en" ? "You" : "আপনি") : language === "en" ? "Bangladesh AI" : "বাংলাদেশ এআই"}
          </span>
        </div>

        <Card
          className={cn(
            "p-3 shadow-sm",
            isUser
              ? "bg-user text-user-foreground rounded-tr-none"
              : "bg-assistant text-assistant-foreground rounded-tl-none",
            "floating-element",
          )}
        >
          <div className="relative">
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <SimpleMarkdownRenderer content={message.content} className="prose prose-sm dark:prose-invert max-w-none" />
            )}

            <div className={cn("absolute top-0 right-0 opacity-0 transition-opacity", "group-hover:opacity-100")}>
              <div className="flex gap-1">
                <button
                  onClick={copyToClipboard}
                  className="p-1 rounded-md hover:bg-background/10"
                  title={language === "en" ? "Copy message" : "বার্তা কপি করুন"}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1 rounded-md hover:bg-background/10"
                      title={language === "en" ? "More options" : "আরও অপশন"}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isUser ? "end" : "start"}>
                    <DropdownMenuItem onClick={copyToClipboard}>
                      {language === "en" ? "Copy text" : "টেক্সট কপি করুন"}
                    </DropdownMenuItem>
                    {!isUser && (
                      <DropdownMenuItem>
                        {language === "en" ? "Regenerate response" : "উত্তর পুনরায় তৈরি করুন"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </Card>

        <MessageReactions messageId={message.id} />
      </div>
    </div>
  )
}

