import { useEffect, useRef } from 'react'
import { KioskLayout } from '../components/KioskLayout'
import { FlowHeader, useClock } from '../components/FlowChrome'
import { QrCode } from '../components/QrCode'
import { printerReady } from '../components/MachineStatus'
import { useKiosk } from '../store/kiosk'
import { formatPhp } from '../lib/format'
import { sheetsNeeded } from '../lib/print'
import { insertScreenCoin, paymentQrValue, readSession, setPaySession } from '../lib/kioskApi'

const COINS = [
  { label: '₱1', minor: 100 },
  { label: '₱5', minor: 500 },
  { label: '₱10', minor: 1000 },
  { label: '₱20', minor: 2000 },
]

export function Pay() {
  const clock = useClock()
  const setScreen = useKiosk((s) => s.setScreen)
  const document = useKiosk((s) => s.document)
  const printSettings = useKiosk((s) => s.printSettings)
  const orderCode = useKiosk((s) => s.orderCode)
  const session = useKiosk((s) => s.session)
  const paymentMethod = useKiosk((s) => s.paymentMethod)
  const setPaymentMethod = useKiosk((s) => s.setPaymentMethod)
  const coinsInsertedMinor = useKiosk((s) => s.coinsInsertedMinor)
  const insertCoin = useKiosk((s) => s.insertCoin)
  const refDigits = useKiosk((s) => s.refDigits)
  const setRefDigits = useKiosk((s) => s.setRefDigits)
  const paperCount = useKiosk((s) => s.paperCount)
  const printerStatus = useKiosk((s) => s.printerStatus)
  const paymentQrTemplate = useKiosk((s) => s.paymentQrTemplate)
  const paymentQrEnabled = useKiosk((s) => s.paymentQrEnabled)
  const setCoinsInserted = useKiosk((s) => s.setCoinsInserted)
  const total = useKiosk((s) => s.totalMinor())
  const pageCount = document?.pageCount ?? 1
  const sheets = sheetsNeeded(pageCount, printSettings)
  const ready = printerReady(printerStatus, paperCount) && paperCount >= sheets
  const remaining = Math.max(0, total - coinsInsertedMinor)
  const insertedRatio = total > 0 ? Math.min(100, (coinsInsertedMinor / total) * 100) : 0
  const payingByQr = paymentQrEnabled && paymentMethod === 'qr'
  const qrReady = payingByQr && refDigits.length === 4
  const coinsReady = !payingByQr && coinsInsertedMinor >= total && total > 0

  useEffect(() => {
    if (!paymentQrEnabled && paymentMethod === 'qr') setPaymentMethod('coins')
  }, [paymentQrEnabled, paymentMethod, setPaymentMethod])

  useEffect(() => {
    if (!ready || (!qrReady && !coinsReady)) return
    const delay = qrReady ? 1200 : 700
    const timer = window.setTimeout(() => setScreen('paid'), delay)
    return () => window.clearTimeout(timer)
  }, [ready, qrReady, coinsReady, setScreen])

  useEffect(() => {
    const sessionId = session?.sessionId
    if (!sessionId) return
    let stop = false
    void setPaySession(sessionId, { active: true, totalMinor: total, orderCode }).catch(() => {})
    const id = window.setInterval(() => {
      void readSession(sessionId).then((result) => {
        if (!stop) setCoinsInserted(result.session.coinsInsertedMinor)
      }).catch(() => {})
    }, 700)
    return () => {
      stop = true
      window.clearInterval(id)
      void setPaySession(sessionId, { active: false, totalMinor: total, orderCode }).catch(() => {})
    }
  }, [session?.sessionId, total, orderCode, setCoinsInserted])

  const paymentQr = paymentQrValue(paymentQrTemplate, total, orderCode, session?.sessionId ?? '')

  return (
    <KioskLayout>
      <FlowHeader
        title="Pay"
        step={3}
        onBack={() => setScreen('print-settings')}
        right={<span className="text-sm font-semibold text-text-secondary tabular-nums">{clock}</span>}
      />

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mt-2 rounded-3xl bg-[#1a1a1a] text-white text-center px-5 py-5">
          <p className="text-sm text-white/70">Total</p>
          <p className="text-4xl font-black mt-1">{formatPhp(total)}</p>
          <p className="text-xs text-white/60 mt-1">Order {orderCode}</p>
        </div>

        {paymentQrEnabled && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Tab selected={paymentMethod === 'qr'} label="QR Ph (exact)" onClick={() => setPaymentMethod('qr')} />
            <Tab selected={paymentMethod === 'coins'} label="Coins" onClick={() => setPaymentMethod('coins')} />
          </div>
        )}

        {payingByQr ? (
          <div className="mt-4 flex gap-4 items-start">
            <div className="rounded-2xl border border-outline p-2 bg-white">
              <QrCode value={paymentQr} size={132} />
            </div>
            <ol className="flex-1 space-y-3 text-sm text-text-secondary pt-1">
              <li>1 · Scan with GCash, Maya or your bank app</li>
              <li>2 · Pay the exact amount</li>
              <li>3 · Type the last 4 digits of the ref. no.</li>
            </ol>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-outline p-4">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-action-yellow text-action-on font-black flex items-center justify-center flex-shrink-0">
                ₱
              </span>
              <p className="font-semibold leading-snug">Insert ₱1, ₱5, ₱10 or ₱20 coins in the slot below</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-bold">Inserted</span>
              <span className="font-bold tabular-nums">{formatPhp(coinsInsertedMinor)}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-surface-variant overflow-hidden">
              <div className="h-full bg-action-yellow rounded-full" style={{ width: `${insertedRatio}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-text-muted">Still to insert</span>
              <span className="font-bold tabular-nums">{formatPhp(remaining)}</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {COINS.map((coin) => (
                <button
                  key={coin.label}
                  type="button"
                  onClick={() => {
                    const sessionId = session?.sessionId
                    if (!sessionId) {
                      insertCoin(coin.minor)
                      return
                    }
                    void insertScreenCoin(sessionId, coin.minor)
                      .then((result) => setCoinsInserted(result.session.coinsInsertedMinor))
                      .catch(async () => {
                        try {
                          await setPaySession(sessionId, { active: true, totalMinor: total, orderCode })
                          const result = await insertScreenCoin(sessionId, coin.minor)
                          setCoinsInserted(result.session.coinsInsertedMinor)
                        } catch {
                          insertCoin(coin.minor)
                        }
                      })
                  }}
                  disabled={!ready || coinsInsertedMinor >= total}
                  className="min-h-[48px] rounded-xl border border-outline font-black disabled:opacity-40"
                >
                  {coin.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {payingByQr && (
          <div className="mt-5 flex items-center gap-3">
            <span className="text-sm text-text-secondary">Ref. last 4</span>
            <RefDigits value={refDigits} onChange={setRefDigits} />
          </div>
        )}

        {!ready && (
          <p className="mt-4 text-sm text-error">
            {printerStatus === 'paper_jam'
              ? 'Clear the paper jam before paying.'
              : printerStatus === 'offline'
                ? 'The printer is offline.'
                : `Add paper. This job needs ${sheets} sheets and the tray has ${paperCount}.`}
          </p>
        )}
      </div>

      <div className="px-5 pb-6">
        <div className="rounded-full bg-surface-variant min-h-[56px] flex items-center justify-center gap-2 text-sm font-semibold text-[#b89b1e]">
          <span className="w-5 h-5 rounded-full border-2 border-[#e6c84a] border-t-transparent animate-spin" />
          {!payingByQr
            ? remaining > 0
              ? `Insert ${formatPhp(remaining)} more...`
              : 'Payment received'
            : qrReady
              ? 'Checking your payment...'
              : 'Waiting for the reference number'}
        </div>
      </div>
    </KioskLayout>
  )
}

function Tab({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[48px] rounded-xl font-bold border ${
        selected
          ? 'bg-[#1a1a1a] text-white border-transparent dark:bg-white dark:text-[#1a1a1a]'
          : 'bg-surface text-text-primary border-outline'
      }`}
    >
      {label}
    </button>
  )
}

function RefDigits({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 4 }, (_, index) => value[index] ?? '')

  function write(index: number, raw: string) {
    const nextChar = raw.replace(/\D/g, '').slice(-1)
    const chars = digits.slice()
    chars[index] = nextChar
    onChange(chars.join(''))
    if (nextChar && index < 3) inputs.current[index + 1]?.focus()
  }

  return (
    <div className="flex gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node
          }}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          aria-label={`Reference digit ${index + 1}`}
          onChange={(event) => write(index, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !digit && index > 0) inputs.current[index - 1]?.focus()
          }}
          className="w-11 h-12 rounded-xl border border-outline bg-surface text-center text-lg font-black"
        />
      ))}
    </div>
  )
}
