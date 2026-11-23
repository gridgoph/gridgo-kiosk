import type { PrinterStatus, ThemeMode } from '../types'
import { useKiosk } from '../store/kiosk'

const STATUS: Record<PrinterStatus, { line: (size: string) => string; dot: string; text: string; name: string }> = {
  online: {
    line: (size) => `Printer ready · ${size}`,
    dot: 'bg-success',
    text: 'text-success',
    name: 'Online',
  },
  offline: {
    line: () => 'Printer offline',
    dot: 'bg-text-muted',
    text: 'text-text-muted',
    name: 'Offline',
  },
  out_of_paper: {
    line: () => 'Out of paper',
    dot: 'bg-warning',
    text: 'text-warning',
    name: 'Out of paper',
  },
  paper_jam: {
    line: () => 'Paper jam',
    dot: 'bg-error',
    text: 'text-error',
    name: 'Paper jam',
  },
}

export function printerReady(status: PrinterStatus, paperCount: number) {
  return status === 'online' && paperCount > 0
}

export function ThemeToggle() {
  const theme = useKiosk((s) => s.theme)
  const setTheme = useKiosk((s) => s.setTheme)

  const options: { id: ThemeMode; label: string }[] = [
    { id: 'auto', label: 'Auto' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ]

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center bg-surface-variant rounded-full p-1">
        {options.map((option) => {
          const selected = theme === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setTheme(option.id)}
              aria-pressed={selected}
              aria-label={option.id === 'light' ? 'Light theme' : option.id === 'dark' ? 'Dark theme' : 'Auto theme'}
              className={`h-9 min-w-9 px-2.5 rounded-full text-sm font-bold flex items-center justify-center ${
                selected ? 'bg-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a]' : 'text-text-secondary'
              }`}
            >
              {option.id === 'light' ? <SunIcon /> : option.id === 'dark' ? <MoonIcon /> : option.label}
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-text-muted pr-1">
        {theme === 'auto' ? 'Auto · Light 6 AM–6 PM' : theme === 'light' ? 'Light' : 'Dark'}
      </p>
    </div>
  )
}

export function PrinterStatusLine() {
  const status = useKiosk((s) => s.printerStatus)
  const paperSize = useKiosk((s) => s.printSettings.paperSize)
  const meta = STATUS[status]

  return (
    <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary" aria-live="polite">
      <span className={`w-2.5 h-2.5 rounded-full ${meta.dot}`} />
      {meta.line(paperSize)}
    </p>
  )
}

export function PaperCounter() {
  const paperCount = useKiosk((s) => s.paperCount)

  return (
    <div className="mt-3" aria-live="polite">
      <p className="text-lg font-black tabular-nums leading-none">{paperCount}</p>
      <p className="text-[11px] text-text-muted mt-0.5">sheets in tray</p>
    </div>
  )
}

export function PrinterStatusText() {
  const status = useKiosk((s) => s.printerStatus)
  const meta = STATUS[status]

  return (
    <div className="px-6 mt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">Printer status</p>
      <p className={`text-sm font-bold ${meta.text}`} aria-live="polite">
        {meta.name}
      </p>
    </div>
  )
}

export function QrPromo({
  src,
  alt,
  title,
  body,
  href,
  hrefLabel,
}: {
  src: string
  alt: string
  title: string
  body: string
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="flex items-center gap-4 bg-surface-variant rounded-3xl p-4">
      <img src={src} alt={alt} className="w-[92px] h-[92px] rounded-xl bg-white object-cover flex-shrink-0" />
      <div className="min-w-0">
        <p className="font-black text-lg leading-tight text-text-primary">{title}</p>
        <p className="text-sm text-text-secondary mt-1 leading-snug">{body}</p>
        {href && hrefLabel && (
          <a href={href} className="inline-block text-sm font-semibold text-text-primary mt-1 underline underline-offset-2">
            {hrefLabel}
          </a>
        )}
      </div>
    </div>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 14.5A8.5 8.5 0 1110.5 3 7 7 0 0021 14.5z" />
    </svg>
  )
}
