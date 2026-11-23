import { useEffect } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { FlowHeader } from '../components/FlowChrome'
import { useKiosk } from '../store/kiosk'
import { formatPhp } from '../lib/format'

export function Paid() {
  const setScreen = useKiosk((s) => s.setScreen)
  const paymentMethod = useKiosk((s) => s.paymentMethod)
  const total = useKiosk((s) => s.totalMinor())

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen('printing'), 1600)
    return () => window.clearTimeout(timer)
  }, [setScreen])

  return (
    <KioskLayout>
      <FlowHeader title="Pay" step={3} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mt-6 text-5xl font-black tracking-tight">Paid</h2>
        <p className="mt-2 text-2xl font-black">{formatPhp(total)}</p>
        <p className="mt-2 text-sm text-text-secondary">
          {paymentMethod === 'coins' ? 'Coins accepted.' : 'QR payment accepted.'} Printing starts now.
        </p>
      </div>
    </KioskLayout>
  )
}
