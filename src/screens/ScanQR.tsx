import { useEffect, useRef, useState } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { FlowHeader } from '../components/FlowChrome'
import { QrCode } from '../components/QrCode'
import { useKiosk } from '../store/kiosk'
import { getUploadUrl } from '../lib/session'
import { clearSessionFile, openSession, readSession } from '../lib/kioskApi'
import type { UploadedDocument } from '../types'

export function ScanQR() {
  const setScreen = useKiosk((s) => s.setScreen)
  const session = useKiosk((s) => s.session)
  const refreshSession = useKiosk((s) => s.refreshSession)
  const document = useKiosk((s) => s.document)
  const setDocument = useKiosk((s) => s.setDocument)
  const paperSize = useKiosk((s) => s.printSettings.paperSize)
  const publicBaseUrl = useKiosk((s) => s.publicBaseUrl)
  const [failed, setFailed] = useState(false)
  const [linkError, setLinkError] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const seenRevision = useRef(0)
  const ignoreStorage = useRef(false)

  const portalUrl = session ? getUploadUrl(session.sessionId, publicBaseUrl || undefined) : ''
  const storageKey = session ? `kiosk_portal_upload_${session.sessionId}` : ''

  useEffect(() => {
    if (!session) return
    let stop = false
    void openSession(session.sessionId).then(() => {
      if (!stop) setLinkError(false)
    }).catch(() => {
      if (!stop) setLinkError(true)
    })
    const id = window.setInterval(() => {
      void readSession(session.sessionId).then((result) => {
        if (stop) return
        const revision = result.session.revision ?? 0
        if (revision < seenRevision.current) return
        const previous = seenRevision.current
        seenRevision.current = revision
        if (result.session.document?.fileName) {
          setDocument(result.session.document)
          setFailed(false)
          setRemoveError('')
        } else if (result.session.status === 'failed') {
          setDocument(null)
          setFailed(true)
        } else if (revision > previous) {
          setDocument(null)
        }
      }).catch(() => {})
    }, 1000)
    return () => {
      stop = true
      window.clearInterval(id)
    }
  }, [session, setDocument])

  useEffect(() => {
    if (!storageKey) return

    ignoreStorage.current = false

    function apply() {
      if (ignoreStorage.current) return
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as { document?: UploadedDocument; status?: string }
        if (data.document?.fileName) {
          setDocument(data.document)
          setFailed(false)
        } else if (data.status === 'failed') {
          setDocument(null)
          setFailed(true)
        }
      } catch {
        setFailed(true)
      }
    }

    apply()
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) apply()
    }
    window.addEventListener('storage', onStorage)
    const id = window.setInterval(apply, 1000)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(id)
    }
  }, [storageKey, setDocument])

  function clearFile() {
    setDocument(null)
    setFailed(false)
    setRemoveError('')
    ignoreStorage.current = true
    if (storageKey) localStorage.removeItem(storageKey)
    if (!session) return
    void clearSessionFile(session.sessionId).then((result) => {
      seenRevision.current = Math.max(seenRevision.current, result.session.revision ?? 0)
      setDocument(null)
    }).catch(() => {
      ignoreStorage.current = false
      setRemoveError('The file is still on this kiosk. Try Remove again.')
    })
  }

  const extension = (document?.fileName.split('.').pop() || 'file').slice(0, 4).toUpperCase()

  return (
    <KioskLayout>
      <FlowHeader title="Send your file" step={1} onBack={() => setScreen('welcome')} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {document ? (
          <div className="mt-2 rounded-[28px] bg-surface-variant px-5 py-8 text-center">
            <p className="text-xl font-black text-text-primary">File received</p>
            <p className="mt-2 text-sm text-text-muted">
              The pages stay on the phone that sent this file. This screen only shows the name.
            </p>
          </div>
        ) : (
          <div className="mt-2 rounded-[28px] bg-surface-variant px-5 py-8 flex flex-col items-center text-center">
            <div className="bg-white rounded-2xl p-3">
              <QrCode value={portalUrl || 'https://gridgo.talasora.com/upload'} size={210} />
            </div>
            <p className="mt-5 text-xl font-black text-text-primary">Scan with your phone camera</p>
            <p className="mt-2 text-sm text-text-muted max-w-[280px]">
              PDF, Word, images · up to 50 MB · files are deleted after printing
            </p>
            {linkError && (
              <p className="mt-3 text-sm text-error">The upload service is offline. Start the API, then refresh the QR.</p>
            )}
          </div>
        )}

        {document && (
          <div className="mt-4">
            <p className="text-sm font-bold text-success mb-2">Ready to print</p>
            <div className="flex items-center gap-3 border border-outline rounded-2xl px-3 py-3">
              <span className="w-12 h-12 rounded-xl bg-action-yellow text-[11px] font-black flex items-center justify-center">
                {extension}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{document.fileName}</p>
                <p className="text-sm text-success">
                  {document.pageCount} pages · {paperSize} · checked ✓
                </p>
              </div>
              <button type="button" onClick={clearFile} className="text-sm text-text-muted underline underline-offset-2 px-2">
                Remove
              </button>
            </div>
            {removeError && <p className="text-center text-sm text-error mt-3">{removeError}</p>}
            <p className="text-center text-sm text-text-muted mt-3">
              Remove it here if this is the wrong file.
            </p>
          </div>
        )}

        {failed && !document && (
          <div className="mt-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-4">
            <p className="font-bold text-error">File not received</p>
            <p className="text-sm text-text-secondary mt-1">
              The upload did not arrive. Scan the QR and send the file again.
            </p>
          </div>
        )}

        <button type="button" onClick={() => refreshSession()} className="mt-4 w-full text-xs text-text-muted underline underline-offset-2">
          Session expired? Refresh QR
        </button>
      </div>

      <div className="px-5 pb-6 pt-2">
        <button
          type="button"
          disabled={!document}
          onClick={() => setScreen('print-settings')}
          className={`w-full min-h-[56px] rounded-2xl text-lg font-black ${
            document ? 'bg-action-yellow text-action-on' : 'bg-[#f4efd4] text-[#b0b0b0] dark:bg-[#3a3624] dark:text-[#777]'
          }`}
        >
          Continue
        </button>
      </div>
    </KioskLayout>
  )
}
