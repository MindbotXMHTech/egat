'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { displayName, modulesForAccount } from '../../lib/authAccounts'
import {
  BackButton,
  FieldLabel,
  FieldValue,
  GoldButton,
  ModuleChips,
  OutlineButton,
  SectionTitle,
  SuccessModal,
} from './AccountUi'

function UnderlineInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-[500px] bg-transparent text-base py-1 border-0 border-b outline-none"
      style={{ borderColor: '#034EA2', color: '#222' }}
    />
  )
}

function Divider() {
  return <div className="w-full border-t" style={{ borderColor: '#DDE3ED' }} />
}

function profileFromUser(user) {
  if (!user) {
    return { name: '', tel: '', role: '', email: '' }
  }
  return {
    name: displayName(user),
    tel: user.tel || '',
    role: user.role || '',
    email: user.email || '',
  }
}

export default function OwnProfile() {
  const router = useRouter()
  const { currentUser, updateAccount } = useAuth()
  const [view, setView] = useState('profile')
  const [profile, setProfile] = useState(() => profileFromUser(currentUser))
  const [draft, setDraft] = useState(() => profileFromUser(currentUser))
  const [newEmail, setNewEmail] = useState('')
  const [passwords, setPasswords] = useState({ old: '', next: '', confirm: '' })
  const [editSuccess, setEditSuccess] = useState(false)
  const modules = modulesForAccount(currentUser)

  useEffect(() => {
    const next = profileFromUser(currentUser)
    setProfile(next)
  }, [currentUser])

  function openEdit() {
    setDraft(profile)
    setView('edit')
  }

  function saveEdit() {
    const parts = draft.name.trim().split(/\s+/)
    updateAccount(currentUser.id, {
      name: parts[0] || '',
      lastname: parts.slice(1).join(' '),
      tel: draft.tel,
    })
    setProfile(d => ({ ...d, name: draft.name, tel: draft.tel }))
    setView('profile')
    setEditSuccess(true)
  }

  function saveEmail() {
    if (newEmail.trim()) {
      updateAccount(currentUser.id, { email: newEmail.trim() })
      setProfile(p => ({ ...p, email: newEmail.trim() }))
    }
    setNewEmail('')
    setView('profile')
  }

  function savePassword() {
    setPasswords({ old: '', next: '', confirm: '' })
    setView('profile')
  }

  const title = view === 'email' ? 'Change Email' : view === 'password' ? 'Change Password' : 'Profile'

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton onClick={() => (view === 'profile' ? router.push('/dashboard') : setView('profile'))} />
        <h1 className="text-2xl sm:text-[32px] font-bold leading-none" style={{ color: '#034EA2' }}>
          {title}
        </h1>
      </div>

      {view === 'profile' && (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-14 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <SectionTitle>Information</SectionTitle>
              <div className="flex flex-col gap-4">
                <FieldLabel>Name</FieldLabel>
                <FieldValue>{profile.name}</FieldValue>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <SectionTitle>Contact</SectionTitle>
              <div className="flex flex-col gap-4">
                <FieldLabel>Tel.</FieldLabel>
                <FieldValue>{profile.tel}</FieldValue>
              </div>
            </div>
            <GoldButton onClick={openEdit} icon="edit">Edit Profile</GoldButton>
          </div>

          <div className="flex flex-col gap-4">
            <SectionTitle>Permission</SectionTitle>
            <div className="flex flex-col gap-4">
              <FieldLabel>Role</FieldLabel>
              <FieldValue>{profile.role}</FieldValue>
              <FieldLabel>โมดูลที่เปิดใช้งาน</FieldLabel>
              <ModuleChips modules={modules} />
            </div>
          </div>

          <Divider />

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <FieldLabel>Email</FieldLabel>
              <FieldValue>{profile.email}</FieldValue>
            </div>
            <GoldButton onClick={() => { setNewEmail(''); setView('email') }} icon="edit">Change Email</GoldButton>
          </div>

          <Divider />

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <FieldLabel>Password</FieldLabel>
              <FieldValue>xxxxxxxxxxxxx</FieldValue>
            </div>
            <GoldButton onClick={() => { setPasswords({ old: '', next: '', confirm: '' }); setView('password') }} icon="edit">
              Change Password
            </GoldButton>
          </div>
        </div>
      )}

      {view === 'edit' && (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-14 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <SectionTitle>Information</SectionTitle>
              <FieldLabel>Name</FieldLabel>
              <UnderlineInput value={draft.name} onChange={v => setDraft(d => ({ ...d, name: v }))} placeholder="Name*" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <SectionTitle>Contact</SectionTitle>
              <FieldLabel>Tel.</FieldLabel>
              <UnderlineInput value={draft.tel} onChange={v => setDraft(d => ({ ...d, tel: v }))} placeholder="Tel." />
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <OutlineButton onClick={() => setView('profile')}>Cancel</OutlineButton>
            <GoldButton onClick={saveEdit} icon="edit">Save</GoldButton>
          </div>
        </div>
      )}

      {view === 'email' && (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4 w-full">
            <SectionTitle>New Email</SectionTitle>
            <UnderlineInput value={newEmail} onChange={setNewEmail} placeholder="New Email*" type="email" />
          </div>
          <Divider />
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <FieldLabel>Email</FieldLabel>
              <FieldValue>{profile.email}</FieldValue>
            </div>
            <GoldButton onClick={saveEmail} icon="edit">Confirm Email</GoldButton>
          </div>
          <Divider />
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <FieldLabel>Password</FieldLabel>
              <FieldValue>xxxxxxxxxxxxx</FieldValue>
            </div>
            <GoldButton onClick={() => setView('password')} icon="edit">Change Password</GoldButton>
          </div>
        </div>
      )}

      {view === 'password' && (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-6 w-full max-w-[500px]">
            <SectionTitle>New Password</SectionTitle>
            <UnderlineInput
              type="password"
              value={passwords.old}
              onChange={v => setPasswords(p => ({ ...p, old: v }))}
              placeholder="Old Password*"
            />
            <UnderlineInput
              type="password"
              value={passwords.next}
              onChange={v => setPasswords(p => ({ ...p, next: v }))}
              placeholder="New Password*"
            />
            <UnderlineInput
              type="password"
              value={passwords.confirm}
              onChange={v => setPasswords(p => ({ ...p, confirm: v }))}
              placeholder="Confirm Password*"
            />
          </div>
          <div className="flex items-center justify-end gap-4">
            <OutlineButton onClick={() => setView('profile')}>Cancel</OutlineButton>
            <GoldButton onClick={savePassword} icon="edit">Save</GoldButton>
          </div>
        </div>
      )}
      {editSuccess && <SuccessModal title="Edit Success" onDone={() => setEditSuccess(false)} />}
    </div>
  )
}
