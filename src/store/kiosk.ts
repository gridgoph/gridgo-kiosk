import { create } from 'zustand'
import type {
  Screen,
  KioskOrder,
  KioskSession,
  UploadedDocument,
  PrintSettings,
  PageRangeOption,
  PaperSize,
  ColorMode,
  SideMode,
  LayoutMode,
  PrinterStatus,
  ThemeMode,
  PaymentMethod,
} from '../types'
import { generateSessionId, generateUploadCode } from '../lib/session'
import { pagesToPrint, priceMinor, sheetsNeeded } from '../lib/print'
import { adjustMachine, type RemoteMachine } from '../lib/kioskApi'

const MACHINE_KEY = 'gridgo-kiosk-machine'

interface MachineState {
  paperCount: number
  printerStatus: PrinterStatus
  theme: ThemeMode
  priceBwMinor: number
  priceColorMinor: number
  paymentQrTemplate: string
  paymentQrEnabled: boolean
  publicBaseUrl: string
}

interface KioskStore extends MachineState {
  screen: Screen
  order: KioskOrder | null
  session: KioskSession | null
  reference: string
  proofFileId: string
  orderCode: string
  paymentMethod: PaymentMethod
  coinsInsertedMinor: number
  refDigits: string
  paperConsumed: boolean

  document: UploadedDocument | null
  printSettings: PrintSettings

  setScreen: (s: Screen) => void
  goHome: () => void
  continueToPay: () => void

  setDocument: (doc: UploadedDocument | null) => void

  setPageRange: (range: PageRangeOption) => void
  setCustomPages: (custom: string) => void
  setQuantity: (qty: number) => void
  setPaperSize: (size: PaperSize) => void
  setColorMode: (mode: ColorMode) => void
  setSides: (sides: SideMode) => void
  setLayout: (layout: LayoutMode) => void
  setPreviewConfirmed: (confirmed: boolean) => void

  setOrder: (o: KioskOrder) => void
  setReference: (r: string) => void
  setProofFileId: (id: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setRefDigits: (digits: string) => void
  insertCoin: (minor: number) => void

  setTheme: (theme: ThemeMode) => void
  consumePaperForCurrentJob: () => void
  applyMachine: (machine: RemoteMachine) => void
  setCoinsInserted: (amount: number) => void

  refreshSession: () => void

  computedPagesToPrint: () => number
  totalMinor: () => number
  sheetsForJob: () => number
}

function newSession(): KioskSession {
  return {
    sessionId: generateSessionId(),
    uploadCode: generateUploadCode(),
    startedAt: Date.now(),
  }
}

function makeOrderCode(): string {
  return 'K-' + Math.floor(100000 + Math.random() * 900000).toString()
}

const DEFAULT_SETTINGS: PrintSettings = {
  pageRange: 'all',
  customPages: '',
  quantity: 1,
  paperSize: 'A4',
  colorMode: 'bw',
  sides: 'one',
  layout: 'fit',
  previewConfirmed: false,
}

const DEFAULT_QR = 'https://gridgo.ph/pay?amount={amount}&order={order}&session={session}'

function loadMachine(): MachineState {
  const fallback: MachineState = {
    paperCount: 240,
    printerStatus: 'online',
    theme: 'auto',
    priceBwMinor: 100,
    priceColorMinor: 500,
    paymentQrTemplate: DEFAULT_QR,
    paymentQrEnabled: true,
    publicBaseUrl: '',
  }
  try {
    const raw = localStorage.getItem(MACHINE_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw) as Partial<MachineState>
    const paperCount = Number.isFinite(data.paperCount)
      ? Math.max(0, Math.min(2000, Number(data.paperCount)))
      : fallback.paperCount
    const printerStatus: PrinterStatus =
      data.printerStatus === 'offline' ||
      data.printerStatus === 'out_of_paper' ||
      data.printerStatus === 'paper_jam' ||
      data.printerStatus === 'online'
        ? data.printerStatus
        : fallback.printerStatus
    const theme: ThemeMode =
      data.theme === 'light' || data.theme === 'dark' || data.theme === 'auto' ? data.theme : fallback.theme
    const priceBwMinor = Number.isFinite(data.priceBwMinor) ? Math.max(0, Number(data.priceBwMinor)) : fallback.priceBwMinor
    const priceColorMinor = Number.isFinite(data.priceColorMinor) ? Math.max(0, Number(data.priceColorMinor)) : fallback.priceColorMinor
    const paymentQrTemplate = typeof data.paymentQrTemplate === 'string' && data.paymentQrTemplate
      ? data.paymentQrTemplate
      : fallback.paymentQrTemplate
    const paymentQrEnabled = data.paymentQrEnabled !== false
    const publicBaseUrl = typeof data.publicBaseUrl === 'string' ? data.publicBaseUrl : ''
    return { paperCount, printerStatus, theme, priceBwMinor, priceColorMinor, paymentQrTemplate, paymentQrEnabled, publicBaseUrl }
  } catch {
    return fallback
  }
}

function patchSettings(partial: Partial<PrintSettings>) {
  return (state: KioskStore) => ({
    printSettings: {
      ...state.printSettings,
      ...partial,
      previewConfirmed: false,
    },
  })
}

const machine = loadMachine()

export const useKiosk = create<KioskStore>((set, get) => ({
  screen: 'welcome',
  order: null,
  session: newSession(),
  reference: '',
  proofFileId: '',
  orderCode: '',
  paymentMethod: machine.paymentQrEnabled ? 'qr' : 'coins',
  coinsInsertedMinor: 0,
  refDigits: '',
  paperConsumed: false,
  document: null,
  printSettings: DEFAULT_SETTINGS,
  paperCount: machine.paperCount,
  printerStatus: machine.printerStatus,
  theme: machine.theme,
  priceBwMinor: machine.priceBwMinor,
  priceColorMinor: machine.priceColorMinor,
  paymentQrTemplate: machine.paymentQrTemplate,
  paymentQrEnabled: machine.paymentQrEnabled,
  publicBaseUrl: machine.publicBaseUrl,

  setScreen: (s) => set({ screen: s }),

  goHome: () =>
    set((state) => ({
      screen: 'welcome',
      order: null,
      session: newSession(),
      reference: '',
      proofFileId: '',
      orderCode: '',
      paymentMethod: state.paymentQrEnabled ? 'qr' : 'coins',
      coinsInsertedMinor: 0,
      refDigits: '',
      paperConsumed: false,
      document: null,
      printSettings: DEFAULT_SETTINGS,
    })),

  continueToPay: () =>
    set((state) => ({
      screen: 'pay',
      orderCode: state.orderCode || makeOrderCode(),
    })),

  setDocument: (doc) => set({ document: doc }),

  setPageRange: (range) => set(patchSettings({ pageRange: range })),
  setCustomPages: (custom) => set(patchSettings({ customPages: custom })),
  setQuantity: (qty) => set(patchSettings({ quantity: Math.max(1, qty) })),
  setPaperSize: (size) => set(patchSettings({ paperSize: size })),
  setColorMode: (mode) => set(patchSettings({ colorMode: mode })),
  setSides: (sides) => set(patchSettings({ sides })),
  setLayout: (layout) => set(patchSettings({ layout })),
  setPreviewConfirmed: (previewConfirmed) =>
    set((state) => ({
      printSettings: { ...state.printSettings, previewConfirmed },
    })),

  setOrder: (o) => set({ order: o }),
  setReference: (r) => set({ reference: r }),
  setProofFileId: (id) => set({ proofFileId: id }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setRefDigits: (digits) => set({ refDigits: digits.replace(/\D/g, '').slice(0, 4) }),
  insertCoin: (minor) =>
    set((state) => ({ coinsInsertedMinor: state.coinsInsertedMinor + Math.max(0, minor) })),

  setTheme: (theme) => set({ theme }),

  consumePaperForCurrentJob: () => {
    const state = get()
    if (state.paperConsumed) return
    const sheets = sheetsNeeded(state.document?.pageCount ?? 1, state.printSettings)
    const paperCount = Math.max(0, state.paperCount - sheets)
    set({
      paperConsumed: true,
      paperCount,
      printerStatus: paperCount === 0 ? 'out_of_paper' : state.printerStatus,
    })
    void adjustMachine({ paperDelta: -sheets }).then((result) => get().applyMachine(result.machine)).catch(() => {})
  },

  applyMachine: (machine) =>
    set({
      paperCount: machine.paperCount,
      printerStatus: machine.printerStatus,
      priceBwMinor: machine.priceBwMinor,
      priceColorMinor: machine.priceColorMinor,
      paymentQrTemplate: machine.paymentQrTemplate,
      paymentQrEnabled: machine.paymentQrEnabled !== false,
      ...(machine.paymentQrEnabled === false ? { paymentMethod: 'coins' as const } : {}),
      publicBaseUrl: machine.publicBaseUrl || '',
    }),

  setCoinsInserted: (coinsInsertedMinor) => set({ coinsInsertedMinor: Math.max(0, coinsInsertedMinor) }),

  refreshSession: () => set({ session: newSession(), document: null }),

  computedPagesToPrint: () => pagesToPrint(get().document?.pageCount ?? 1, get().printSettings),
  totalMinor: () =>
    priceMinor(get().document?.pageCount ?? 1, get().printSettings, {
      bw: get().priceBwMinor,
      color: get().priceColorMinor,
    }),
  sheetsForJob: () => sheetsNeeded(get().document?.pageCount ?? 1, get().printSettings),
}))

useKiosk.subscribe((state) => {
  const snapshot: MachineState = {
    paperCount: state.paperCount,
    printerStatus: state.printerStatus,
    theme: state.theme,
    priceBwMinor: state.priceBwMinor,
    priceColorMinor: state.priceColorMinor,
    paymentQrTemplate: state.paymentQrTemplate,
    paymentQrEnabled: state.paymentQrEnabled,
    publicBaseUrl: state.publicBaseUrl,
  }
  localStorage.setItem(MACHINE_KEY, JSON.stringify(snapshot))
})
