import Sidebar from '../../components/Sidebar'
import FeatureGate from '../../components/FeatureGate'
import { HeaderFilterProvider } from '../../components/HeaderFilterContext'

export default function DashboardLayout({ children }) {
  return (
    <HeaderFilterProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-egat-bg min-w-0">
          <div className="p-4 sm:p-6 min-h-full">
            <FeatureGate>{children}</FeatureGate>
          </div>
        </main>
      </div>
    </HeaderFilterProvider>
  )
}
