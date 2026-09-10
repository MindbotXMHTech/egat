'use client'
import { useAuth } from '../../../components/AuthContext'
import AccountManagement from '../../../components/account/AccountManagement'
import OwnProfile from '../../../components/account/OwnProfile'

export default function ProfilePage() {
  const { ready, isAdmin } = useAuth()
  if (!ready) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm" style={{ color: '#8896A4' }}>
        กำลังโหลด...
      </div>
    )
  }
  return isAdmin ? <AccountManagement /> : <OwnProfile />
}
