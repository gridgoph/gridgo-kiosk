import type { PrinterStatus, UploadedDocument } from '../types'

export interface RemoteMachine {
  paperCount: number
  printerStatus: PrinterStatus
  priceBwMinor: number
  priceColorMinor: number
  paymentQrTemplate: string
  paymentQrEnabled: boolean
  publicBaseUrl: string
}

export interface RemoteSession {
  sessionId: string
  status: 'waiting' | 'ready' | 'failed'
  document: UploadedDocument | null
  revision: number
  coinsInsertedMinor: number
  pay: { active: boolean; totalMinor: number; orderCode: string } | null
}

async function send<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : 'The kiosk service did not answer.')
  }
  return data as T
}

export function getMachine() {
  return send<{ machine: RemoteMachine }>('/api/kiosk/machine')
}

export function adjustMachine(patch: { paperDelta?: number; printerStatus?: PrinterStatus }) {
  return send<{ machine: RemoteMachine }>('/api/kiosk/machine/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export function openSession(sessionId: string) {
  return send<{ session: RemoteSession }>('/api/kiosk/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
}

export function readSession(sessionId: string) {
  return send<{ session: RemoteSession }>(`/api/kiosk/sessions/${sessionId}`)
}

export function clearSessionFile(sessionId: string) {
  return send<{ session: RemoteSession }>(`/api/kiosk/sessions/${sessionId}/clear`, {
    method: 'POST',
  })
}

export function uploadSessionFile(sessionId: string, file: File) {
  const body = new FormData()
  body.set('file', file)
  return send<{ session: RemoteSession }>(`/api/kiosk/sessions/${sessionId}/file`, {
    method: 'POST',
    body,
  })
}

export function setPaySession(sessionId: string, patch: { active: boolean; totalMinor: number; orderCode: string }) {
  return send<{ session: RemoteSession }>(`/api/kiosk/sessions/${sessionId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
}

export function insertScreenCoin(sessionId: string, denominationMinor: number) {
  return send<{ session: RemoteSession }>(`/api/kiosk/sessions/${sessionId}/coins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ denominationMinor, eventId: crypto.randomUUID() }),
  })
}

export function paymentQrValue(template: string, amountMinor: number, orderCode: string, sessionId: string) {
  const amount = (amountMinor / 100).toFixed(2)
  const source = template || 'https://gridgo.ph/pay?amount={amount}&order={order}&session={session}'
  return source
    .split('{amountMinor}').join(String(amountMinor))
    .split('{amount}').join(amount)
    .split('{order}').join(orderCode)
    .split('{session}').join(sessionId)
}
