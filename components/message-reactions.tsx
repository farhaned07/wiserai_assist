"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmilePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

interface MessageReactionsProps {
  messageId: string
}

export default function MessageReactions({ messageId }: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: "👍", count: 0, reacted: false },
    { emoji: "❤️", count: 0, reacted: false },
    { emoji: "😂", count: 0, reacted: false },
    { emoji: "🤔", count: 0, reacted: false },
    { emoji: "👏", count: 0, reacted: false },
    { emoji: "🔥", count: 0, reacted: false },
  ])

  const handleReaction = (index: number) => {
    setReactions((prev) => {
      const newReactions = [...prev]
      if (newReactions[index].reacted) {
        newReactions[index].count = Math.max(0, newReactions[index].count - 1)
        newReactions[index].reacted = false
      } else {
        newReactions[index].count += 1
        newReactions[index].reacted = true
      }
      return newReactions
    })
  }

  const activeReactions = reactions.filter((r) => r.count > 0)

  return (
    <div className="flex items-center gap-1 mt-1">
      <AnimatePresence>
        {activeReactions.map((reaction, index) => (
          <motion.div
            key={reaction.emoji}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2 text-xs rounded-full transition-all",
                reaction.reacted ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted",
              )}
              onClick={() => handleReaction(reactions.findIndex((r) => r.emoji === reaction.emoji))}
            >
              <span className="mr-1">{reaction.emoji}</span>
              {reaction.count}
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-muted/80 transition-colors">
            <SmilePlus size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2 rounded-xl border border-muted-foreground/10" align="end">
          <div className="flex gap-1">
            {reactions.map((reaction, index) => (
              <motion.div key={index} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 w-8 p-0 rounded-full", reaction.reacted && "bg-primary/10 text-primary")}
                  onClick={() => handleReaction(index)}
                >
                  {reaction.emoji}
                </Button>
              </motion.div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

