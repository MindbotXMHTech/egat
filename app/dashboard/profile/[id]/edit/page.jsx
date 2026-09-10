'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../../../components/AuthContext'
import {
  ACCESSIBILITY_PRESETS,
  featuresForPreset,
  hasAllSites,
  isAdminRole,
  persistAccountSites,
} from '../../../../../lib/authAccounts'
import {
  BackButton,
  BoxedInput,
  BoxedSelect,
  FieldLabel,
  GoldButton,
  OutlineButton,
  SectionTitle,
  SuccessModal,
} from '../../../../../components/account/AccountUi'
import SiteAccessPicker from '../../../../../components/account/SiteAccessPicker'

const ACCESS_OPTIONS = ACCESSIBILITY_PRESETS.map(p => ({ value: p.id, label: p.label }))

export default function EditAccountPage() {
  const { id } = useParams()
  const { getAccount, updateAccount } = useAuth()
  const account = getAccount(id)
  const [edits, setEdits] = useState(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const draft = edits ?? (account
    ? {
        name: account.name || '',
        lastname: account.lastname || '',
        email: account.email || '',
        tel: account.tel || '',
        accessibility: account.accessibility || 'all',
        sitesAll: hasAllSites(account),
        sites: hasAllSites(account) ? [] : (account.sites || []),
      }
    : null)

  if (!account) {
    return (
      <div className="animate-fade-in flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/profile" />
          <h1 className="text-2xl sm:text-[32px] font-bold" style={{ color: '#034EA2' }}>Edit User</h1>
        </div>
        <div className="bg-white rounded-lg p-6 text-sm" style={{ color: '#64748B' }}>ไม่พบบัญชีนี้</div>
      </div>
    )
  }

  function patch(partial) {
    setEdits(d => ({ ...(d || draft), ...partial }))
    setError('')
  }

  function handleSave() {
    if (!draft.name.trim() || !draft.lastname.trim() || !draft.email.trim()) {
      setError('กรุณากรอก Name, Lastname และ Email')
      return
    }
    if (!draft.accessibility) {
      setError('กรุณาเลือก Accessibility')
      return
    }
    if (draft.sitesAll === false && !persistAccountSites(false, draft.sites).length) {
      setError('เลือกอย่างน้อย 1 ไซต์ หรือเลือกทุกไซต์')
      return
    }
    updateAccount(account.id, {
      name: draft.name.trim(),
      lastname: draft.lastname.trim(),
      email: draft.email.trim(),
      tel: draft.tel.trim(),
      accessibility: draft.accessibility,
      features: isAdminRole(account.role)
        ? account.features
        : featuresForPreset(draft.accessibility),
      sites: persistAccountSites(draft.sitesAll, draft.sites),
    })
    setSaved(true)
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton href={`/dashboard/profile/${account.id}`} />
        <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
          Edit User
        </h1>
      </div>

      <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <SectionTitle>Information</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-4">
            <div className="flex flex-col gap-3">
              <FieldLabel required>Name</FieldLabel>
              <BoxedInput value={draft.name} onChange={v => patch({ name: v })} placeholder="Name" />
            </div>
            <div className="flex flex-col gap-3">
              <FieldLabel required>Lastname</FieldLabel>
              <BoxedInput value={draft.lastname} onChange={v => patch({ lastname: v })} placeholder="Lastname" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Contact</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-4">
            <div className="flex flex-col gap-3">
              <FieldLabel required>Email</FieldLabel>
              <BoxedInput type="email" value={draft.email} onChange={v => patch({ email: v })} placeholder="Email" />
            </div>
            <div className="flex flex-col gap-3">
              <FieldLabel>Tel.</FieldLabel>
              <BoxedInput value={draft.tel} onChange={v => patch({ tel: v })} placeholder="Tel." />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle>Permission</SectionTitle>
          <div className="flex flex-col gap-3">
            <FieldLabel required>Accessibility</FieldLabel>
            <BoxedSelect
              value={draft.accessibility}
              onChange={v => patch({ accessibility: v })}
              options={ACCESS_OPTIONS}
            />
          </div>
          <SiteAccessPicker
            allSites={draft.sitesAll}
            sites={draft.sites}
            onChange={patch}
          />
        </div>

        {error && <p className="text-sm" style={{ color: '#ED1A3B' }}>{error}</p>}

        <div className="flex items-center justify-end gap-4">
          <OutlineButton href={`/dashboard/profile/${account.id}`}>Cancel</OutlineButton>
          <GoldButton icon="edit" onClick={handleSave}>Save</GoldButton>
        </div>
      </div>

      {saved && (
        <SuccessModal
          title="Edit Success"
          href={`/dashboard/profile/${account.id}`}
        />
      )}
    </div>
  )
}
