import type { UploadSessionStatus } from '../types'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let uploadCallCount = 0

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function generateUploadCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function pollUploadSession(_sessionId: string): Promise<UploadSessionStatus> {
  uploadCallCount++
  await delay(3000)
  return {
    status: 'ready',
    fileId: 'file_mock_123',
    reference: '1234567890123',
    thumbnailUrl: null,
  }
}

export function resetPollCount(): void {
  uploadCallCount = 0
}

export function getUploadUrl(sessionId: string, mode: 'file' | 'receipt' | 'portal' = 'portal'): string {
  return `${window.location.origin}/?page=upload&mode=${mode}&session=${sessionId}`
}
