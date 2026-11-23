import { useKiosk } from '../store/kiosk'

interface KioskLayoutProps {
  children: React.ReactNode
  className?: string
}

export function KioskLayout({ children, className = '' }: KioskLayoutProps) {

  return (
    <div className="min-h-screen bg-canvas flex items-start justify-center">
      <div className={`w-full max-w-[540px] min-h-screen bg-surface flex flex-col relative ${className}`}>
        {children}
      </div>
    </div>
  )
}

interface TopBarProps {
  title?: string
  onBack?: () => void
  rightSlot?: React.ReactNode
}

export function TopBar({ title, onBack, rightSlot }: TopBarProps) {
  return (
    <div className="flex items-center px-5 pt-6 pb-4 gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="min-h-[56px] min-w-[56px] flex items-center justify-center rounded-xl hover:bg-surface-variant transition-colors -ml-2"
          aria-label="Go back"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {title && <h1 className="flex-1 text-xl font-bold text-text-primary">{title}</h1>}
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </div>
  )
}

export function CartChip() {
  const document = useKiosk((s) => s.document)
  const setScreen = useKiosk((s) => s.setScreen)

  if (!document) return null

  return (
    <button
      onClick={() => setScreen('scan-qr')}
      className="flex items-center gap-1.5 bg-text-primary text-white text-xs font-semibold px-3 py-1.5 rounded-full min-h-[36px]"
    >
      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
      1 File
    </button>
  )
}

export function YellowCTA({
  label,
  onClick,
  disabled = false,
  className = '',
}: {
  label: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full min-h-[56px] bg-action-yellow text-action-on font-bold text-lg rounded-2xl transition-opacity ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-95 active:scale-[0.98]'
      } ${className}`}
    >
      {label}
    </button>
  )
}
