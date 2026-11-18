import { KioskLayout, TopBar, YellowCTA } from '../components/KioskLayout'
import { useKiosk } from '../store/kiosk'
import { formatPhp } from '../lib/format'

export function StartPrinting() {
  const setScreen = useKiosk((s) => s.setScreen)
  const document = useKiosk((s) => s.document)
  const receipt = useKiosk((s) => s.receipt)
  const printSettings = useKiosk((s) => s.printSettings)
  const computedPagesToPrint = useKiosk((s) => s.computedPagesToPrint)
  const totalMinor = useKiosk((s) => s.totalMinor)

  const activePages = computedPagesToPrint()
  const totalPagesDispensed = activePages * printSettings.quantity

  return (
    <KioskLayout>
      <TopBar title="Ready to Print" onBack={() => setScreen('file-received')} />

      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col justify-between">
        <div>
          {/* Main Visual Card */}
          <div className="border-2 border-action-yellow bg-action-yellow/10 rounded-3xl p-6 text-center mb-6 shadow-sm">
            <div className="w-20 h-20 bg-action-yellow rounded-2xl flex items-center justify-center mx-auto mb-4 text-text-primary shadow">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-text-primary mb-1">
              Start Printing Now
            </h1>
            <p className="text-sm text-text-secondary">
              Payment verified and document loaded into printer queue.
            </p>
          </div>

          {/* Verification Breakdown */}
          <div className="border border-outline rounded-3xl p-5 bg-surface space-y-4 shadow-sm mb-6">
            <p className="text-xs font-black uppercase text-text-muted tracking-wider">
              Verification & Summary
            </p>

            {/* Document Line */}
            <div className="flex items-center justify-between py-2 border-b border-outline-subtle">
              <div className="flex items-center gap-3">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                    {document?.fileName ?? 'print.pdf'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {document?.fileSize ?? '2.4 MB'} · {document?.pageCount ?? 5} pages detected
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                Verified ✓
              </span>
            </div>

            {/* Receipt Line */}
            <div className="flex items-center justify-between py-2 border-b border-outline-subtle">
              <div className="flex items-center gap-3">
                <span className="text-lg">🧾</span>
                <div>
                  <p className="text-sm font-bold text-text-primary truncate max-w-[200px]">
                    {receipt?.fileName ?? 'receipt.png'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {receipt?.reference ?? 'GCASH Transfer Verified'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                Paid ✓
              </span>
            </div>

            {/* Print Specs */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 bg-surface-variant rounded-xl border border-outline-subtle">
                <p className="text-[10px] uppercase font-bold text-text-muted">Size</p>
                <p className="text-sm font-bold text-text-primary">{printSettings.paperSize}</p>
              </div>
              <div className="p-2.5 bg-surface-variant rounded-xl border border-outline-subtle">
                <p className="text-[10px] uppercase font-bold text-text-muted">Color</p>
                <p className="text-sm font-bold text-text-primary">
                  {printSettings.colorMode === 'bw' ? 'B&W' : 'Color'}
                </p>
              </div>
              <div className="p-2.5 bg-surface-variant rounded-xl border border-outline-subtle">
                <p className="text-[10px] uppercase font-bold text-text-muted">Total Pages</p>
                <p className="text-sm font-bold text-text-primary">{totalPagesDispensed}</p>
              </div>
            </div>
          </div>

          {/* Amount Paid Chip */}
          <div className="p-4 rounded-2xl bg-surface-variant border border-outline flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Amount Processed:</span>
            <span className="text-lg font-black text-text-primary">{formatPhp(totalMinor())}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6">
          <YellowCTA
            label="Start Printing Now 🖨️"
            onClick={() => setScreen('printing-progress')}
          />
        </div>
      </div>
    </KioskLayout>
  )
}
