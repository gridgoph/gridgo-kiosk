// All TypeScript types for GRIDGO Kiosk

export type Screen =
  | 'welcome'
  | 'scan-qr'
  | 'print-settings'
  | 'pay'
  | 'paid'
  | 'printing'
  | 'confirmation'

export type PageRangeOption = 'all' | 'odd' | 'even' | 'custom'
export type PaperSize = 'A4' | 'Legal' | 'Letter'
export type ColorMode = 'bw' | 'color'
export type SideMode = 'one' | 'two'
export type LayoutMode = 'fit' | 'actual' | 'actual-top-left'
export type PrinterStatus = 'online' | 'offline' | 'out_of_paper' | 'paper_jam'
export type ThemeMode = 'auto' | 'light' | 'dark'
export type PaymentMethod = 'qr' | 'coins'

export interface UploadedDocument {
  fileName: string
  fileSize: string
  pageCount: number
  mime?: string
}

export interface PrintSettings {
  pageRange: PageRangeOption
  customPages: string
  quantity: number
  paperSize: PaperSize
  colorMode: ColorMode
  sides: SideMode
  layout: LayoutMode
  previewConfirmed: boolean
}

export interface KioskOrder {
  id: string
  document?: UploadedDocument
  settings: PrintSettings
  totalMinor: number
  status: 'awaiting_initial_payment' | 'initial_payment_review' | 'payment_authorized'
}

export type UploadSessionState = 'waiting' | 'uploading' | 'processing' | 'ready' | 'failed'

export interface UploadSessionStatus {
  status: UploadSessionState
  fileId?: string
  reference?: string
  thumbnailUrl: string | null
}

export interface KioskSession {
  sessionId: string
  uploadCode: string
  startedAt: number
}
