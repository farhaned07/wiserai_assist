"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface ImageCarouselProps {
  images: string[]
  alt?: string
}

export default function ImageCarousel({ images, alt = "Image" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1
    const newIndex = isLastImage ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="relative rounded-md overflow-hidden mt-2 mb-3">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              <img
                src={images[0] || "/placeholder.svg"}
                alt={alt}
                className="w-full h-auto rounded-md object-cover max-h-[300px]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <img
              src={images[0] || "/placeholder.svg"}
              alt={alt}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="relative rounded-md overflow-hidden mt-2 mb-3">
      <div className="relative">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              <img
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`${alt} ${currentIndex + 1}`}
                className="w-full h-auto rounded-md object-cover max-h-[300px]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <img
              src={images[currentIndex] || "/placeholder.svg"}
              alt={`${alt} ${currentIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>

        <Button
          variant="secondary"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
        >
          <ChevronLeft size={16} />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="flex justify-center gap-1 mt-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30",
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}

