import { useEffect, useState } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { PaperCounter, PrinterStatusLine, PrinterStatusText, QrPromo, ThemeToggle, printerReady } from '../components/MachineStatus'
import { useKiosk } from '../store/kiosk'

const WORDS = ['School work', 'Paper work', 'Documents', 'Sheets and IDs']

export function Welcome() {
  const setScreen = useKiosk((s) => s.setScreen)
  const printerStatus = useKiosk((s) => s.printerStatus)
  const paperCount = useKiosk((s) => s.paperCount)
  const ready = printerReady(printerStatus, paperCount)

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
      <div className="flex flex-col flex-1">
        <div className="px-6 pt-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] text-text-secondary">GRIDGO Kiosk · Davao</p>
            <PrinterStatusLine />
            <PaperCounter />
          </div>
          <ThemeToggle />
        </div>

        <PrinterStatusText />

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
          <img src="/gridgo-mark-light.svg" alt="" className="w-20 h-20 object-contain dark:bg-white dark:rounded-3xl dark:p-2" />
          <div className="mt-3 flex items-baseline select-none">
            <span className="text-5xl font-black tracking-tight leading-none">GRID</span>
            <span className="text-5xl font-black tracking-tight leading-none text-action-yellow">GO</span>
          </div>
          <p className="mt-6 text-sm text-text-secondary">Print your</p>
          <h1 className="min-h-[48px] text-4xl font-black tracking-tight">
            {displayedText}
            <span className="inline-block w-1 h-8 ml-1 bg-action-yellow align-middle" />
          </h1>
          <button
            type="button"
            disabled={!ready}
            onClick={() => setScreen('scan-qr')}
            className="mt-8 w-full min-h-[72px] bg-action-yellow text-action-on rounded-3xl text-2xl font-black disabled:opacity-40"
          >
            {ready ? 'Touch to start' : 'Printer unavailable'}
          </button>
          <p className="mt-3 text-xs text-text-muted text-center">
            {ready ? 'Scan a QR next to send your file from your phone.' : 'Set the printer to online and add paper to start.'}
          </p>
        </div>

        <div className="px-5 pb-6">
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
    </KioskLayout>
  )
}
