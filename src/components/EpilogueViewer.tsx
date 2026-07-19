import { useEffect, useState } from 'react'

interface EpilogueViewerProps {
  outcome: string
  onRestart: () => void
}

export function EpilogueViewer({ outcome, onRestart }: EpilogueViewerProps) {
  const [step, setStep] = useState(0)

  // Map outcome to a sequence of text and images
  const sequences: Record<string, { text: string; image?: string }[]> = {
    'harvey-saved': [
      { text: "You saved him. But Gotham saw the monster he could have been." },
      { text: "Harvey Dent survived the night, his face intact, but his reputation scarred forever." },
      { text: "The city will never look at him the same way. Neither will Gilda." }
    ],
    'wrong-ending': [
      { text: "You let the coin decide." },
      { text: "Harvey Dent is dead. Two-Face was born in the flames of the courthouse." },
      { text: "Gotham lost its White Knight. You lost your best friend." }
    ],
    'city-falls': [
      { text: "The Joker's infection spread too fast. The GCPD was overwhelmed." },
      { text: "Poison Ivy's vines tore down the bridges. Harley Quinn danced in the ashes." },
      { text: "Gotham belongs to the freaks now." }
    ],
    'default': [
      { text: "The night is over. But the war for Gotham never ends." },
      { text: "You survived, but at what cost?" }
    ]
  }

  const currentSequence = sequences[outcome] || sequences['default']

  useEffect(() => {
    if (step < currentSequence.length - 1) {
      const timer = setTimeout(() => {
        setStep(prev => prev + 1)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [step, currentSequence])

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center text-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-red-900/5 mix-blend-overlay animate-flicker pointer-events-none" />
      <div className="absolute inset-0 crt-overlay opacity-30 pointer-events-none" />
      
      <div 
        key={step} 
        className="max-w-2xl animate-fade-in-slow"
      >
        <p className="font-serif text-2xl md:text-4xl text-primary/90 leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          {currentSequence[step].text}
        </p>
      </div>

      {step === currentSequence.length - 1 && (
        <button 
          onClick={onRestart}
          className="mt-16 animate-fade-in px-8 py-3 border border-red-900/50 text-red-500 font-mono tracking-[0.3em] uppercase text-xs hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          Initialize New Sequence
        </button>
      )}
    </div>
  )
}
