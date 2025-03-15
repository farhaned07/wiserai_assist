/**
 * Performance optimization utilities for the Wiser AI application
 */

/**
 * Throttle function to limit the rate at which a function can fire
 * @param func The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  let lastFunc: ReturnType<typeof setTimeout> | null = null
  let lastRan: number = 0

  return function(this: any, ...args: Parameters<T>): void {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      lastRan = Date.now()
      inThrottle = true
      
      setTimeout(() => {
        inThrottle = false
        if (lastFunc) {
          clearTimeout(lastFunc)
          lastFunc = null
        }
      }, limit)
    } else {
      if (lastFunc) clearTimeout(lastFunc)
      
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

/**
 * Debounce function to delay invoking a function until after a specified wait period
 * @param func The function to debounce
 * @param wait The wait time in milliseconds
 * @param immediate Whether to invoke the function immediately
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function(this: any, ...args: Parameters<T>): void {
    const context = this
    const later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }

    const callNow = immediate && !timeout
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func.apply(context, args)
  }
}

/**
 * Memoize function to cache the results of expensive function calls
 * @param func The function to memoize
 * @returns A memoized function
 */
export function memoize<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>()

  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }

    const result = func.apply(this, args)
    cache.set(key, result)
    return result
  }
}

/**
 * RAF (requestAnimationFrame) throttle for smooth animations
 * @param callback The callback function to throttle
 * @returns A throttled function using requestAnimationFrame
 */
export function rafThrottle<T extends (...args: any[]) => any>(callback: T): (...args: Parameters<T>) => void {
  let requestId: number | null = null

  return function(this: any, ...args: Parameters<T>): void {
    const context = this
    
    if (requestId) return
    
    requestId = requestAnimationFrame(() => {
      callback.apply(context, args)
      requestId = null
    })
  }
}

/**
 * Lazy load images to improve initial page load performance
 * @param imageElement The image element to lazy load
 * @param src The source URL of the image
 */
export function lazyLoadImage(imageElement: HTMLImageElement, src: string): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        imageElement.src = src
        observer.disconnect()
      }
    })
  }, { rootMargin: '100px' })
  
  observer.observe(imageElement)
}

/**
 * Batch DOM updates to reduce layout thrashing
 * @param updates An array of update functions
 */
export function batchDomUpdates(updates: (() => void)[]): void {
  // Read phase - force layout
  document.body.offsetHeight
  
  // Write phase - batch updates
  updates.forEach(update => update())
}

/**
 * Create a web worker for CPU-intensive tasks
 * @param workerFunction The function to run in the worker
 * @returns A function that returns a Promise with the worker result
 */
export function createWorker<T, R>(workerFunction: (data: T) => R): (data: T) => Promise<R> {
  const workerBlob = new Blob(
    [`self.onmessage = function(e) { self.postMessage((${workerFunction.toString()})(e.data)) }`],
    { type: 'application/javascript' }
  )
  
  const workerUrl = URL.createObjectURL(workerBlob)
  const worker = new Worker(workerUrl)
  
  return function(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data)
      }
      
      worker.onerror = (e) => {
        reject(e)
      }
      
      worker.postMessage(data)
    })
  }
} 