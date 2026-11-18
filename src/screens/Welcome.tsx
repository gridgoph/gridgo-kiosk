import { useEffect, useState } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { useKiosk } from '../store/kiosk'

const WORDS = [
  'School work',
  'Paper work',
  'Documents',
  'Sheets and IDs',
]

export function Welcome() {
  const setScreen = useKiosk((s) => s.setScreen)

  // Typewriter effect state
  const [wordIndex, setWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = WORDS[wordIndex]
    const typingSpeed = isDeleting ? 40 : 80
    const pauseTime = isDeleting ? 300 : 1500

    if (!isDeleting && displayedText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseTime)
      return () => clearTimeout(timeout)
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % WORDS.length)
      return
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting ? currentWord.substring(0, prev.length - 1) : currentWord.substring(0, prev.length + 1)
      )
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, wordIndex])

  return (
    <KioskLayout>
      <div className="flex flex-col flex-1 items-center justify-between px-8 py-14">
        {/* Logo area */}
        <div className="w-full flex flex-col items-center justify-center gap-4 mt-6">
          <img
            src="/gridgo-mark-light.svg"
            alt="GRIDGO Mark"
            className="w-24 h-24 object-contain animate-pulse"
          />

          <div className="flex items-baseline gap-0 select-none">
            <span className="text-6xl font-black tracking-tight leading-none text-text-primary">
              GRID
            </span>
            <span
              className="text-6xl font-black tracking-tight leading-none"
              style={{ color: '#ffde58' }}
            >
              GO
            </span>
          </div>
          <span className="text-xs uppercase tracking-widest font-black text-text-muted bg-surface-variant px-3 py-1 rounded-full border border-outline">
            Instant Print Vendo
          </span>
        </div>

        {/* Dynamic Typewriter text */}
        <div className="w-full text-center my-auto flex flex-col items-center justify-center min-h-[140px]">
          <p className="text-lg font-medium text-text-secondary mb-2">
            Print your
          </p>
          <div className="min-h-[56px] flex items-center justify-center">
            <h1 className="text-4xl font-black text-text-primary tracking-tight">
              {displayedText}
              <span className="inline-block w-1 h-9 ml-1 bg-action-yellow animate-ping align-middle" />
            </h1>
          </div>
          <p className="text-sm text-text-muted mt-3">
            Fast, private self-service printing directly from your phone.
          </p>
        </div>

        {/* Big Touch to start button */}
        <div className="w-full flex flex-col items-center gap-4">
          <button
            onClick={() => setScreen('print-settings')}
            className="w-full min-h-[72px] bg-action-yellow text-action-on rounded-3xl text-2xl font-black shadow-lg hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-action-yellow-on/10"
          >
            <span>Touch to start</span>
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <p className="text-xs text-text-muted tracking-wide">
            Touch anywhere or tap button · No login required
          </p>
        </div>

        {/* Footer */}
        <div className="mt-4">
          <p className="text-xs text-text-muted text-center tracking-wide">
            GRIDGO Kiosk · Davao City
          </p>
        </div>
      </div>
    </KioskLayout>
  )
}
