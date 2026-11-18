import { useEffect, useState } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { useKiosk } from '../store/kiosk'

export function PrintingProgress() {
  const setScreen = useKiosk((s) => s.setScreen)
  const document = useKiosk((s) => s.document)
  const printSettings = useKiosk((s) => s.printSettings)
  const computedPagesToPrint = useKiosk((s) => s.computedPagesToPrint)

  const totalPages = computedPagesToPrint() * printSettings.quantity

  const [progress, setProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const totalDuration = 5000 // 5 seconds simulation
    const intervalTime = 100
    const step = 100 / (totalDuration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step
        const cur = Math.min(totalPages, Math.ceil((next / 100) * totalPages))
        setCurrentPage(cur)

        if (next >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setScreen('confirmation')
          }, 600)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [setScreen, totalPages])

  return (
    <KioskLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        {/* Animated Printer Graphics */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-outline border-t-action-yellow animate-spin" />
          <div className="absolute flex flex-col items-center justify-center text-text-primary">
            <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
        </div>

        {/* Live Status Text */}
        <h1 className="text-3xl font-black text-text-primary mb-2 text-center">
          Printing your documents…
        </h1>
        <p className="text-base text-text-secondary mb-6 text-center">
          Printing page <span className="font-bold text-text-primary">{currentPage}</span> of <span className="font-bold text-text-primary">{totalPages}</span>
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-surface-variant rounded-full h-4 overflow-hidden mb-3 border-2 border-outline p-0.5">
          <div
            className="h-full bg-action-yellow rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm font-black text-text-muted mb-8">{Math.round(progress)}% completed</p>

        {/* Specs Pill */}
        <div className="border border-outline rounded-2xl p-4 bg-surface w-full flex items-center justify-around text-center shadow-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted">Paper</p>
            <p className="text-sm font-bold text-text-primary">{printSettings.paperSize}</p>
          </div>
          <div className="w-px h-8 bg-outline-subtle" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted">Color</p>
            <p className="text-sm font-bold text-text-primary">
              {printSettings.colorMode === 'bw' ? 'Black & White' : 'Full Color'}
            </p>
          </div>
          <div className="w-px h-8 bg-outline-subtle" />
          <div>
            <p className="text-[11px] uppercase tracking-wider text-text-muted">File</p>
            <p className="text-sm font-bold text-text-primary truncate max-w-[100px]">
              {document?.fileName ?? 'Document'}
            </p>
          </div>
        </div>
      </div>
    </KioskLayout>
  )
}

