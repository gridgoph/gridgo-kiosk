import type { UploadSessionState } from '../types'

interface StatusBadgeProps {
  state: UploadSessionState
}

const CONFIG: Record<UploadSessionState, { icon: string; label: string; color: string; animate?: boolean }> = {
  waiting: {
    icon: '●',
    label: 'Scan QR with your phone to upload',
    color: 'text-text-muted',
    animate: true,
  },
  uploading: {
    icon: '⟳',
    label: 'Uploading…',
    color: 'text-warning',
    animate: true,
  },
  processing: {
    icon: '⟳',
    label: 'Reading reference number…',
    color: 'text-text-secondary',
    animate: true,
  },
  ready: {
    icon: '✓',
    label: 'File received',
    color: 'text-success',
  },
  failed: {
    icon: '✕',
    label: 'Upload failed — try again',
    color: 'text-error',
  },
}

export function StatusBadge({ state }: StatusBadgeProps) {
  const cfg = CONFIG[state]

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${cfg.color}`}>
      <span className={cfg.animate ? 'animate-pulse' : ''}>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </div>
  )
}
