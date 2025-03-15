import { useState, useEffect, RefObject } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  containerRef: RefObject<HTMLElement>
  threshold?: number
}

export function usePullToRefresh({
  onRefresh,
  containerRef,
  threshold = 80
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullProgress, setPullProgress] = useState(0)
  const [startY, setStartY] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    let pulling = false

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0) {
        pulling = true
        setStartY(e.touches[0].clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return

      const y = e.touches[0].clientY
      const delta = y - startY

      if (delta > 0) {
        e.preventDefault()
        const progress = Math.min(delta / threshold, 1)
        setIsPulling(true)
        setPullProgress(progress)
      }
    }

    const handleTouchEnd = async () => {
      if (!pulling) return

      pulling = false
      if (pullProgress >= 1) {
        await onRefresh()
      }
      setIsPulling(false)
      setPullProgress(0)
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [containerRef, threshold, onRefresh, pullProgress])

  return { isPulling, pullProgress }
} 