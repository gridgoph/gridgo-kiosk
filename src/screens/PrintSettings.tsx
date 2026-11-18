import { KioskLayout, TopBar, YellowCTA } from '../components/KioskLayout'
import { Stepper } from '../components/Stepper'
import { useKiosk } from '../store/kiosk'
import { formatPhp } from '../lib/format'
import type { PageRangeOption, PaperSize, ColorMode } from '../types'

export function PrintSettings() {
  const setScreen = useKiosk((s) => s.setScreen)
  const document = useKiosk((s) => s.document)
  const printSettings = useKiosk((s) => s.printSettings)
  const setPageRange = useKiosk((s) => s.setPageRange)
  const setCustomPages = useKiosk((s) => s.setCustomPages)
  const setQuantity = useKiosk((s) => s.setQuantity)
  const setPaperSize = useKiosk((s) => s.setPaperSize)
  const setColorMode = useKiosk((s) => s.setColorMode)
  const computedPagesToPrint = useKiosk((s) => s.computedPagesToPrint)
  const totalMinor = useKiosk((s) => s.totalMinor)

  const totalPagesInDoc = document?.pageCount ?? 5
  const activePages = computedPagesToPrint()

  const PAGE_OPTIONS: { id: PageRangeOption; label: string; desc: string }[] = [
    { id: 'all', label: 'All Pages', desc: `Print pages 1 to ${totalPagesInDoc}` },
    { id: 'odd', label: 'Odd only', desc: 'Pages 1, 3, 5, 7…' },
    { id: 'even', label: 'Even only', desc: 'Pages 2, 4, 6, 8…' },
    { id: 'custom', label: 'Custom pages', desc: 'e.g. 1-3, 5' },
  ]

  const PAPER_SIZES: PaperSize[] = ['A4', 'Letter', 'Legal']
  const COLOR_OPTIONS: { id: ColorMode; label: string; priceNote: string }[] = [
    { id: 'bw', label: 'Black & White', priceNote: '₱1.00 / page' },
    { id: 'color', label: 'Full Color', priceNote: '₱5.00 / page' },
  ]

  return (
    <KioskLayout>
      <TopBar title="Configure Print Settings" onBack={() => setScreen('welcome')} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Step indicator */}
        <div className="mb-4 flex items-center justify-between p-3.5 bg-surface-variant rounded-2xl border border-outline">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-action-yellow text-action-on font-black text-xs flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-bold text-text-primary">
              Set preferences before upload & payment
            </span>
          </div>
          <span className="text-[11px] font-bold text-text-secondary bg-surface px-2.5 py-1 rounded-full border border-outline">
            Step 1 of 3
          </span>
        </div>

        {/* 1. Page Selection */}
        <div className="mb-6 p-5 border-2 border-outline rounded-3xl bg-surface shadow-sm">
          <label className="text-xs font-black uppercase tracking-wider text-text-secondary block mb-3">
            1. Select Pages to Print
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {PAGE_OPTIONS.map((opt) => {
              const selected = printSettings.pageRange === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setPageRange(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all min-h-[64px] flex flex-col justify-center ${
                    selected
                      ? 'border-action-yellow-on bg-text-primary text-white shadow-md'
                      : 'border-outline bg-surface text-text-secondary hover:bg-surface-variant'
                  }`}
                >
                  <span className="font-bold text-sm block">{opt.label}</span>
                  <span className={`text-[11px] block mt-0.5 ${selected ? 'text-white/70' : 'text-text-muted'}`}>
                    {opt.desc}
                  </span>
                </button>
              )
            })}
          </div>

          {printSettings.pageRange === 'custom' && (
            <div className="mt-3 pt-3 border-t border-outline-subtle">
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Enter page numbers or range:
              </label>
              <input
                type="text"
                value={printSettings.customPages}
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder="e.g. 1-3, 5, 7-8"
                className="w-full border-2 border-outline rounded-xl px-4 py-2.5 text-sm text-text-primary font-mono focus:outline-none focus:border-action-yellow"
              />
            </div>
          )}

          {/* Quantity Stepper below page selection */}
          <div className="mt-5 pt-4 border-t border-outline flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text-primary">Copies (Quantity)</p>
              <p className="text-xs text-text-muted">Number of sets to print</p>
            </div>
            <Stepper
              value={printSettings.quantity}
              onChange={setQuantity}
              size="md"
              min={1}
              max={99}
            />
          </div>
        </div>

        {/* 2. Paper Size & Color Mode */}
        <div className="mb-6 p-5 border-2 border-outline rounded-3xl bg-surface shadow-sm">
          <label className="text-xs font-black uppercase tracking-wider text-text-secondary block mb-3">
            2. Paper Size & Color
          </label>

          {/* Paper Size */}
          <div className="mb-4">
            <span className="text-xs font-bold text-text-secondary block mb-2">Paper Size:</span>
            <div className="grid grid-cols-3 gap-2">
              {PAPER_SIZES.map((size) => {
                const selected = printSettings.paperSize === size
                return (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={`py-3 px-2 rounded-xl border text-center font-bold text-sm transition-all ${
                      selected
                        ? 'border-action-yellow-on bg-action-yellow text-action-on shadow'
                        : 'border-outline bg-surface text-text-secondary hover:bg-surface-variant'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Mode */}
          <div>
            <span className="text-xs font-bold text-text-secondary block mb-2">Color Mode:</span>
            <div className="grid grid-cols-2 gap-2.5">
              {COLOR_OPTIONS.map((mode) => {
                const selected = printSettings.colorMode === mode.id
                return (
                  <button
                    key={mode.id}
                    onClick={() => setColorMode(mode.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selected
                        ? 'border-action-yellow-on bg-text-primary text-white shadow'
                        : 'border-outline bg-surface text-text-secondary hover:bg-surface-variant'
                    }`}
                  >
                    <span className="font-bold text-sm block">{mode.label}</span>
                    <span className={`text-[11px] block mt-0.5 ${selected ? 'text-action-yellow' : 'text-text-muted'}`}>
                      {mode.priceNote}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Live Calculation summary */}
        <div className="p-4 bg-surface-variant rounded-2xl border border-outline flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-muted">
              {activePages} pages × {printSettings.quantity} {printSettings.quantity === 1 ? 'copy' : 'copies'} ({printSettings.paperSize}, {printSettings.colorMode === 'bw' ? 'B&W' : 'Color'})
            </p>
            <p className="text-xl font-black text-text-primary mt-0.5">
              {formatPhp(totalMinor())}
            </p>
          </div>
          <span className="text-xs bg-success/10 text-success font-bold px-3 py-1 rounded-full border border-success/20">
            Ready to print
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-5 pb-6 pt-2 bg-surface border-t border-outline-subtle">
        <YellowCTA
          label={`Proceed to Scan QR · ${formatPhp(totalMinor())}`}
          onClick={() => setScreen('scan-qr')}
        />
      </div>
    </KioskLayout>
  )
}

