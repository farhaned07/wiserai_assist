import { useCallback, useRef } from 'react'

export function useDoubleTap(
  callback: () => void,
  threshold = 300
) {
  const lastTap = useRef<number>(0)

  const handleDoubleTap = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      const now = Date.now()
      const timeSinceLastTap = now - lastTap.current

      if (timeSinceLastTap < threshold && timeSinceLastTap > 0) {
        callback()
      }

      lastTap.current = now
    },
    [callback, threshold]
  )

  return {
    onClick: handleDoubleTap,
    onTouchEnd: handleDoubleTap
  }
} 