import { useEffect, useState } from 'react'
import { KioskLayout, YellowCTA } from '../components/KioskLayout'
import { useKiosk } from '../store/kiosk'

const RESET_SECONDS = 30

export function Confirmation() {
  const goHome = useKiosk((s) => s.goHome)
  const printSettings = useKiosk((s) => s.printSettings)
  const computedPagesToPrint = useKiosk((s) => s.computedPagesToPrint)
  const [countdown, setCountdown] = useState(RESET_SECONDS)

  const totalDispensed = computedPagesToPrint() * printSettings.quantity

  useEffect(() => {
    if (countdown <= 0) {
      goHome()
      return
    }
    const id = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [countdown, goHome])

  return (
    <KioskLayout>
      <div className="flex-1 flex flex-col items-center justify-between px-7 pt-12 pb-8">
        <div className="w-full flex flex-col items-center">
          {/* Animated Green Badge */}
          <div className="w-24 h-24 rounded-full bg-success/10 border-4 border-success flex items-center justify-center mb-4 shadow-md">
            <svg width="52" height="52" fill="none" stroke="#2e7d32" strokeWidth="3.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-text-primary text-center mb-1">
            Printing Finished!
          </h1>
          <p className="text-sm text-text-muted text-center mb-6">
            All {totalDispensed} {totalDispensed === 1 ? 'page has' : 'pages have'} been printed and dispensed.
          </p>

          {/* Attention Takeaway Panel */}
          <div className="w-full bg-action-yellow/25 border-4 border-action-yellow rounded-3xl p-6 mb-6 text-center flex flex-col items-center shadow-md">
            <div className="w-16 h-16 bg-action-yellow rounded-full flex items-center justify-center text-text-primary mb-3 shadow animate-bounce">
              <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-1">
              Take the printed paper below
            </h2>
            <p className="text-sm font-medium text-text-secondary">
              Please take all your pages from the paper output slot directly under this terminal.
            </p>
          </div>

          {/* Security Status Box */}
          <div className="w-full p-4 rounded-2xl bg-surface-variant border border-outline flex items-center gap-3">
            <span className="text-2xl">🧹</span>
            <div className="text-left">
              <p className="text-xs font-bold text-text-primary">File Cleaned From Machine</p>
              <p className="text-[11px] text-text-muted">
                Your uploaded file has been permanently deleted from this kiosk. Nothing is saved.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="w-full flex flex-col gap-3 pt-6">
          <YellowCTA
            label="Finished / Done"
            onClick={goHome}
          />
          <p className="text-center text-xs text-text-muted">
            Auto-resetting for next user in {countdown}s…
          </p>
        </div>
      </div>
    </KioskLayout>
  )
}
