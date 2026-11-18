import { useState, useRef } from 'react'
import { uploadFile } from '../lib/api'

interface PhoneUploadProps {
  session: string
  mode?: 'file' | 'receipt' | 'portal'
}

type StepPhase = 'step1' | 'step2' | 'step3' | 'uploading' | 'error'

// ─── Inline SVG icons ────────────────────────────────────────────────────────
const FileIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const UploadIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
)

const CheckIcon = () => (
  <svg width="52" height="52" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

// ─── GRIDGO Logo ─────────────────────────────────────────────────────────────
function GridGoLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const textSize = size === 'sm' ? 'text-2xl' : 'text-3xl'
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="grid grid-cols-3 gap-[3px]">
        <span className={`${dotSize} rounded-full bg-[#1a1a1a]`} />
        <span className={`${dotSize} rounded-full bg-[#1a1a1a]`} />
        <span className={`${dotSize} rounded-full bg-[#ffde58]`} />
        <span className={`${dotSize} rounded-full bg-[#1a1a1a]`} />
        <span className={`${dotSize} rounded-full bg-[#1a1a1a]`} />
        <span className={`${dotSize} rounded-full bg-[#ffde58]`} />
      </div>
      <span className={`${textSize} font-black text-[#1a1a1a] tracking-tight leading-none`}>
        GRID<span style={{ color: '#ffde58' }}>GO</span>
      </span>
    </div>
  )
}

// ─── Step Dots ────────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i + 1 === current
              ? 'w-5 h-2 bg-[#1a1a1a]'
              : i + 1 < current
              ? 'w-2 h-2 bg-[#1a1a1a]'
              : 'w-2 h-2 bg-[#d0d0d0]'
          }`}
        />
      ))}
    </div>
  )
}

// ─── File Pill ───────────────────────────────────────────────────────────────
function FilePill({
  file,
  onRemove,
  dark = false,
}: {
  file: File
  onRemove?: () => void
  dark?: boolean
}) {
  const size =
    file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
        dark ? 'bg-[#1a1a1a] text-white' : 'bg-[#f0f0f0] text-[#1a1a1a]'
      }`}
    >
      <span className={dark ? 'text-[#ffde58]' : 'text-[#1a1a1a]'}>
        <FileIcon />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate leading-tight">{file.name}</p>
        <p className={`text-[11px] mt-0.5 ${dark ? 'text-white/50' : 'text-[#1a1a1a]/50'}`}>{size}</p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={`ml-auto flex-shrink-0 p-1 rounded-lg ${
            dark ? 'text-white/40 hover:text-white/80' : 'text-[#1a1a1a]/30 hover:text-[#1a1a1a]/70'
          } transition-colors`}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  )
}

// ─── Upload Button ────────────────────────────────────────────────────────────
function UploadButton({
  label,
  hint,
  icon,
  onClick,
  hasFile,
}: {
  label: string
  hint: string
  icon: React.ReactNode
  onClick: () => void
  hasFile: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] border-2 ${
        hasFile
          ? 'bg-[#f5f5f5] border-[#1a1a1a]/20 text-[#1a1a1a]'
          : 'bg-[#1a1a1a] border-transparent text-white'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          hasFile ? 'bg-[#1a1a1a]/8' : 'bg-white/10'
        }`}
      >
        {icon}
      </div>
      <div className="text-left">
        <p className="font-bold text-sm leading-tight">{label}</p>
        <p className={`text-[11px] mt-0.5 ${hasFile ? 'text-[#1a1a1a]/50' : 'text-white/50'}`}>{hint}</p>
      </div>
      <div className={`ml-auto flex-shrink-0 ${hasFile ? 'text-green-500' : 'text-white/40'}`}>
        {hasFile ? (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </div>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PhoneUpload({ session }: PhoneUploadProps) {
  const [phase, setPhase] = useState<StepPhase>('step1')
  const [agreed, setAgreed] = useState(false)

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [printFile, setPrintFile] = useState<File | null>(null)
  const [sessionCode] = useState(() => Math.random().toString(36).substring(2, 8) + 'fbg')

  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const receiptInputRef = useRef<HTMLInputElement>(null)
  const printInputRef = useRef<HTMLInputElement>(null)

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setReceiptFile(file)
    e.target.value = ''
  }

  function handlePrintFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPrintFile(file)
    e.target.value = ''
  }

  async function handleSend() {
    if (!receiptFile && !printFile) return

    setPhase('uploading')
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(interval)
          return 85
        }
        return p + 10
      })
    }, 200)

    try {
      if (receiptFile) await uploadFile(receiptFile, 'payment_proof')
      if (printFile) await uploadFile(printFile, 'print_document')

      clearInterval(interval)
      setProgress(100)

      const docPayload = printFile
        ? {
            fileName: printFile.name,
            fileSize: (printFile.size / (1024 * 1024)).toFixed(1) + ' MB',
            pageCount: 5,
          }
        : { fileName: 'print.png', fileSize: '5 MB', pageCount: 5 }

      const receiptPayload = receiptFile
        ? {
            fileName: receiptFile.name,
            fileSize: (receiptFile.size / (1024 * 1024)).toFixed(1) + ' MB',
            reference: 'GCASH-' + Math.floor(100000000000 + Math.random() * 900000000000),
          }
        : { fileName: 'receipt.png', fileSize: '1 MB', reference: 'GCASH-1234567890' }

      localStorage.setItem(
        `kiosk_portal_upload_${session}`,
        JSON.stringify({
          document: docPayload,
          receipt: receiptPayload,
          code: sessionCode,
        })
      )

      setPhase('step3')
    } catch {
      clearInterval(interval)
      setErrorMsg('Could not send your files to the kiosk. Please check your connection and retry.')
      setPhase('error')
    }
  }

  return (
    <div
      style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
      className="min-h-screen bg-[#f0f0f0] flex items-start justify-center"
    >
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col shadow-2xl relative overflow-hidden">

        {/* ── Status Bar (cosmetic) ── */}
        <div className="flex items-center justify-between px-6 pt-3 pb-0">
          <span className="text-[11px] font-semibold text-[#1a1a1a]">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="10" fill="currentColor" className="text-[#1a1a1a]" viewBox="0 0 14 10">
              <rect x="0" y="4" width="2" height="6" rx="0.5" />
              <rect x="3" y="2.5" width="2" height="7.5" rx="0.5" />
              <rect x="6" y="1" width="2" height="9" rx="0.5" />
              <rect x="9" y="0" width="2" height="10" rx="0.5" />
              <rect x="12" y="0" width="2" height="10" rx="0.5" opacity="0.3" />
            </svg>
            <svg width="14" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#1a1a1a]" viewBox="0 0 24 24">
              <path d="M1.5 8.5a18 18 0 0121 0M5.5 12a12 12 0 0113 0M9.5 15.5a6 6 0 015 0M12 19h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex items-center gap-0.5">
              <div className="w-5 h-2.5 rounded-[2px] border border-[#1a1a1a] p-[1px]">
                <div className="w-3/4 h-full bg-[#1a1a1a] rounded-[1px]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="px-6 pt-4 pb-5 flex items-center justify-between border-b border-[#f0f0f0]">
          <GridGoLogo />
          <span className="text-[11px] font-semibold text-[#aaa] bg-[#f5f5f5] px-3 py-1 rounded-full">
            Secure Portal
          </span>
        </div>

        {/* ════════════════════════════════════════════
            STEP 1 — Terms & Agreement
        ════════════════════════════════════════════ */}
        {phase === 'step1' && (
          <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <StepDots current={1} total={3} />
              <span className="text-[11px] font-semibold text-[#aaa]">Step 1 of 3</span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-[32px] font-black text-[#1a1a1a] leading-tight tracking-tight">
                Send your<br />receipt &<br />files
              </h1>
              <p className="text-sm text-[#888] mt-2 leading-relaxed">
                Before we start, please read and agree to the following terms.
              </p>
            </div>

            {/* Terms */}
            <div className="space-y-3 mb-8">
              {[
                {
                  num: '01',
                  title: 'File sent only to machine',
                  desc: 'Your file will be transmitted directly and securely to this kiosk only.',
                },
                {
                  num: '02',
                  title: 'Auto-deleted after printing',
                  desc: 'Once your document is printed, the file is permanently deleted.',
                },
                {
                  num: '03',
                  title: 'Nothing stored on machine',
                  desc: 'No data, file, or personal information is retained.',
                },
              ].map((term) => (
                <div
                  key={term.num}
                  className="flex gap-4 p-4 bg-[#f7f7f7] rounded-2xl"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="text-[11px] font-black text-[#aaa]">{term.num}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] leading-tight">{term.title}</p>
                    <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">{term.desc}</p>
                  </div>
                  <div className="flex-shrink-0 ml-auto text-[#aaa]">
                    <ShieldIcon />
                  </div>
                </div>
              ))}
            </div>

            {/* Toggle agreement */}
            <div
              className="flex items-center gap-4 p-4 bg-[#f7f7f7] rounded-2xl cursor-pointer select-none mb-auto"
              onClick={() => setAgreed(!agreed)}
            >
              <button
                type="button"
                className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${
                  agreed ? 'bg-[#1a1a1a]' : 'bg-[#d0d0d0]'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                    agreed ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">I understand and agree</p>
                <p className="text-[11px] text-[#aaa]">Required to continue</p>
              </div>
            </div>

            {/* CTA */}
            <button
              disabled={!agreed}
              onClick={() => setPhase('step2')}
              className="mt-6 w-full h-14 bg-[#ffde58] text-[#1a1a1a] font-black text-base rounded-2xl disabled:opacity-30 transition-all active:scale-[0.98] shadow-sm"
            >
              Proceed
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 2 — Upload Files
        ════════════════════════════════════════════ */}
        {phase === 'step2' && (
          <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <StepDots current={2} total={3} />
              <span className="text-[11px] font-semibold text-[#aaa]">Step 2 & 3 of 3</span>
            </div>

            {/* Receipt Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black text-[#aaa]">STEP 2 OF 3</span>
              </div>
              <h2 className="text-[26px] font-black text-[#1a1a1a] leading-tight tracking-tight mb-4">
                Upload your<br />receipt here:
              </h2>

              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleReceiptChange}
              />

              {receiptFile ? (
                <FilePill file={receiptFile} onRemove={() => setReceiptFile(null)} />
              ) : (
                <UploadButton
                  label="Browse files"
                  hint=".png, .jpg, .pdf · max 25 MB"
                  icon={<FileIcon />}
                  onClick={() => receiptInputRef.current?.click()}
                  hasFile={false}
                />
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#f0f0f0]" />
              <span className="text-[11px] font-bold text-[#ccc]">then</span>
              <div className="flex-1 h-px bg-[#f0f0f0]" />
            </div>

            {/* Print File Section */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black text-[#aaa]">STEP 3 OF 3</span>
              </div>
              <h2 className="text-[26px] font-black text-[#1a1a1a] leading-tight tracking-tight mb-4">
                Upload your file<br />to be printed:
              </h2>

              <input
                ref={printInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                className="hidden"
                onChange={handlePrintFileChange}
              />

              {printFile ? (
                <FilePill file={printFile} onRemove={() => setPrintFile(null)} />
              ) : (
                <UploadButton
                  label="Browse files"
                  hint=".pdf, .doc, .png, .jpg · max 25 MB"
                  icon={<UploadIcon />}
                  onClick={() => printInputRef.current?.click()}
                  hasFile={false}
                />
              )}
            </div>

            {/* Summary before send */}
            {(receiptFile || printFile) && (
              <div className="mt-5 p-3 bg-[#f7f7f7] rounded-xl flex items-center gap-2">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#aaa] flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] text-[#888]">
                  {receiptFile && printFile
                    ? '2 files ready — tap Send to transfer to the kiosk.'
                    : receiptFile
                    ? 'Receipt ready. Upload your print file too before sending.'
                    : 'Print file ready. Upload your receipt too before sending.'}
                </p>
              </div>
            )}

            <div className="mt-auto pt-6">
              <button
                disabled={!receiptFile || !printFile}
                onClick={handleSend}
                className="w-full h-14 bg-[#ffde58] text-[#1a1a1a] font-black text-base rounded-2xl disabled:opacity-30 transition-all active:scale-[0.98] shadow-sm"
              >
                Send to Kiosk
              </button>
              <p className="text-center text-[11px] text-[#bbb] mt-3">
                Both receipt and file are required to proceed
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            UPLOADING STATE
        ════════════════════════════════════════════ */}
        {phase === 'uploading' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
            {/* Spinner ring */}
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full border-4 border-[#f0f0f0] border-t-[#1a1a1a] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[13px] font-black text-[#1a1a1a]">{progress}%</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-black text-[#1a1a1a]">Sending to kiosk…</p>
              <p className="text-[13px] text-[#aaa] mt-1">Encrypted direct transfer</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#f0f0f0] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#1a1a1a] rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              {receiptFile && (
                <div className="w-full p-3 bg-[#f7f7f7] rounded-xl flex items-center gap-3">
                  <div className="flex-shrink-0 text-[#1a1a1a]"><FileIcon /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#1a1a1a] truncate">{receiptFile.name}</p>
                    <p className="text-[10px] text-[#aaa]">Receipt</p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] font-semibold text-[#aaa] bg-white px-2 py-0.5 rounded-full border border-[#eee]">
                    {receiptFile.size < 1024 * 1024
                      ? `${(receiptFile.size / 1024).toFixed(0)} KB`
                      : `${(receiptFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                </div>
              )}
              {printFile && (
                <div className="w-full p-3 bg-[#f7f7f7] rounded-xl flex items-center gap-3">
                  <div className="flex-shrink-0 text-[#1a1a1a]"><UploadIcon /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-[#1a1a1a] truncate">{printFile.name}</p>
                    <p className="text-[10px] text-[#aaa]">Print file</p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] font-semibold text-[#aaa] bg-white px-2 py-0.5 rounded-full border border-[#eee]">
                    {printFile.size < 1024 * 1024
                      ? `${(printFile.size / 1024).toFixed(0)} KB`
                      : `${(printFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 3 — Successfully Sent
        ════════════════════════════════════════════ */}
        {phase === 'step3' && (
          <div className="flex-1 flex flex-col">
            {/* Yellow hero section */}
            <div className="bg-[#ffde58] px-6 pt-8 pb-10 flex flex-col items-center text-center">
              {/* Badge */}
              <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-5 shadow-xl">
                <CheckIcon />
              </div>
              <h1 className="text-[36px] font-black text-[#1a1a1a] leading-tight tracking-tight">
                Successfully<br />Sent!
              </h1>
              <div className="mt-3 px-4 py-1.5 bg-[#1a1a1a]/10 rounded-full">
                <span className="text-[12px] font-mono font-bold text-[#1a1a1a]/70">
                  code: {sessionCode}
                </span>
              </div>
            </div>

            {/* White card section */}
            <div className="flex-1 px-6 pt-6 pb-8 flex flex-col">
              <p className="text-[13px] font-bold text-[#aaa] mb-4 uppercase tracking-widest">
                Files Uploaded
              </p>

              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-[11px] font-bold text-[#aaa] mb-1.5 ml-1">YOUR RECEIPT</p>
                  <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-2xl">
                    <span className="text-[#ffde58] flex-shrink-0">
                      <FileIcon />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {receiptFile?.name ?? 'receipt.png'}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {receiptFile
                          ? receiptFile.size < 1024 * 1024
                            ? `${(receiptFile.size / 1024).toFixed(0)} KB`
                            : `${(receiptFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : '1 MB'}
                      </p>
                    </div>
                    <span className="text-green-400 flex-shrink-0">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-[#aaa] mb-1.5 ml-1">YOUR FILE</p>
                  <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-2xl">
                    <span className="text-[#ffde58] flex-shrink-0">
                      <UploadIcon />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {printFile?.name ?? 'print.png'}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {printFile
                          ? printFile.size < 1024 * 1024
                            ? `${(printFile.size / 1024).toFixed(0)} KB`
                            : `${(printFile.size / (1024 * 1024)).toFixed(1)} MB`
                          : '5 MB'}
                      </p>
                    </div>
                    <span className="text-green-400 flex-shrink-0">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Instruction card */}
              <div className="p-4 bg-[#f7f7f7] rounded-2xl flex items-start gap-3 mt-auto">
                <div className="w-8 h-8 rounded-full bg-[#ffde58] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">Check the kiosk screen</p>
                  <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">
                    Your files have been received. Look at the kiosk terminal to start printing. You can close this screen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            ERROR STATE
        ════════════════════════════════════════════ */}
        {phase === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-5">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="36" height="36" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1a1a1a] mb-2">Transfer Failed</h2>
              <p className="text-[13px] text-[#888] leading-relaxed max-w-[280px] mx-auto">{errorMsg}</p>
            </div>
            <button
              onClick={() => { setPhase('step2'); setProgress(0) }}
              className="w-full h-14 bg-[#ffde58] text-[#1a1a1a] font-black text-base rounded-2xl active:scale-[0.98] transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Bottom safe area ── */}
        <div className="h-5 bg-transparent" />
      </div>
    </div>
  )
}
