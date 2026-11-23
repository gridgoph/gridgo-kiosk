import { useEffect, useState } from 'react'

const STEPS = ['File', 'Settings', 'Pay', 'Print']

export function useClock() {
  const [label, setLabel] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const id = window.setInterval(() => setLabel(formatClock(new Date())), 1000)
    return () => window.clearInterval(id)
  }, [])

  return label
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function FlowHeader({
  title,
  step,
  onBack,
  right,
}: {
  title: string
  step: 1 | 2 | 3 | 4
  onBack?: () => void
  right?: React.ReactNode
}) {
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center gap-3 min-h-[44px]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-surface-variant flex items-center justify-center text-text-primary"
            aria-label="Go back"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <span className="w-11" />
        )}
        <h1 className="flex-1 text-[28px] font-black tracking-tight text-text-primary">{title}</h1>
        {right}
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        {STEPS.map((label, index) => {
          const number = index + 1
          const reached = number <= step
          return (
            <div key={label}>
              <div className={`h-1 rounded-full ${reached ? 'bg-action-yellow' : 'bg-outline'}`} />
              <p className={`mt-1.5 text-[11px] ${number === step ? 'font-bold text-text-primary' : 'text-text-muted'}`}>
                {number} · {label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
