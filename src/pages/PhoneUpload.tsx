import { useEffect, useRef, useState } from 'react'
import { FileViewer } from '../components/FileViewer'
import { readSession, uploadSessionFile } from '../lib/kioskApi'

interface PhoneUploadProps {
  session: string
}

type StepPhase = 'checking' | 'terms' | 'upload' | 'uploading' | 'sent' | 'closed' | 'error'

function fileSizeLabel(size: number) {
  return size < 1024 * 1024 ? `${(size / 1024).toFixed(0)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const PRINT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'])

function uploadProblem(file: File) {
  if (file.size <= 0) return 'Choose a file to send to the kiosk.'
  if (file.size > 50 * 1024 * 1024) return 'This file is over 50 MB. Choose a smaller file.'
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!PRINT_EXTENSIONS.has(extension)) return 'Send a PDF, Word, PowerPoint, or image file.'
  const type = file.type.toLowerCase()
  if (type.includes('html') || type.includes('svg') || type.includes('javascript')) {
    return 'Send a PDF, Word, PowerPoint, or image file.'
  }
  return ''
}

function guessPages(file: File) {
  if (file.type.startsWith('image/')) return 1
  return Math.min(200, Math.max(1, Math.round(file.size / 45000)))
}

export function PhoneUpload({ session }: PhoneUploadProps) {
  const [phase, setPhase] = useState<StepPhase>('checking')
  const [agreed, setAgreed] = useState(false)
  const [printFile, setPrintFile] = useState<File | null>(null)
  const [sentName, setSentName] = useState('')
  const [sentSize, setSentSize] = useState('')
  const [sentMime, setSentMime] = useState<string | undefined>()
  const [sentStamp, setSentStamp] = useState('')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [fileError, setFileError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!session) {
      setPhase('closed')
      return
    }
    let stop = false
    void readSession(session).then((result) => {
      if (stop) return
      const received = result.session.document
      if (received?.fileName) {
        setSentName(received.fileName)
        setSentSize(received.fileSize)
        setSentMime(received.mime)
        setSentStamp(`${received.fileName}-${received.fileSize}-${received.pageCount}`)
        setPhase('sent')
        return
      }
      setPhase('terms')
    }).catch(() => {
      if (!stop) setPhase('closed')
    })
    return () => {
      stop = true
    }
  }, [session])

  function notifyKiosk(payload: { document?: { fileName: string; fileSize: string; pageCount: number }; status?: 'failed' }) {
    localStorage.setItem(`kiosk_portal_upload_${session}`, JSON.stringify(payload))
  }

  async function handleSend() {
    if (!printFile) return
    const problem = uploadProblem(printFile)
    if (problem) {
      setErrorMsg(problem)
      setPhase('error')
      return
    }

    setPhase('uploading')
    setProgress(0)
    const interval = window.setInterval(() => {
      setProgress((value) => (value >= 85 ? 85 : value + 10))
    }, 200)

    try {
      const result = await uploadSessionFile(session, printFile)
      window.clearInterval(interval)
      setProgress(100)
      const received = result.session.document
      const name = received?.fileName || printFile.name
      const size = received?.fileSize || fileSizeLabel(printFile.size)
      setSentName(name)
      setSentSize(size)
      setSentMime(received?.mime || printFile.type)
      setSentStamp(`${name}-${size}-${received?.pageCount ?? guessPages(printFile)}`)
      notifyKiosk({ document: result.session.document ?? {
        fileName: printFile.name,
        fileSize: fileSizeLabel(printFile.size),
        pageCount: guessPages(printFile),
      } })
      setPhase('sent')
    } catch (error) {
      window.clearInterval(interval)
      setErrorMsg(error instanceof Error ? error.message : 'Could not send your file to the kiosk. Check your connection and try again.')
      notifyKiosk({ status: 'failed' })
      setPhase('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-start justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col">
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#f0f0f0]">
          <p className="text-2xl font-black tracking-tight">
            GRID<span className="text-[#e2b400]">GO</span>
          </p>
          <span className="text-[11px] font-semibold text-[#888] bg-[#f5f5f5] px-3 py-1 rounded-full">Send a file</span>
        </div>

        {phase === 'checking' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-xl font-black">Checking this session…</p>
          </div>
        )}

        {phase === 'closed' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <h1 className="text-3xl font-black leading-tight">Session ended</h1>
            <p className="text-sm text-[#666] mt-3 leading-relaxed">
              This upload link is closed. Scan the QR on the kiosk to start again.
            </p>
          </div>
        )}

        {phase === 'terms' && (
          <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
            <h1 className="text-[32px] font-black leading-tight">Send your file</h1>
            <p className="text-sm text-[#777] mt-2">Read this before the file goes to the kiosk.</p>
            <div className="space-y-3 my-6">
              {[
                ['File sent only to this machine', 'The file goes to this kiosk and nowhere else.'],
                ['Deleted after printing', 'The file is removed when printing finishes.'],
                ['Nothing kept on the machine', 'The kiosk does not keep the file or your name.'],
              ].map(([title, desc]) => (
                <div key={title} className="p-4 bg-[#f7f7f7] rounded-2xl">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-[12px] text-[#777] mt-1">{desc}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setAgreed((value) => !value)} className="flex items-center gap-3 p-4 bg-[#f7f7f7] rounded-2xl text-left">
              <span className={`w-12 h-6 rounded-full relative ${agreed ? 'bg-[#1a1a1a]' : 'bg-[#d0d0d0]'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white ${agreed ? 'left-7' : 'left-1'}`} />
              </span>
              <span>
                <span className="block text-sm font-bold">I understand and agree</span>
                <span className="block text-[11px] text-[#888]">Required to continue</span>
              </span>
            </button>
            <button
              type="button"
              disabled={!agreed}
              onClick={() => setPhase('upload')}
              className="mt-6 w-full h-14 bg-[#ffde58] font-black rounded-2xl disabled:opacity-30"
            >
              Proceed
            </button>
          </div>
        )}

        {phase === 'upload' && (
          <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
            <h1 className="text-[32px] font-black leading-tight">Upload your file</h1>
            <p className="text-sm text-[#777] mt-2">PDF, Word, PowerPoint, or images. Up to 50 MB.</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.bmp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (!file) return
                const problem = uploadProblem(file)
                if (problem) {
                  setPrintFile(null)
                  setFileError(problem)
                  return
                }
                setFileError('')
                setPrintFile(file)
              }}
            />
            {printFile ? (
              <div className="mt-6 flex items-center gap-3 p-4 bg-[#f7f7f7] rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{printFile.name}</p>
                  <p className="text-xs text-[#777] mt-1">{fileSizeLabel(printFile.size)}</p>
                </div>
                <button type="button" onClick={() => setPrintFile(null)} className="text-sm underline text-[#666]">
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-6 w-full h-16 rounded-2xl bg-[#1a1a1a] text-white font-bold"
              >
                Browse files
              </button>
            )}
            {fileError && <p className="mt-3 text-sm text-[#b42318]">{fileError}</p>}
            <button
              type="button"
              disabled={!printFile}
              onClick={handleSend}
              className="mt-auto w-full h-14 bg-[#ffde58] font-black rounded-2xl disabled:opacity-30"
            >
              Send to kiosk
            </button>
          </div>
        )}

        {phase === 'uploading' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-4xl font-black">{progress}%</p>
            <p className="mt-2 text-xl font-black">Sending to kiosk…</p>
            <p className="text-sm text-[#777] mt-1 truncate max-w-full">{printFile?.name}</p>
          </div>
        )}

        {phase === 'sent' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-[#ffde58] px-6 pt-10 pb-10 text-center">
              <h1 className="text-4xl font-black leading-tight">File sent</h1>
            </div>
            <div className="px-6 py-6">
              <p className="font-bold">{sentName || printFile?.name}</p>
              <p className="text-sm text-[#666] mt-1">{sentSize || (printFile ? fileSizeLabel(printFile.size) : '')}</p>
              {sentName && (
                <FileViewer
                  sessionId={session}
                  fileName={sentName}
                  mime={sentMime}
                  stamp={sentStamp || sentName}
                />
              )}
              <p className="mt-6 text-sm text-[#444] leading-relaxed">
                Check the file here. The kiosk does not show the pages. Choose the print settings and pay on the kiosk screen.
              </p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <h2 className="text-xl font-black">File not received</h2>
            <p className="text-sm text-[#666] mt-2">{errorMsg}</p>
            <button type="button" onClick={() => setPhase('upload')} className="mt-6 w-full h-14 bg-[#ffde58] font-black rounded-2xl">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
