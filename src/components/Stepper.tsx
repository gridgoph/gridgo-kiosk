interface StepperProps {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
  size?: 'md' | 'lg'
}

export function Stepper({ value, min = 1, max = 9999, onChange, size = 'md' }: StepperProps) {
  const btnSize = size === 'lg' ? 'min-w-[64px] min-h-[64px] text-2xl' : 'min-w-[44px] min-h-[44px] text-xl'
  const numSize = size === 'lg' ? 'text-2xl font-bold w-16' : 'text-lg font-semibold w-12'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnSize} flex items-center justify-center rounded-xl border border-outline bg-surface hover:bg-surface-variant transition-colors disabled:opacity-30`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`${numSize} text-center text-text-primary select-none`}>{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnSize} flex items-center justify-center rounded-xl border border-outline bg-surface hover:bg-surface-variant transition-colors disabled:opacity-30`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
