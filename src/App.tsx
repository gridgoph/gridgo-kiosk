import { useEffect } from 'react'
import { Welcome } from './screens/Welcome'
import { PrintSettings } from './screens/PrintSettings'
import { ScanQR } from './screens/ScanQR'
import { Pay } from './screens/Pay'
import { Paid } from './screens/Paid'
import { PrintingProgress } from './screens/PrintingProgress'
import { Confirmation } from './screens/Confirmation'
import { PhoneUpload } from './pages/PhoneUpload'
import { useKiosk } from './store/kiosk'
import { getMachine } from './lib/kioskApi'
import type { ThemeMode } from './types'

export default function App() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('page') === 'upload') {
    return <PhoneUpload session={params.get('session') ?? ''} />
  }

  return <KioskApp />
}

function KioskApp() {
  const screen = useKiosk((s) => s.screen)
  const theme = useKiosk((s) => s.theme)
  const applyMachine = useKiosk((s) => s.applyMachine)

  useEffect(() => {
    let stop = false
    async function pull() {
      try {
        const result = await getMachine()
        if (!stop) applyMachine(result.machine)
      } catch {
        // Keep the last tray, status, and prices when the API is offline.
      }
    }
    void pull()
    const id = window.setInterval(pull, 4000)
    return () => {
      stop = true
      window.clearInterval(id)
    }
  }, [applyMachine])

  useEffect(() => {
    function apply() {
      document.documentElement.classList.toggle('dark', isDarkTheme(theme))
    }
    apply()
    const id = window.setInterval(apply, 60_000)
    return () => window.clearInterval(id)
  }, [theme])

  switch (screen) {
    case 'welcome':
      return <Welcome />
    case 'scan-qr':
      return <ScanQR />
    case 'print-settings':
      return <PrintSettings />
    case 'pay':
      return <Pay />
    case 'paid':
      return <Paid />
    case 'printing':
      return <PrintingProgress />
    case 'confirmation':
      return <Confirmation />
    default:
      return <Welcome />
  }
}

function isDarkTheme(theme: ThemeMode, date = new Date()) {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  const hour = date.getHours()
  return hour < 6 || hour >= 18
}
