import { useEffect, useState } from 'react'

type PreviewKind = 'image' | 'pdf' | 'docx' | 'text' | 'none'

function previewKind(fileName: string, mime?: string): PreviewKind {
  const type = (mime || '').split(';')[0].trim().toLowerCase()
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (type === 'image/svg+xml' || ext === 'svg') return 'none'
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image'
  if (type === 'application/pdf' || ext === 'pdf') return 'pdf'
  if (type.includes('wordprocessingml') || ext === 'docx') return 'docx'
  if (type.startsWith('text/') || ext === 'txt') return 'text'
  return 'none'
}

function fileUrl(sessionId: string, stamp: string) {
  return `/api/kiosk/sessions/${encodeURIComponent(sessionId)}/file?v=${encodeURIComponent(stamp)}`
}

export function FileViewer({
  sessionId,
  fileName,
  mime,
  stamp,
}: {
  sessionId: string
  fileName: string
  mime?: string
  stamp: string
}) {
  const src = fileUrl(sessionId, stamp)
  const kind = previewKind(fileName, mime)

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-outline bg-white">
      <div className="h-[440px] bg-[#f3f3f3]">
        {kind === 'image' && <ImagePreview src={src} fileName={fileName} />}
        {kind === 'pdf' && (
          <iframe title={fileName} src={src} className="h-full w-full bg-white" />
        )}
        {kind === 'docx' && <DocxPreview src={src} />}
        {kind === 'text' && <TextPreview src={src} />}
        {kind === 'none' && (
          <p className="flex h-full items-center justify-center px-6 text-center text-sm text-[#666]">
            This file can be printed. A preview is not available for this type.
          </p>
        )}
      </div>
    </div>
  )
}

function ImagePreview({ src, fileName }: { src: string; fileName: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Missing />
  return (
    <img
      src={src}
      alt={fileName}
      onError={() => setFailed(true)}
      className="h-full w-full object-contain"
    />
  )
}

function TextPreview({ src }: { src: string }) {
  const [text, setText] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let stop = false
    setText(null)
    setFailed(false)
    void fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error('missing')
        return response.text()
      })
      .then((body) => {
        if (!stop) setText(body.slice(0, 20000))
      })
      .catch(() => {
        if (!stop) setFailed(true)
      })
    return () => {
      stop = true
    }
  }, [src])

  if (failed) return <Missing />
  if (text == null) return <Waiting />
  return <pre className="h-full overflow-auto whitespace-pre-wrap p-4 text-sm text-[#1a1a1a]">{text}</pre>
}

function DocxPreview({ src }: { src: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let stop = false
    setHtml(null)
    setFailed(false)
    void (async () => {
      try {
        const response = await fetch(src)
        if (!response.ok) throw new Error('missing')
        const buffer = await response.arrayBuffer()
        const loaded = (await import('mammoth')) as {
          convertToHtml?: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>
          default?: { convertToHtml: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> }
        }
        const api = typeof loaded.convertToHtml === 'function' ? loaded : loaded.default
        if (!api?.convertToHtml) throw new Error('preview')
        const result = await api.convertToHtml({ arrayBuffer: buffer })
        if (!stop) setHtml(sanitizePreview(result.value))
      } catch {
        if (!stop) setFailed(true)
      }
    })()
    return () => {
      stop = true
    }
  }, [src])

  if (failed) return <Missing />
  if (html == null) return <Waiting />
  return (
    <div
      className="gg-doc h-full overflow-auto bg-white p-4 text-sm text-[#1a1a1a]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function Waiting() {
  return <p className="flex h-full items-center justify-center text-sm text-[#888]">Opening the file…</p>
}

function Missing() {
  return (
    <p className="flex h-full items-center justify-center px-6 text-center text-sm text-[#666]">
      The file arrived, but the preview could not open it.
    </p>
  )
}

function sanitizePreview(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}
