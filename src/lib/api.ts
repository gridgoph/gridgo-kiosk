import type { KioskOrder, UploadedDocument, PrintSettings } from '../types'

const API_BASE = '/api'

export async function createOrder(
  document: UploadedDocument,
  settings: PrintSettings,
  totalMinor: number,
): Promise<KioskOrder> {
  // Stubbed — in production would POST /orders
  await new Promise((r) => setTimeout(r, 500))
  return {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    document,
    settings,
    totalMinor,
    status: 'awaiting_initial_payment',
  }
}

export async function submitPayment(
  orderId: string,
  reference: string,
  proofFileId: string,
): Promise<void> {
  // POST /orders/:id/payments/initial/submit
  await new Promise((r) => setTimeout(r, 600))
  console.log('Payment submitted', { orderId, reference, proofFileId, method: 'qr_manual' })
}

export async function uploadFile(_file: File, _purpose: string): Promise<string> {
  // POST /files?purpose=payment_proof
  await new Promise((r) => setTimeout(r, 800))
  return 'file_mock_' + Math.random().toString(36).substring(2, 8)
}

export async function getPaymentQrUrl(): Promise<string> {
  // GET /public/payment-qr — returns JPEG
  return `${API_BASE}/public/payment-qr`
}
