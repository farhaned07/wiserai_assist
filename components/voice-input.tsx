"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"

interface VoiceInputProps {
  onTranscription: (text: string) => void
  language: "en" | "bn"
}

export default function VoiceInput({ onTranscription, language }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)

  const translations = {
    en: {
      listening: "Listening...",
      notSupported: "Speech recognition not supported",
    },
    bn: {
      listening: "শুনছি...",
      notSupported: "স্পিচ রিকগনিশন সমর্থিত নয়",
    },
  }

  const t = translations[language]

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false)
    }
  }, [])

  const toggleListening = () => {
    if (!isSupported) return

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const startListening = () => {
    setIsListening(true)
    setTranscript("")

    // This is a simplified implementation
    // In a production app, you'd use a more robust speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = language === "bn" ? "bn-BD" : "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const result = event.results[current]
      const transcriptText = result[0].transcript
      setTranscript(transcriptText)
    }

    recognition.onend = () => {
      if (transcript) {
        onTranscription(transcript)
      }
      setIsListening(false)
    }

    recognition.start()

    // For demo purposes, automatically stop after 5 seconds
    setTimeout(() => {
      recognition.stop()
    }, 5000)
  }

  const stopListening = () => {
    setIsListening(false)
    // In a real implementation, you would call recognition.stop() here
  }

  if (!isSupported) {
    return (
      <Button variant="ghost" size="icon" disabled title={t.notSupported}>
        <MicOff size={20} />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleListening} className={isListening ? "text-red-500" : ""}>
      {isListening ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
    </Button>
  )
}

