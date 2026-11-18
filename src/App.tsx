import { Welcome } from './screens/Welcome'
import { PrintSettings } from './screens/PrintSettings'
import { ScanQR } from './screens/ScanQR'
import { FileReceived } from './screens/FileReceived'
import { StartPrinting } from './screens/StartPrinting'
import { PrintingProgress } from './screens/PrintingProgress'
import { Confirmation } from './screens/Confirmation'
import { PhoneUpload } from './pages/PhoneUpload'
import { useKiosk } from './store/kiosk'

export default function App() {
  // Check for phone upload page
  const params = new URLSearchParams(window.location.search)
  if (params.get('page') === 'upload') {
    return (
      <PhoneUpload
        session={params.get('session') ?? ''}
        mode={(params.get('mode') as 'file' | 'receipt' | 'portal') || 'portal'}
      />
    )
  }

  return <KioskApp />
}

function KioskApp() {
  const screen = useKiosk((s) => s.screen)

  switch (screen) {
    case 'welcome':
      return <Welcome />
    case 'print-settings':
      return <PrintSettings />
    case 'scan-qr':
      return <ScanQR />
    case 'file-received':
      return <FileReceived />
    case 'start-printing':
      return <StartPrinting />
    case 'printing-progress':
      return <PrintingProgress />
    case 'confirmation':
      return <Confirmation />
    default:
      return <Welcome />
  }
}
