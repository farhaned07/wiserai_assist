"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, File, X, ImageIcon, FileText, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onClear: () => void
  language: "en" | "bn"
  selectedFile: File | null
  isUploading: boolean
  uploadProgress: number
  accept?: string
}

export default function FileUpload({
  onFileSelect,
  onClear,
  language,
  selectedFile,
  isUploading,
  uploadProgress,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileType, setFileType] = useState<"all" | "document" | "image">("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const translations = {
    en: {
      dropFiles: "Drop files here or click to upload",
      uploadFile: "Upload File",
      processing: "Processing file...",
      remove: "Remove",
      all: "All Files",
      document: "Document",
      image: "Image",
    },
    bn: {
      dropFiles: "ফাইল এখানে ড্রপ করুন অথবা আপলোড করতে ক্লিক করুন",
      uploadFile: "ফাইল আপলোড করুন",
      processing: "ফাইল প্রসেস করা হচ্ছে...",
      remove: "সরিয়ে ফেলুন",
      all: "সব ফাইল",
      document: "ডকুমেন্ট",
      image: "ছবি",
    },
  }

  const t = translations[language]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (isValidFileType(file)) {
        onFileSelect(file)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (isValidFileType(file)) {
        onFileSelect(file)
      }
    }
  }

  const isValidFileType = (file: File) => {
    if (fileType === "all") return true
    if (fileType === "document" && /\.(pdf|doc|docx|txt)$/i.test(file.name)) return true
    if (fileType === "image" && /\.(jpg|jpeg|png|gif)$/i.test(file.name)) return true
    return false
  }

  const getAcceptString = () => {
    if (fileType === "document") return ".pdf,.doc,.docx,.txt"
    if (fileType === "image") return ".jpg,.jpeg,.png,.gif"
    return accept
  }

  const handleTypeChange = (value: string) => {
    setFileType(value as "all" | "document" | "image")
    if (fileInputRef.current) {
      fileInputRef.current.accept = getAcceptString()
    }
  }

  const getFileIcon = (fileName: string) => {
    if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
      return <ImageIcon className="h-5 w-5 text-primary" />
    } else if (/\.(pdf)$/i.test(fileName)) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (/\.(doc|docx)$/i.test(fileName)) {
      return <FileText className="h-5 w-5 text-blue-500" />
    } else if (/\.(txt)$/i.test(fileName)) {
      return <FileText className="h-5 w-5 text-gray-500" />
    }
    return <File className="h-5 w-5 text-primary" />
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div className="space-y-3">
          <Tabs defaultValue="all" value={fileType} onValueChange={handleTypeChange} className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-xl">
              <TabsTrigger value="all" className="flex items-center gap-1 rounded-xl">
                <FilePlus size={14} />
                <span>{t.all}</span>
              </TabsTrigger>
              <TabsTrigger value="document" className="flex items-center gap-1 rounded-xl">
                <FileText size={14} />
                <span>{t.document}</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1 rounded-xl">
                <ImageIcon size={14} />
                <span>{t.image}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            className={cn(
              "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
              "hover:border-primary/50 hover:bg-primary/5",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept={getAcceptString()}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t.dropFiles}</p>
                <Button size="sm" variant="secondary" className="mt-2 rounded-full">
                  {t.uploadFile}
                </Button>
              </div>
            </label>
          </div>
        </div>
      ) : (
        <Card className="p-3 floating-element">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon(selectedFile.name)}
              <div className="text-sm truncate max-w-[200px]">{selectedFile.name}</div>
            </div>
            {!isUploading && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1 rounded-full" />
              <p className="text-xs text-muted-foreground mt-1">{t.processing}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

