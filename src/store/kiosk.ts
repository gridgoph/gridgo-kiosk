import { create } from 'zustand'
import type {
  Screen,
  KioskOrder,
  KioskSession,
  UploadedDocument,
  UploadedReceipt,
  PrintSettings,
  PageRangeOption,
  PaperSize,
  ColorMode,
} from '../types'
import { generateSessionId, generateUploadCode } from '../lib/session'

interface KioskStore {
  screen: Screen
  order: KioskOrder | null
  session: KioskSession | null
  reference: string
  proofFileId: string

  // Uploaded document and receipt
  document: UploadedDocument | null
  receipt: UploadedReceipt | null

  // Print Settings
  printSettings: PrintSettings

  // Navigation
  setScreen: (s: Screen) => void
  goHome: () => void

  // Document & Receipt actions
  setDocument: (doc: UploadedDocument | null) => void
  setReceipt: (rec: UploadedReceipt | null) => void

  // Settings actions
  setPageRange: (range: PageRangeOption) => void
  setCustomPages: (custom: string) => void
  setQuantity: (qty: number) => void
  setPaperSize: (size: PaperSize) => void
  setColorMode: (mode: ColorMode) => void

  // Order
  setOrder: (o: KioskOrder) => void

  // Proof & Reference
  setReference: (r: string) => void
  setProofFileId: (id: string) => void

  // Session
  refreshSession: () => void

  // Calculations
  computedPagesToPrint: () => number
  totalMinor: () => number
}

function newSession(): KioskSession {
  return {
    sessionId: generateSessionId(),
    uploadCode: generateUploadCode(),
    startedAt: Date.now(),
  }
}

const DEFAULT_SETTINGS: PrintSettings = {
  pageRange: 'all',
  customPages: '',
  quantity: 1,
  paperSize: 'A4',
  colorMode: 'bw',
}

export const useKiosk = create<KioskStore>((set, get) => ({
  screen: 'welcome',
  order: null,
  session: newSession(),
  reference: '',
  proofFileId: '',
  document: null,
  receipt: null,
  printSettings: DEFAULT_SETTINGS,

  setScreen: (s) => set({ screen: s }),

  goHome: () =>
    set({
      screen: 'welcome',
      order: null,
      session: newSession(),
      reference: '',
      proofFileId: '',
      document: null,
      receipt: null,
      printSettings: DEFAULT_SETTINGS,
    }),

  setDocument: (doc) => set({ document: doc }),
  setReceipt: (rec) => set({ receipt: rec }),

  setPageRange: (range) =>
    set((state) => ({
      printSettings: { ...state.printSettings, pageRange: range },
    })),

  setCustomPages: (custom) =>
    set((state) => ({
      printSettings: { ...state.printSettings, customPages: custom },
    })),

  setQuantity: (qty) =>
    set((state) => ({
      printSettings: { ...state.printSettings, quantity: Math.max(1, qty) },
    })),

  setPaperSize: (size) =>
    set((state) => ({
      printSettings: { ...state.printSettings, paperSize: size },
    })),

  setColorMode: (mode) =>
    set((state) => ({
      printSettings: { ...state.printSettings, colorMode: mode },
    })),

  setOrder: (o) => set({ order: o }),
  setReference: (r) => set({ reference: r }),
  setProofFileId: (id) => set({ proofFileId: id }),

  refreshSession: () => set({ session: newSession() }),

  computedPagesToPrint: () => {
    const { document, printSettings } = get()
    // When no document is uploaded yet, estimate based on 1 page or settings
    const total = document?.pageCount ?? 1

    if (printSettings.pageRange === 'all') return total
    if (printSettings.pageRange === 'odd') return Math.max(1, Math.ceil(total / 2))
    if (printSettings.pageRange === 'even') return Math.max(1, Math.floor(total / 2))
    if (printSettings.pageRange === 'custom') {
      const parts = printSettings.customPages.split(',').map((s) => s.trim()).filter(Boolean)
      let count = 0
      for (const part of parts) {
        if (part.includes('-')) {
          const [startStr, endStr] = part.split('-')
          const start = parseInt(startStr, 10)
          const end = parseInt(endStr, 10)
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            count += end - start + 1
          }
        } else if (!isNaN(parseInt(part, 10))) {
          count += 1
        }
      }
      return count > 0 ? count : 1
    }
    return total
  },

  totalMinor: () => {
    const { printSettings } = get()
    const pages = get().computedPagesToPrint()
    // Pricing: Black & white = ₱1.00 (100 minor), Full color = ₱5.00 (500 minor)
    const basePageRateMinor = printSettings.colorMode === 'bw' ? 100 : 500
    // Legal is ₱0.50 more (50 minor)
    const sizeAddonMinor = printSettings.paperSize === 'Legal' ? 50 : 0
    return pages * (basePageRateMinor + sizeAddonMinor) * printSettings.quantity
  },
}))
