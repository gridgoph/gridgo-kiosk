import { KioskLayout, TopBar, YellowCTA } from '../components/KioskLayout'
import { useKiosk } from '../store/kiosk'

export function FileReceived() {
  const setScreen = useKiosk((s) => s.setScreen)
  const document = useKiosk((s) => s.document)

  const doc = document ?? {
    fileName: 'Document.pdf',
    fileSize: '1.8 MB',
    pageCount: 8,
  }

  return (
    <KioskLayout>
      <TopBar title="File Received" onBack={() => setScreen('scan-qr')} />

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center justify-between">
        <div className="w-full flex flex-col items-center mt-4">
          {/* Success Badge (static) */}
          <div className="w-24 h-24 rounded-full bg-success/10 border-2 border-success flex items-center justify-center mb-5">
            <svg width="48" height="48" fill="none" stroke="#2e7d32" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-text-primary text-center mb-1">
            File received!
          </h1>
          <p className="text-sm text-text-muted text-center mb-8">
            Your document and payment receipt were received from your phone.
          </p>

          {/* Document Preview Card */}
          <div className="w-full border-2 border-outline rounded-3xl p-5 bg-surface shadow-sm mb-6 flex items-start gap-4">
            <div className="w-16 h-20 rounded-xl bg-surface-variant border border-outline flex flex-col items-center justify-center text-text-secondary flex-shrink-0">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[10px] font-black uppercase mt-1">PDF</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-text-primary truncate">{doc.fileName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-surface-variant px-2 py-0.5 rounded-full text-text-muted font-mono">
                  {doc.fileSize}
                </span>
                <span className="text-xs font-bold text-action-yellow-on bg-action-yellow px-2 py-0.5 rounded-full">
                  {doc.pageCount} Pages detected
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-2">
                Format verified for vendo printing. Ready to print.
              </p>
            </div>
          </div>

          {/* Security Banner */}
          <div className="w-full p-4 rounded-2xl bg-surface-variant border border-outline-subtle flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <p className="text-xs text-text-secondary">
              <strong className="font-bold">Privacy Guaranteed:</strong> This file is held temporarily in RAM only and will be wiped immediately once dispensed.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3 pt-6">
          <YellowCTA
            label="Continue to Start Printing"
            onClick={() => setScreen('start-printing')}
          />
          <button
            onClick={() => setScreen('scan-qr')}
            className="w-full py-3 text-sm font-semibold text-text-muted underline underline-offset-2"
          >
            Upload a different file
          </button>
        </div>
      </div>
    </KioskLayout>
  )
}

