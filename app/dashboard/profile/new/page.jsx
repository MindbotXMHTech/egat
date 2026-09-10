'use client'
import { useState } from 'react'
import { useAuth } from '../../../../components/AuthContext'
import {
  ACCESSIBILITY_PRESETS,
  emptyAccountDraft,
  isAdminRole,
  persistAccountSites,
  ROLE_ADMIN,
  ROLE_EMPLOYEE,
  ROLE_SUPER_ADMIN,
} from '../../../../lib/authAccounts'
import {
  BackButton,
  BoxedInput,
  BoxedSelect,
  FieldLabel,
  GoldButton,
  OutlineButton,
  SectionTitle,
  SuccessModal,
} from '../../../../components/account/AccountUi'
import SiteAccessPicker from '../../../../components/account/SiteAccessPicker'

const ROLE_OPTIONS = [
  { value: ROLE_SUPER_ADMIN, label: ROLE_SUPER_ADMIN },
  { value: ROLE_ADMIN, label: ROLE_ADMIN },
  { value: ROLE_EMPLOYEE, label: ROLE_EMPLOYEE },
]

const ACCESS_OPTIONS = ACCESSIBILITY_PRESETS.map(p => ({ value: p.id, label: p.label }))

export default function CreateAccountPage() {
  const { createAccount } = useAuth()
  const [draft, setDraft] = useState(emptyAccountDraft)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)

  function patch(partial) {
    setDraft(d => ({ ...d, ...partial }))
    setError('')
  }

  function onRoleChange(role) {
    setDraft(d => ({
      ...d,
      role,
      accessibility: isAdminRole(role) ? (d.accessibility || 'all') : d.accessibility,
    }))
    setError('')
  }

  function handleCreate() {
    if (!draft.name.trim() || !draft.lastname.trim() || !draft.email.trim() || !draft.role || !draft.accessibility) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบ')
      return
    }
    if (!persistAccountSites(draft.sitesAll, draft.sites).length && draft.sitesAll === false) {
      setError('เลือกอย่างน้อย 1 ไซต์ หรือเลือกทุกไซต์')
      return
    }
    if (!draft.sendInvite && !draft.setTempPassword) {
      setError('เลือก Password Setup อย่างน้อย 1 รายการ')
      return
    }
    if (draft.setTempPassword && !draft.tempPassword.trim()) {
      setError('กรุณากรอกรหัสผ่านชั่วคราว')
      return
    }
    const row = createAccount(draft)
    setCreated(row)
  }

  const successTitle = isAdminRole(created?.role) ? 'Create Admin Success' : 'Create User Success'

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton href="/dashboard/profile" />
        <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
          Create New User
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-4">
            <div className="flex flex-col gap-3">
              <FieldLabel required>Role</FieldLabel>
              <BoxedSelect
                value={draft.role}
                onChange={onRoleChange}
                options={ROLE_OPTIONS}
              />
            </div>
            <div className="flex flex-col gap-3">
              <FieldLabel required>Accessibility</FieldLabel>
              <BoxedSelect
                value={draft.accessibility}
                onChange={v => patch({ accessibility: v })}
                options={ACCESS_OPTIONS}
              />
            </div>
          </div>
          <SiteAccessPicker
            allSites={draft.sitesAll}
            sites={draft.sites}
            onChange={patch}
          />
          <p className="text-xs" style={{ color: '#64748B' }}>
            แอดมินเปิดทุกโมดูลรวม Account Management — พนักงานเปิดตาม Accessibility และไซต์ที่เลือก
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <FieldLabel required>Password Setup</FieldLabel>
          <label className="flex items-center gap-2 text-base cursor-pointer" style={{ color: '#222' }}>
            <input
              type="checkbox"
              checked={draft.sendInvite}
              onChange={e => patch({ sendInvite: e.target.checked })}
              className="size-4 rounded"
            />
            Send Invite Email
          </label>
          <label className="flex flex-wrap items-center gap-2 text-base cursor-pointer" style={{ color: '#222' }}>
            <input
              type="checkbox"
              checked={draft.setTempPassword}
              onChange={e => patch({ setTempPassword: e.target.checked })}
              className="size-4 rounded"
            />
            Set Temporary Password :
            <span className="min-w-[180px]">
              <BoxedInput
                type="password"
                value={draft.tempPassword}
                onChange={v => patch({ tempPassword: v, setTempPassword: true })}
                placeholder=""
              />
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm" style={{ color: '#ED1A3B' }}>{error}</p>
        )}

        <div className="flex items-center justify-end gap-4">
          <OutlineButton href="/dashboard/profile">Cancel</OutlineButton>
          <GoldButton icon="plus" iconPosition="left" onClick={handleCreate}>Create</GoldButton>
        </div>
      </div>

      {created && (
        <SuccessModal
          title={successTitle}
          href="/dashboard/profile"
        />
      )}
    </div>
  )
}
