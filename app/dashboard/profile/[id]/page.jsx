'use client'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../../components/AuthContext'
import { accessibilityDisplay, displayName, sitesDisplay } from '../../../../lib/authAccounts'
import {
  BackButton,
  FieldLabel,
  FieldValue,
  GoldButton,
  SectionTitle,
} from '../../../../components/account/AccountUi'
import UserActivityPanel from '../../../../components/account/UserActivityPanel'

export default function ViewAccountPage() {
  const { id } = useParams()
  const { getAccount } = useAuth()
  const account = getAccount(id)

  if (!account) {
    return (
      <div className="animate-fade-in flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/profile" />
          <h1 className="text-2xl sm:text-[32px] font-bold" style={{ color: '#034EA2' }}>Profile</h1>
        </div>
        <div className="bg-white rounded-lg p-6 text-sm" style={{ color: '#64748B' }}>ไม่พบบัญชีนี้</div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton href="/dashboard/profile" />
        <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
          Profile
        </h1>
      </div>

      <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
        <div className="flex justify-end">
          <GoldButton icon="edit" href={`/dashboard/profile/${account.id}/edit`}>
            Edit
          </GoldButton>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Information</SectionTitle>
          <div className="flex flex-col gap-3">
            <FieldLabel>Name</FieldLabel>
            <FieldValue>{displayName(account)}</FieldValue>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Contact</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-4">
            <div className="flex flex-col gap-3">
              <FieldLabel>Email</FieldLabel>
              <FieldValue>{account.email}</FieldValue>
            </div>
            <div className="flex flex-col gap-3">
              <FieldLabel>Tel.</FieldLabel>
              <FieldValue>{account.tel}</FieldValue>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Permission</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-4">
            <div className="flex flex-col gap-3">
              <FieldLabel>Role</FieldLabel>
              <FieldValue>{account.role}</FieldValue>
            </div>
            <div className="flex flex-col gap-3">
              <FieldLabel>Accessibility</FieldLabel>
              <FieldValue>{accessibilityDisplay(account)}</FieldValue>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <FieldLabel>Sites</FieldLabel>
            <FieldValue>{sitesDisplay(account)}</FieldValue>
          </div>
        </div>
      </div>

      <UserActivityPanel account={account} />
    </div>
  )
}
