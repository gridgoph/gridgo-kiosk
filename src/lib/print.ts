import type { PrintSettings } from '../types'

export function pagesToPrint(pageCount: number, settings: PrintSettings): number {
  const total = pageCount > 0 ? pageCount : 1

  if (settings.pageRange === 'all') return total
  if (settings.pageRange === 'odd') return Math.max(1, Math.ceil(total / 2))
  if (settings.pageRange === 'even') return Math.max(1, Math.floor(total / 2))
  if (settings.pageRange === 'custom') {
    const parts = settings.customPages.split(',').map((s) => s.trim()).filter(Boolean)
    let count = 0
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-')
        const start = parseInt(startStr, 10)
        const end = parseInt(endStr, 10)
        if (!isNaN(start) && !isNaN(end) && end >= start) count += end - start + 1
      } else if (!isNaN(parseInt(part, 10))) {
        count += 1
      }
    }
    return count > 0 ? count : 1
  }
  return total
}

export function sheetsNeeded(pageCount: number, settings: PrintSettings): number {
  const pages = pagesToPrint(pageCount, settings)
  const perCopy = settings.sides === 'two' ? Math.ceil(pages / 2) : pages
  return perCopy * Math.max(1, settings.quantity)
}

export function priceMinor(
  pageCount: number,
  settings: PrintSettings,
  rates: { bw: number; color: number } = { bw: 100, color: 500 },
): number {
  const pages = pagesToPrint(pageCount, settings)
  const rate = settings.colorMode === 'bw' ? rates.bw : rates.color
  return pages * rate * settings.quantity
}

export function jobSummary(pageCount: number, settings: PrintSettings): string {
  const pages = pagesToPrint(pageCount, settings)
  const color = settings.colorMode === 'bw' ? 'B&W' : 'Color'
  const sides = settings.sides === 'two' ? '2 sides' : '1 side'
  return `${pages} pages × ${settings.quantity} · ${color} · ${sides}`
}

export function layoutCaption(layout: PrintSettings['layout']): string {
  if (layout === 'fit') return 'Shrinks or grows the page to fill the paper. Nothing is cut.'
  if (layout === 'actual') return 'Prints at the file’s real size on the paper.'
  return 'Prints at real size, lined up with the top-left of the paper.'
}
