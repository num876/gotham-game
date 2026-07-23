"use client"

import { useState } from 'react'
import Image from 'next/image'

interface DynamicPortraitProps {
  characterId: string
  characterName: string
  className?: string
}

export function DynamicPortrait({ characterId, characterName, className = "" }: DynamicPortraitProps) {
  const [src, setSrc] = useState(`/characters/${characterId}.png`)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleError = async () => {
    // Prevent multiple API calls for the same missing image
    if (isGenerating || src !== `/characters/${characterId}.png`) return
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, characterName })
      })
      
      if (response.ok) {
        // Force an image reload by appending a timestamp
        setSrc(`/characters/${characterId}.png?t=${Date.now()}`)
      } else {
        // Fallback to empty source so it doesn't keep looping
        setSrc('')
      }
    } catch (e) {
      console.error("Failed to generate portrait", e)
      setSrc('')
    } finally {
      setIsGenerating(false)
    }
  }

  // If source is definitively empty (generation failed), show empty state
  if (!src) return <div className={`bg-surface ${className}`} />

  return (
    <div className={`relative ${className} bg-surface overflow-hidden`}>
      <Image 
        src={src} 
        alt={characterName} 
        fill
        className={`object-cover opacity-100 transition-all duration-700 ${isGenerating ? 'opacity-30 scale-105 blur-sm' : ''}`} 
        onError={handleError}
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-alert/30 animate-pulse rounded-full blur-md" />
        </div>
      )}
    </div>
  )
}
