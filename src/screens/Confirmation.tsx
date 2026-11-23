import { useEffect, useState } from 'react'
import { KioskLayout, YellowCTA } from '../components/KioskLayout'
import { FlowHeader } from '../components/FlowChrome'
import { QrPromo } from '../components/MachineStatus'
import { useKiosk } from '../store/kiosk'
import { pagesToPrint, sheetsNeeded } from '../lib/print'

const RESET_SECONDS = 30

export function Confirmation() {
  const goHome = useKiosk((s) => s.goHome)
  const document = useKiosk((s) => s.document)
  const printSettings = useKiosk((s) => s.printSettings)
  const paperCount = useKiosk((s) => s.paperCount)
  const [countdown, setCountdown] = useState(RESET_SECONDS)

  const pages = pagesToPrint(document?.pageCount ?? 1, printSettings) * printSettings.quantity
  const sheets = sheetsNeeded(document?.pageCount ?? 1, printSettings)

  useEffect(() => {
    if (countdown <= 0) {
      goHome()
      return
    }
    const id = window.setInterval(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearInterval(id)
  }, [countdown, goHome])

  return (
    <KioskLayout>
      <FlowHeader title="Print" step={4} />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-20 h-20 rounded-full bg-success/10 border-4 border-success flex items-center justify-center">
            <svg width="40" height="40" fill="none" stroke="rgb(var(--success))" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-black">Printing finished</h2>
          <p className="mt-1 text-sm text-text-muted">
            {pages} {pages === 1 ? 'page is' : 'pages are'} ready. {sheets} {sheets === 1 ? 'sheet' : 'sheets'} used. {paperCount} left in the tray.
          </p>
        </div>

        <div className="mt-5 rounded-3xl bg-action-yellow/25 border-4 border-action-yellow p-5 text-center">
          <h3 className="text-xl font-black">Take the printed paper below</h3>
          <p className="text-sm text-text-secondary mt-1">Collect every page from the output slot under this screen.</p>
        </div>

        <div className="mt-4 space-y-3">
          <QrPromo
            src="/qr-feedback.jpg"
            alt="QR code for print feedback"
            title="How was your print?"
            body="Scan this QR to leave feedback."
          />
          <QrPromo
            src="/qr-download.jpg"
            alt="QR code to download the GRIDGO app"
            title="No app yet?"
            body="Scan with your phone camera to get GRIDGO. Android and iPhone."
            href="https://gridgo.talasora.com/download"
            hrefLabel="gridgo.talasora.com/download"
          />
        </div>
      </div>

      <div className="px-5 pb-6 pt-2">
        <YellowCTA label="Finished" onClick={goHome} />
        <p className="text-center text-xs text-text-muted mt-3">Next customer in {countdown}s</p>
      </div>
    </KioskLayout>
  )
}
