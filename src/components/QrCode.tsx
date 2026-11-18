import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeProps {
  value: string
  size?: number
  className?: string
}

export function QrCode({ value, size = 220, className = '' }: QrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    }).catch(() => setError(true))
  }, [value, size])

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-variant rounded-2xl ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-text-muted text-sm text-center px-4">QR unavailable</span>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`rounded-2xl ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
