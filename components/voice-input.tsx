"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

// Add TypeScript declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: {
    [key: number]: {
      isFinal: boolean
      [key: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new(): SpeechRecognition
    }
  }
}

interface VoiceInputProps {
  onTranscription: (text: string) => void
  language: "en" | "bn"
}

export default function VoiceInput({ onTranscription, language }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const translations = {
    en: {
      listening: "Listening...",
      notSupported: "Speech recognition not supported",
      error: "Error occurred. Please try again.",
      tapToSpeak: "Tap to speak",
    },
    bn: {
      listening: "শুনছি...",
      notSupported: "স্পিচ রিকগনিশন সমর্থিত নয়",
      error: "ত্রুটি ঘটেছে। আবার চেষ্টা করুন।",
      tapToSpeak: "কথা বলতে ট্যাপ করুন",
    },
  }

  const t = translations[language]

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = language === "bn" ? "bn-BD" : "en-US"

    recognitionRef.current.onresult = (event: any) => {
      const current = event.resultIndex
      const result = event.results[current]
      const transcriptText = result[0].transcript
      setTranscript(transcriptText)
      
      if (result.isFinal) {
        onTranscription(transcriptText)
        stopListening()
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setError(t.error)
      stopListening()
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, onTranscription, t.error])

  const startListening = () => {
    setError(null)
    setTranscript("")
    setIsListening(true)
    recognitionRef.current?.start()
  }

  const stopListening = () => {
    setIsListening(false)
    recognitionRef.current?.stop()
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button variant="ghost" size="icon" disabled title={t.notSupported}>
          <MicOff size={20} />
        </Button>
        <p className="text-sm text-muted-foreground">{t.notSupported}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={isListening ? stopListening : startListening}
          className={isListening ? "text-red-500 animate-pulse" : ""}
        >
          {isListening ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Mic size={20} />
          )}
        </Button>
      </motion.div>
      {isListening && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          {t.listening}
        </motion.p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
      {transcript && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground max-w-md text-center"
        >
          {transcript}
        </motion.p>
      )}
    </div>
  )
}

