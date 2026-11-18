import { useEffect } from 'react'
import { KioskLayout, TopBar } from '../components/KioskLayout'
import { QrCode } from '../components/QrCode'
import { useKiosk } from '../store/kiosk'
import { getUploadUrl } from '../lib/session'

export function ScanQR() {
  const setScreen = useKiosk((s) => s.setScreen)
  const session = useKiosk((s) => s.session)
  const refreshSession = useKiosk((s) => s.refreshSession)
  const setDocument = useKiosk((s) => s.setDocument)
  const setReceipt = useKiosk((s) => s.setReceipt)
  const totalMinor = useKiosk((s) => s.totalMinor)

  // Portal URL for phone: upload receipt + file
  const portalUrl = session ? getUploadUrl(session.sessionId, 'portal') : ''
  // Payment QR Ph link/data
  const paymentQrUrl = `https://gridgo.ph/pay?amount=${totalMinor()}&session=${session?.sessionId ?? ''}`

  // Listen for mobile upload completion via localStorage event
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === `kiosk_portal_upload_${session?.sessionId}` && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          if (data.document) setDocument(data.document)
          if (data.receipt) setReceipt(data.receipt)
          setScreen('file-received')
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [session, setDocument, setReceipt, setScreen])

  // Quick simulation shortcut for demo/testing on kiosk without phone
  function handleSimulateBoth() {
    setReceipt({
      fileName: 'gcash_receipt.png',
      fileSize: '1.2 MB',
      reference: 'GCASH-9876543210123',
    })
    setDocument({
      fileName: 'print_document.pdf',
      fileSize: '4.8 MB',
      pageCount: 5,
    })
    setScreen('file-received')
  }

  return (
    <KioskLayout>
      <TopBar title="Scan QR" onBack={() => setScreen('print-settings')} />

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center">
        {/* Step 1 of 2: Scan for payment */}
        <div className="w-full flex flex-col items-center mb-6">
          <p className="text-xs text-text-muted font-bold tracking-wide mb-0.5">
            Step 1 of 2
          </p>
          <h2 className="text-base font-black text-text-primary text-center">
            Scan the QR Code for payment.
          </h2>
          <p className="text-xs font-bold text-error text-center mb-3">
            Do not forget to save your receipt
          </p>

          <div className="w-full max-w-[320px] aspect-square rounded-3xl border-2 border-text-primary p-5 bg-surface flex flex-col items-center justify-center shadow-sm">
            <div className="bg-white p-3 rounded-2xl border border-outline shadow-inner">
              <QrCode value={paymentQrUrl} size={180} />
            </div>
            <span className="text-[11px] font-bold text-text-muted mt-2 tracking-wider">
              QR Ph / GCash / Maya
            </span>
          </div>
        </div>

        {/* Step 2 of 2: Scan for upload */}
        <div className="w-full flex flex-col items-center mb-4">
          <p className="text-xs text-text-muted font-bold tracking-wide mb-0.5">
            Step 2 of 2
          </p>
          <h2 className="text-base font-black text-text-primary text-center mb-3">
            Scan the QR Code to upload your receipt and file/s to be printed.
          </h2>

          <div className="w-full max-w-[320px] aspect-square rounded-3xl border-2 border-text-primary p-5 bg-surface flex flex-col items-center justify-center shadow-sm">
            <div className="bg-white p-3 rounded-2xl border border-outline shadow-inner">
              <QrCode value={portalUrl || 'https://gridgo.ph/portal'} size={180} />
            </div>
            <span className="text-[11px] font-bold text-text-muted mt-2 tracking-wider">
              Scan with Phone Camera
            </span>
          </div>
        </div>

        {/* Demo trigger & refresh */}
        <div className="w-full mt-4 flex flex-col gap-2 pt-2 border-t border-outline-subtle">
          <button
            onClick={handleSimulateBoth}
            className="w-full py-3 bg-action-yellow/20 hover:bg-action-yellow/30 border border-action-yellow text-action-on font-bold text-xs rounded-xl transition-all"
          >
            ⚡ Demo: Simulate mobile upload (Receipt + File)
          </button>

          <button
            onClick={() => refreshSession()}
            className="w-full py-2 text-xs text-text-muted underline underline-offset-2"
          >
            Session expired? Refresh QR codes
          </button>
        </div>
      </div>
    </KioskLayout>
  )
}
