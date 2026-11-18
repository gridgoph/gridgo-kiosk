import { useEffect, useState } from 'react'
import { formatCountdown } from '../lib/format'

interface TimerProps {
  seconds: number
  onExpire?: () => void
  className?: string
}

export function Timer({ seconds: initial, onExpire, className = '' }: TimerProps) {
  const [remaining, setRemaining] = useState(initial)

  useEffect(() => {
    setRemaining(initial)
  }, [initial])

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.()
      return
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [remaining, onExpire])

  const isUrgent = remaining <= 60

  return (
    <span className={`font-mono font-semibold ${isUrgent ? 'text-error' : 'text-text-secondary'} ${className}`}>
      {formatCountdown(remaining)} remaining
    </span>
  )
}
