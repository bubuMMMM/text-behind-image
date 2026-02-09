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

const ASPECT_RATIOS = [
  { label: '1:1', value: 'square' },
  { label: '16:9', value: 'landscape_16_9' },
  { label: '9:16', value: 'portrait_9_16' },
  { label: '4:3', value: 'landscape_4_3' },
  { label: '3:4', value: 'portrait_3_4' },
]

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
  const [aspectRatio, setAspectRatio] = useState('square')
  const [referenceImages, setReferenceImages] = useState<string[]>([])
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
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index))
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
          aspect_ratio: aspectRatio,
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
    setAspectRatio('square')
    setReferenceImages([])
    setError(null)
    setGeneratedPreview(null)
    setIsGenerating(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4" />
            AI Image Generator
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Generate images using Nano Banana. Optionally add up to 2 reference photos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Prompt */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ai-prompt" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prompt</Label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aspect Ratio</Label>
            <div className="flex gap-2 flex-wrap">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  disabled={isGenerating}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                    aspectRatio === ratio.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference images */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference Photos (optional, max 2)</Label>
            <div className="flex gap-2 flex-wrap">
              {referenceImages.map((img, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeReferenceImage(index)}
                    className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm text-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove reference image ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {referenceImages.length < 2 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground hover:text-foreground transition-colors"
                  disabled={isGenerating}
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-[10px]">Add</span>
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
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-lg border border-border bg-muted/30">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-muted" />
                <div className="absolute inset-0 rounded-full border-2 border-t-foreground animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground">Generating your image...</p>
            </div>
          )}

          {/* Generated preview */}
          {generatedPreview && !isGenerating && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Result</Label>
              <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedPreview}
                  alt="Generated"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {generatedPreview ? (
            <>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Generate Another
              </Button>
              <Button size="sm" onClick={handleUseImage} className="gap-2">
                <ImageIcon className="h-3.5 w-3.5" />
                Use This Image
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <ReloadIcon className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
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
