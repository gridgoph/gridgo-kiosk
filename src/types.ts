// All TypeScript types for GRIDGO Kiosk

export type Screen =
  | 'welcome'
  | 'print-settings'
  | 'scan-qr'
  | 'file-received'
  | 'start-printing'
  | 'printing-progress'
  | 'confirmation'

export type PageRangeOption = 'all' | 'odd' | 'even' | 'custom'
export type PaperSize = 'A4' | 'Legal' | 'Letter'
export type ColorMode = 'bw' | 'color'

export interface UploadedDocument {
  fileName: string
  fileSize: string
  pageCount: number
}

export interface UploadedReceipt {
  fileName: string
  fileSize: string
  reference?: string
  thumbnailUrl?: string
}

export interface PrintSettings {
  pageRange: PageRangeOption
  customPages: string
  quantity: number
  paperSize: PaperSize
  colorMode: ColorMode
}

export interface KioskOrder {
  id: string
  document?: UploadedDocument
  receipt?: UploadedReceipt
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
