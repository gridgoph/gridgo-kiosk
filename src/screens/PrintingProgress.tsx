import { useEffect, useState } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { FlowHeader } from '../components/FlowChrome'
import { useKiosk } from '../store/kiosk'
import { pagesToPrint } from '../lib/print'

export function PrintingProgress() {
  const setScreen = useKiosk((s) => s.setScreen)
  const document = useKiosk((s) => s.document)
  const printSettings = useKiosk((s) => s.printSettings)
  const paperCount = useKiosk((s) => s.paperCount)
  const consumePaperForCurrentJob = useKiosk((s) => s.consumePaperForCurrentJob)

  const pages = pagesToPrint(document?.pageCount ?? 1, printSettings) * printSettings.quantity
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    consumePaperForCurrentJob()
  }, [consumePaperForCurrentJob])

  useEffect(() => {
    if (currentPage >= pages) {
      const timer = window.setTimeout(() => setScreen('confirmation'), 700)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setCurrentPage((page) => page + 1), Math.max(120, Math.min(700, 4200 / pages)))
    return () => window.clearTimeout(timer)
  }, [currentPage, pages, setScreen])

  return (
    <KioskLayout>
      <FlowHeader title="Print" step={4} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-28 h-28 rounded-full bg-surface-variant flex items-center justify-center text-text-primary">
          <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="animate-pulse">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-black">Printing</h2>
        <p className="mt-2 text-base text-text-secondary">
          Page <span className="font-bold text-text-primary">{currentPage}</span> of{' '}
          <span className="font-bold text-text-primary">{pages}</span>
        </p>

        <div className="mt-8 w-full border border-outline rounded-2xl p-4 grid grid-cols-3 text-center">
          <Spec label="Paper" value={printSettings.paperSize} />
          <Spec label="Color" value={printSettings.colorMode === 'bw' ? 'B&W' : 'Color'} />
          <Spec label="Sheets left" value={String(paperCount)} />
        </div>
        <p className="mt-4 text-sm text-text-muted truncate max-w-full">{document?.fileName ?? 'Document'}</p>
      </div>
    </KioskLayout>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  )
}
