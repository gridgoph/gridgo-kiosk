import { KioskLayout } from '../components/KioskLayout'
import { FlowHeader } from '../components/FlowChrome'
import { Stepper } from '../components/Stepper'
import { printerReady } from '../components/MachineStatus'
import { useKiosk } from '../store/kiosk'
import { formatPhp } from '../lib/format'
import { jobSummary, layoutCaption, pagesToPrint, sheetsNeeded } from '../lib/print'
import type { ColorMode, LayoutMode, SideMode } from '../types'

export function PrintSettings() {
  const setScreen = useKiosk((s) => s.setScreen)
  const continueToPay = useKiosk((s) => s.continueToPay)
  const document = useKiosk((s) => s.document)
  const printSettings = useKiosk((s) => s.printSettings)
  const setPageRange = useKiosk((s) => s.setPageRange)
  const setCustomPages = useKiosk((s) => s.setCustomPages)
  const setQuantity = useKiosk((s) => s.setQuantity)
  const setColorMode = useKiosk((s) => s.setColorMode)
  const setSides = useKiosk((s) => s.setSides)
  const setLayout = useKiosk((s) => s.setLayout)
  const setPreviewConfirmed = useKiosk((s) => s.setPreviewConfirmed)
  const paperCount = useKiosk((s) => s.paperCount)
  const printerStatus = useKiosk((s) => s.printerStatus)

  const pageCount = document?.pageCount ?? 1
  const pages = pagesToPrint(pageCount, printSettings)
  const sheets = sheetsNeeded(pageCount, printSettings)
  const total = useKiosk((s) => s.totalMinor())
  const ready = printerReady(printerStatus, paperCount) && paperCount >= sheets
  const canContinue = Boolean(document) && printSettings.previewConfirmed && ready

  const colors: { id: ColorMode; label: string }[] = [
    { id: 'bw', label: 'Black & white' },
    { id: 'color', label: 'Color' },
  ]
  const sides: { id: SideMode; label: string }[] = [
    { id: 'one', label: '1 side' },
    { id: 'two', label: '2 sides' },
  ]
  const layouts: { id: LayoutMode; label: string }[] = [
    { id: 'fit', label: 'Fit to page' },
    { id: 'actual', label: 'Actual size' },
    { id: 'actual-top-left', label: 'Actual, top-left' },
  ]

  return (
    <KioskLayout>
      <FlowHeader title="Print settings" step={2} onBack={() => setScreen('scan-qr')} />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="grid grid-cols-[112px_1fr] gap-3 mt-2">
          <PagePreview layout={printSettings.layout} pages={pages} paper={printSettings.paperSize} />

          <div className="min-w-0 space-y-3">
            <Field label="Pages">
              <div className="grid grid-cols-2 gap-2">
                <Choice
                  selected={printSettings.pageRange === 'all'}
                  label={`All ${pageCount}`}
                  onClick={() => setPageRange('all')}
                />
                <Choice
                  selected={printSettings.pageRange === 'custom'}
                  label="Choose pages"
                  onClick={() => setPageRange('custom')}
                />
              </div>
              {printSettings.pageRange === 'custom' && (
                <input
                  value={printSettings.customPages}
                  onChange={(event) => setCustomPages(event.target.value)}
                  placeholder="1-3, 5"
                  className="mt-2 w-full rounded-xl border border-outline bg-surface px-3 py-2 text-sm"
                />
              )}
            </Field>

            <Field label="Print as">
              <div className="grid grid-cols-2 gap-2">
                {colors.map((option) => (
                  <Choice
                    key={option.id}
                    selected={printSettings.colorMode === option.id}
                    label={option.label}
                    onClick={() => setColorMode(option.id)}
                  />
                ))}
                {sides.map((option) => (
                  <Choice
                    key={option.id}
                    selected={printSettings.sides === option.id}
                    label={option.label}
                    onClick={() => setSides(option.id)}
                  />
                ))}
              </div>
            </Field>

            <Field label="Layout">
              <div className="grid grid-cols-3 gap-2">
                {layouts.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setLayout(option.id)}
                    className={`rounded-2xl px-1.5 py-2 min-h-[84px] text-center border ${
                      printSettings.layout === option.id
                        ? 'bg-[#1a1a1a] text-white border-transparent dark:bg-white dark:text-[#1a1a1a]'
                        : 'bg-surface border-outline text-text-primary'
                    }`}
                  >
                    <LayoutGlyph layout={option.id} selected={printSettings.layout === option.id} />
                    <span className="block text-[11px] font-bold leading-tight mt-1">{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-text-muted mt-2 leading-snug">{layoutCaption(printSettings.layout)}</p>
            </Field>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border border-outline rounded-2xl px-4 py-3">
          <p className="font-bold">Copies</p>
          <Stepper value={printSettings.quantity} onChange={setQuantity} min={1} max={99} />
        </div>

        <button
          type="button"
          onClick={() => setPreviewConfirmed(!printSettings.previewConfirmed)}
          className="mt-4 flex items-center gap-3 text-left"
        >
          <span
            className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 ${
              printSettings.previewConfirmed ? 'bg-[#1a1a1a] border-[#1a1a1a] text-white dark:bg-white dark:text-[#1a1a1a] dark:border-white' : 'border-outline'
            }`}
          >
            {printSettings.previewConfirmed && (
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-sm">Looks right. Print it like the preview.</span>
        </button>

        {!ready && (
          <p className="mt-3 text-sm text-error">
            {printerStatus === 'paper_jam'
              ? 'Clear the paper jam before paying.'
              : printerStatus === 'offline'
                ? 'The printer is offline.'
                : `This job needs ${sheets} sheets. ${paperCount} sheets are in the tray.`}
          </p>
        )}
      </div>

      <div className="px-5 pb-6 pt-3 border-t border-outline-subtle">
        <div className="flex items-end justify-between mb-3">
          <p className="text-sm text-text-secondary">{jobSummary(pageCount, printSettings)}</p>
          <p className="text-2xl font-black">{formatPhp(total)}</p>
        </div>
        <button
          type="button"
          disabled={!canContinue}
          onClick={continueToPay}
          className={`w-full min-h-[56px] rounded-2xl text-lg font-black ${
            canContinue ? 'bg-action-yellow text-action-on' : 'bg-[#f4efd4] text-[#a3a3a3] dark:bg-[#3a3624] dark:text-[#777]'
          }`}
        >
          Continue to pay
        </button>
      </div>
    </KioskLayout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wide text-text-muted mb-1.5">{label.toUpperCase()}</p>
      {children}
    </div>
  )
}

function Choice({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] px-2 rounded-xl text-[13px] leading-tight font-bold border ${
        selected
          ? 'bg-[#1a1a1a] text-white border-transparent dark:bg-white dark:text-[#1a1a1a]'
          : 'bg-surface text-text-primary border-outline'
      }`}
    >
      {label}
    </button>
  )
}

function PagePreview({ layout, pages, paper }: { layout: LayoutMode; pages: number; paper: string }) {
  const pageClass =
    layout === 'fit'
      ? 'absolute inset-2 bg-[#f6e7a4]'
      : layout === 'actual'
        ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[62%] bg-[#f6e7a4]'
        : 'absolute left-2 top-2 w-[68%] h-[60%] bg-[#f6e7a4]'

  return (
    <div className="rounded-2xl bg-surface-variant px-2.5 py-3 text-center">
      <div className="relative mx-auto w-full aspect-[3/4] rounded-md bg-[#ececec] overflow-hidden">
        <div className={`${pageClass} rounded-[2px] p-1.5`}>
          <div className="h-1.5 w-8 bg-white/80 rounded-sm" />
          <div className="h-5 mt-1 bg-[#d5d5d5] rounded-sm" />
          <div className="h-1.5 mt-1 bg-white/70 rounded-sm" />
          <div className="h-1.5 mt-1 w-10 bg-white/70 rounded-sm" />
        </div>
      </div>
      <p className="text-[11px] mt-2 text-text-secondary">Page 1 of {pages} · {paper}</p>
      <p className="text-[10px] mt-1 text-[#a68416] leading-tight">
        {layout === 'fit'
          ? 'Yellow = your page, filling the paper'
          : layout === 'actual'
            ? 'Yellow = your page, at its real size'
            : 'Yellow = your page, from the top-left'}
      </p>
    </div>
  )
}

function LayoutGlyph({ layout, selected }: { layout: LayoutMode; selected: boolean }) {
  const frame = selected ? 'border-white/40 dark:border-black/20' : 'border-outline'
  const page = 'bg-action-yellow'
  return (
    <span className={`mx-auto relative block w-8 h-9 rounded-sm border ${frame}`}>
      {layout === 'fit' && <span className={`absolute inset-1 ${page} rounded-[1px]`} />}
      {layout === 'actual' && <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-4 ${page}`} />}
      {layout === 'actual-top-left' && <span className={`absolute left-0.5 top-0.5 w-3.5 h-4 ${page}`} />}
    </span>
  )
}
