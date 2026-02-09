'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ReloadIcon } from '@radix-ui/react-icons'
import { ImageIcon, X, Upload, Sparkles } from 'lucide-react'

interface AiImageGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onImageGenerated: (imageUrl: string) => void
}

const AiImageGenerator: React.FC<AiImageGeneratorProps> = ({
  isOpen,
  onClose,
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState('')
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddReferenceImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const remainingSlots = 2 - referenceImages.length
    const filesToAdd = Array.from(files).slice(0, remainingSlots)

    filesToAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setReferenceImages((prev) => [...prev, dataUrl])
        setReferenceFiles((prev) => [...prev, file])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index))
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setGeneratedPreview(null)

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image_urls: referenceImages.length > 0 ? referenceImages : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedPreview(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseImage = () => {
    if (generatedPreview) {
      onImageGenerated(generatedPreview)
      handleReset()
      onClose()
    }
  }

  const handleReset = () => {
    setPrompt('')
    setReferenceImages([])
    setReferenceFiles([])
    setError(null)
    setGeneratedPreview(null)
    setIsGenerating(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Image Generator
          </DialogTitle>
          <DialogDescription>
            Generate an image with AI using Nano Banana. You can optionally add up to 2 reference photos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Prompt */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-prompt">Prompt</Label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Reference images */}
          <div className="flex flex-col gap-2">
            <Label>Reference Photos (optional, max 2)</Label>
            <div className="flex gap-3 flex-wrap">
              {referenceImages.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group"
                >
                  <img
                    src={img}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeReferenceImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove reference image ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {referenceImages.length < 2 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
                  disabled={isGenerating}
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAddReferenceImage}
              className="hidden"
              multiple
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-t-foreground animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">Generating your image...</p>
            </div>
          )}

          {/* Generated preview */}
          {generatedPreview && !isGenerating && (
            <div className="flex flex-col gap-2">
              <Label>Generated Image</Label>
              <div className="relative w-full aspect-square max-h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedPreview}
                  alt="Generated"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {generatedPreview ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                Generate Another
              </Button>
              <Button onClick={handleUseImage}>
                <ImageIcon className="mr-2 h-4 w-4" />
                Use This Image
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AiImageGenerator
