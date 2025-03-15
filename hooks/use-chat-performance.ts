import { useState, useRef, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'

export function useChatPerformance() {
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [inputDraft, setInputDraft] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Optimized scroll handler with useCallback to prevent recreation on each render
  const handleScroll = useCallback(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainer
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    setShowScrollButton(distanceFromBottom > 200)
  }, [])

  // Debounced input handler to reduce state updates during typing
  const debouncedSetInputDraft = useCallback(
    debounce((value: string) => {
      setInputDraft(value)
      setIsTyping(false)
    }, 300),
    []
  )

  // Optimized input change handler
  const handleOptimizedInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>, originalHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => void) => {
    // Call the original handler for immediate UI update
    originalHandler(e)
    
    // Set typing state immediately
    setIsTyping(true)
    
    // Debounce the actual state update
    debouncedSetInputDraft(e.target.value)
  }, [debouncedSetInputDraft])

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Handle text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim())
      } else {
        setSelectedText("")
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  // Set up scroll event listener
  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    chatContainer.addEventListener('scroll', handleScroll)
    return () => chatContainer.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Cleanup function for abortController
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    showScrollButton,
    selectedText,
    isTyping,
    inputDraft,
    messagesEndRef,
    chatContainerRef,
    abortControllerRef,
    handleOptimizedInputChange,
    scrollToBottom,
    setSelectedText,
  }
} 