'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { Profile, Stage } from '@/lib/types'
import { stageOrder } from '@/lib/guidance'
import SafeMarkdown from './SafeMarkdown'

type Props = { profile: Profile; onSignOut: () => void }
type Tab = 'overview' | 'people' | 'documents' | 'learning' | 'appointments' | 'institutions' | 'settings' | 'audit'

type Participant = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'counsellor' | 'student'
  active: boolean
  force_password_change: boolean
  created_at?: string | null
}
type Details = { user_id: string; stage: Stage; career_focus: string | null; graduation_year: number | null; participant_type: 'student' | 'client' | null }
type Doc = {
  id: string; title: string; description: string | null; category: string; source_type: string
  external_url: string | null; storage_path: string | null; file_name: string | null
  visibility: string; active: boolean; created_at: string
}
type DocAssignment = { id: string; document_id: string; student_id: string; student_message: string | null; due_date: string | null; assigned_at: string }
type ModuleRecord = { id: string; slug: string; category: string; title: string; summary: string; content_md: string; external_url: string | null; is_published: boolean }
type ModuleAssignment = { id: string; student_id: string; module_id: string; status: string; due_date: string | null; assigned_at: string }
type Appointment = { id: string; student_id: string; requested_start: string | null; confirmed_start: string | null; duration_minutes: number; topic: string; student_message: string | null; staff_response: string | null; status: string }
type Institution = { id: string; name: string; institution_type: string; country: string; website_url: string; admissions_url: string | null; notes: string | null; active: boolean }
type AuditEvent = { id: string; actor_id: string | null; action: string; entity_type: string | null; entity_id: string | null; metadata: Record<string, unknown> | null; created_at: string }
type Settings = {
  portal_name: string; organisation_name: string; counsellor_name: string; counsellor_email: string | null
  booking_provider: string; booking_url: string | null; welcome_message: string
  logo_url: string | null; logo_path: string | null
  primary_color: string; accent_color: string; background_color: string; sidebar_color: string
}
type Note = { id: string; created_at: string; text: string }
type Assessment = { id: string; kind: string; payload: Record<string, unknown>; scores: Record<string, number>; created_at: string }
type SubjectResult = { id: string; subject_name: string; score: number | null; enjoyment: number | null; confidence: number | null }
type ActionItem = { id: string; title: string; notes: string | null; due_date: string | null; status: string }

const DEFAULT_SETTINGS: Settings = {
  portal_name: 'Pathways', organisation_name: '', counsellor_name: 'Pathways counsellor', counsellor_email: null,
  booking_provider: 'internal', booking_url: null, welcome_message: 'Welcome back to your career-development journey.',
  logo_url: null, logo_path: null,
  primary_color: '#0d766e', accent_color: '#c58a2b', background_color: '#f4f6f3', sidebar_color: '#102b31'
}

const DOC_CATEGORIES = ['Application Form', 'Class Schedule', 'University / TVET', 'Career Information', 'CV / Application', 'Bursary / Funding', 'General']
const MODULE_CATEGORIES = ['Self discovery', 'Subjects & careers', 'University & TVET', 'Work & study', 'Gap year', 'Entrepreneurship', 'Leaving school', 'Interviews', 'CV & applications']

function fmt(value: string | null | undefined) {
  if (!value) return '—'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

export default function StaffPortal({ profile, onSignOut }: Props) {
  const supabase = useMemo(() => getSupabaseBrowser(), [])
  const isAdmin = profile.role === 'admin'

  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [warning, setWarning] = useState('')

  const [people, setPeople] = useState<Participant[]>([])
  const [details, setDetails] = useState<Details[]>([])
  const [docs, setDocs] = useState<Doc[]>([])
  const [docAssignments, setDocAssignments] = useState<DocAssignment[]>([])
  const [modules, setModules] = useState<ModuleRecord[]>([])
  const [moduleAssignments, setModuleAssignments] = useState<ModuleAssignment[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [audit, setAudit] = useState<AuditEvent[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null)
  const [credential, setCredential] = useState<{ email: string; password: string } | null>(null)

  const notify = useCallback((text: string, isWarning = false) => {
    if (isWarning) { setWarning(text); setMessage('') } else { setMessage(text); setWarning('') }
  }, [])

  const authHeaders = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token || ''}`, 'Content-Type': 'application/json' }
  }, [supabase])

  const refresh = useCallback(async () => {
    setLoading(true)
    const [pr, sd, pd, da, lm, ma, ap, inst, st, au] = await Promise.all([
      supabase.from('profiles').select('id,email,full_name,role,active,force_password_change,created_at').order('full_name'),
      supabase.from('student_details').select('user_id,stage,career_focus,graduation_year,participant_type'),
      supabase.from('portal_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('document_assignments').select('*').order('assigned_at', { ascending: false }),
      supabase.from('learning_modules').select('id,slug,category,title,summary,content_md,external_url,is_published').order('category'),
      supabase.from('module_assignments').select('id,student_id,module_id,status,due_date,assigned_at').order('assigned_at', { ascending: false }),
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('institutions').select('*').order('name'),
      supabase.from('portal_settings').select('*').eq('id', true).maybeSingle(),
      supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100)
    ])
    setPeople((pr.data || []) as Participant[])
    setDetails((sd.data || []) as Details[])
    setDocs((pd.data || []) as Doc[])
    setDocAssignments((da.data || []) as DocAssignment[])
    setModules((lm.data || []) as ModuleRecord[])
    setModuleAssignments((ma.data || []) as ModuleAssignment[])
    setAppointments((ap.data || []) as Appointment[])
    setInstitutions((inst.data || []) as Institution[])
    setAudit((au.data || []) as AuditEvent[])
    if (st.data) setSettings({ ...DEFAULT_SETTINGS, ...(st.data as Partial<Settings>) })
    if (pr.error) setWarning('Some portal data could not be loaded. Check that the Pathways database schema is applied.')
    setLoading(false)
  }, [supabase])

  useEffect(() => { void refresh() }, [refresh])

  const participants = people.filter(p => p.role === 'student')
  const staff = people.filter(p => p.role === 'admin' || p.role === 'counsellor')
  const detailsFor = (id: string) => details.find(d => d.user_id === id) || null
  const labelFor = (id: string) => {
    const person = people.find(p => p.id === id)
    return person ? person.full_name : 'Unknown participant'
  }
  const typeOf = (id: string) => (detailsFor(id)?.participant_type === 'client' ? 'Client' : 'Student')

  /* ---------------------------------------------------------------- people */

  async function createAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const body = {
      email: String(data.get('email') || ''),
      fullName: String(data.get('fullName') || ''),
      role: String(data.get('role') || 'student'),
      participantType: String(data.get('participantType') || 'student'),
      stage: String(data.get('stage') || 'Form 1')
    }
    const response = await fetch('/api/admin/users', { method: 'POST', headers: await authHeaders(), body: JSON.stringify(body) })
    const result = await response.json().catch(() => ({ error: 'Unexpected response from the server.' }))
    if (!response.ok) { notify(result.error || 'The account could not be created.', true); return }
    setCredential({ email: result.email, password: result.temporaryPassword })
    notify('Account created. Share the temporary password below — it is shown only once.')
    form.reset()
    await refresh()
  }

  async function resetPassword(id: string) {
    const response = await fetch(`/api/admin/users/${id}/reset`, { method: 'POST', headers: await authHeaders() })
    const result = await response.json().catch(() => ({ error: 'Unexpected response from the server.' }))
    if (!response.ok) { notify(result.error || 'The password could not be reset.', true); return }
    setCredential({ email: labelFor(id), password: result.temporaryPassword })
    notify('A new temporary password was generated. The participant must change it at next sign-in.')
    await refresh()
  }

  async function setActive(id: string, active: boolean) {
    const { error } = await supabase.from('profiles').update({ active }).eq('id', id)
    notify(error ? error.message : active ? 'Account activated.' : 'Account deactivated.', Boolean(error))
    if (!error) await refresh()
  }

  async function saveParticipantDetails(e: FormEvent<HTMLFormElement>, userId: string) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const graduation = String(data.get('graduation_year') || '')
    const { error } = await supabase.from('student_details').upsert({
      user_id: userId,
      stage: String(data.get('stage') || 'Form 1'),
      participant_type: String(data.get('participant_type') || 'student'),
      career_focus: String(data.get('career_focus') || ''),
      graduation_year: graduation ? Number(graduation) : null
    })
    notify(error ? error.message : 'Participant record updated.', Boolean(error))
    if (!error) await refresh()
  }

  /* ------------------------------------------------------------- documents */

  async function saveDocument(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const source = String(data.get('source') || 'upload')
    const url = String(data.get('url') || '').trim()
    const payload: Record<string, unknown> = {
      title: String(data.get('title') || '').trim(),
      description: String(data.get('description') || '').trim() || null,
      category: String(data.get('category') || 'General'),
      visibility: String(data.get('visibility') || 'assigned_students'),
      source_type: source,
      external_url: source === 'upload' ? null : url,
      active: String(data.get('active') || 'true') === 'true'
    }
    if (!payload.title) { notify('A document title is required.', true); return }

    if (source === 'upload') {
      const file = data.get('file') as File | null
      if (file && file.size) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${profile.id}/${crypto.randomUUID()}-${safeName}`
        const upload = await supabase.storage.from('pathways-documents').upload(path, file, { upsert: false })
        if (upload.error) { notify(upload.error.message, true); return }
        payload.storage_path = path
        payload.file_name = file.name
      } else if (!editingDoc) {
        notify('Choose a file to upload, or switch the source to a link.', true)
        return
      }
    } else if (!url) {
      notify('Add the Google Drive, Dropbox or web link.', true)
      return
    }

    const result = editingDoc
      ? await supabase.from('portal_documents').update(payload).eq('id', editingDoc.id)
      : await supabase.from('portal_documents').insert({ ...payload, created_by: profile.id })
    if (result.error) { notify(result.error.message, true); return }
    notify(editingDoc ? 'Document updated.' : 'Document added to the library.')
    setEditingDoc(null)
    form.reset()
    await refresh()
  }

  async function togglePublished(doc: Doc) {
    const { error } = await supabase.from('portal_documents').update({ active: !doc.active }).eq('id', doc.id)
    notify(error ? error.message : doc.active ? 'Document unpublished.' : 'Document published.', Boolean(error))
    if (!error) await refresh()
  }

  async function deleteDocument(doc: Doc) {
    if (!window.confirm(`Permanently delete “${doc.title}”? This also removes it from every participant.`)) return
    await supabase.from('document_assignments').delete().eq('document_id', doc.id)
    const { error } = await supabase.from('portal_documents').delete().eq('id', doc.id)
    if (!error && doc.storage_path) await supabase.storage.from('pathways-documents').remove([doc.storage_path])
    notify(error ? error.message : 'Document deleted.', Boolean(error))
    if (!error) { if (editingDoc?.id === doc.id) setEditingDoc(null); await refresh() }
  }

  async function assignDocument(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const documentId = String(data.get('document_id') || '')
    const target = String(data.get('student_id') || '')
    const studentMessage = String(data.get('student_message') || '').trim() || null
    const dueDate = String(data.get('due_date') || '') || null
    if (!documentId) { notify('Choose a document first.', true); return }

    const targets = target === 'everyone' ? participants.filter(p => p.active).map(p => p.id) : [target]
    if (!targets.length) { notify('There are no active participants to assign to.', true); return }
    const rows = targets.map(id => ({ document_id: documentId, student_id: id, student_message: studentMessage, due_date: dueDate, assigned_by: profile.id }))
    const { error } = await supabase.from('document_assignments').upsert(rows, { onConflict: 'document_id,student_id' })
    notify(error ? error.message : `Document sent to ${targets.length} participant${targets.length === 1 ? '' : 's'}.`, Boolean(error))
    if (!error) { form.reset(); await refresh() }
  }

  async function removeAssignment(id: string) {
    const { error } = await supabase.from('document_assignments').delete().eq('id', id)
    notify(error ? error.message : 'Assignment removed.', Boolean(error))
    if (!error) await refresh()
  }

  /* -------------------------------------------------------------- learning */

  async function saveModule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const title = String(data.get('title') || '').trim()
    const slug = (String(data.get('slug') || '').trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    const { error } = await supabase.from('learning_modules').upsert({
      slug,
      title,
      category: String(data.get('category') || 'Self discovery'),
      summary: String(data.get('summary') || '').trim(),
      content_md: String(data.get('content_md') || '').trim(),
      external_url: String(data.get('external_url') || '').trim() || null,
      is_published: String(data.get('is_published') || 'true') === 'true'
    }, { onConflict: 'slug' })
    notify(error ? error.message : 'Learning module saved.', Boolean(error))
    if (!error) { form.reset(); await refresh() }
  }

  async function toggleModulePublished(record: ModuleRecord) {
    const { error } = await supabase.from('learning_modules').update({ is_published: !record.is_published }).eq('id', record.id)
    notify(error ? error.message : record.is_published ? 'Module unpublished.' : 'Module published.', Boolean(error))
    if (!error) await refresh()
  }

  async function assignModule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const moduleId = String(data.get('module_id') || '')
    const target = String(data.get('student_id') || '')
    const dueDate = String(data.get('due_date') || '') || null
    if (!moduleId || !target) { notify('Choose a module and a participant.', true); return }
    const targets = target === 'everyone' ? participants.filter(p => p.active).map(p => p.id) : [target]
    const rows = targets.map(id => ({ module_id: moduleId, student_id: id, assigned_by: profile.id, status: 'assigned', due_date: dueDate }))
    const { error } = await supabase.from('module_assignments').upsert(rows, { onConflict: 'module_id,student_id' })
    notify(error ? error.message : `Module assigned to ${targets.length} participant${targets.length === 1 ? '' : 's'}.`, Boolean(error))
    if (!error) { form.reset(); await refresh() }
  }

  /* ---------------------------------------------------- appointments & TVET */

  async function respondToAppointment(e: FormEvent<HTMLFormElement>, appointment: Appointment) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const confirmed = String(data.get('confirmed_start') || '')
    const { error } = await supabase.from('appointments').update({
      confirmed_start: confirmed ? new Date(confirmed).toISOString() : appointment.confirmed_start,
      staff_response: String(data.get('staff_response') || '').trim() || null,
      status: String(data.get('status') || appointment.status)
    }).eq('id', appointment.id)
    notify(error ? error.message : 'Appointment updated.', Boolean(error))
    if (!error) await refresh()
  }

  async function saveInstitution(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const { error } = await supabase.from('institutions').insert({
      name: String(data.get('name') || '').trim(),
      institution_type: String(data.get('institution_type') || 'University'),
      country: String(data.get('country') || 'Botswana'),
      website_url: String(data.get('website_url') || '').trim(),
      admissions_url: String(data.get('admissions_url') || '').trim() || null,
      notes: String(data.get('notes') || '').trim() || null,
      active: true
    })
    notify(error ? error.message : 'Institution added.', Boolean(error))
    if (!error) { form.reset(); await refresh() }
  }

  async function toggleInstitution(institution: Institution) {
    const { error } = await supabase.from('institutions').update({ active: !institution.active }).eq('id', institution.id)
    notify(error ? error.message : 'Institution updated.', Boolean(error))
    if (!error) await refresh()
  }

  /* ------------------------------------------------------ branding/settings */

  async function saveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const payload = {
      portal_name: String(data.get('portal_name') || 'Pathways'),
      organisation_name: String(data.get('organisation_name') || ''),
      counsellor_name: String(data.get('counsellor_name') || ''),
      counsellor_email: String(data.get('counsellor_email') || '') || null,
      booking_provider: String(data.get('booking_provider') || 'internal'),
      booking_url: String(data.get('booking_url') || '') || null,
      welcome_message: String(data.get('welcome_message') || ''),
      primary_color: String(data.get('primary_color') || DEFAULT_SETTINGS.primary_color),
      accent_color: String(data.get('accent_color') || DEFAULT_SETTINGS.accent_color),
      background_color: String(data.get('background_color') || DEFAULT_SETTINGS.background_color),
      sidebar_color: String(data.get('sidebar_color') || DEFAULT_SETTINGS.sidebar_color),
      updated_by: profile.id
    }
    const { error } = await supabase.from('portal_settings').update(payload).eq('id', true)
    notify(error ? error.message : 'Branding and settings saved. They now apply to the login screen and both portals.', Boolean(error))
    if (!error) await refresh()
  }

  async function uploadLogo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const file = new FormData(form).get('logo') as File | null
    if (!file || !file.size) { notify('Choose a logo image first.', true); return }
    const extension = file.name.split('.').pop() || 'png'
    const path = `logo-${Date.now()}.${extension}`
    const upload = await supabase.storage.from('pathways-branding').upload(path, file, { upsert: true })
    if (upload.error) { notify(upload.error.message, true); return }
    const { data } = supabase.storage.from('pathways-branding').getPublicUrl(path)
    const { error } = await supabase.from('portal_settings').update({ logo_url: data.publicUrl, logo_path: path, updated_by: profile.id }).eq('id', true)
    notify(error ? error.message : 'Logo updated across the portal.', Boolean(error))
    if (!error) { form.reset(); await refresh() }
  }

  async function removeLogo() {
    const { error } = await supabase.from('portal_settings').update({ logo_url: null, logo_path: null, updated_by: profile.id }).eq('id', true)
    if (!error && settings.logo_path) await supabase.storage.from('pathways-branding').remove([settings.logo_path])
    notify(error ? error.message : 'Logo removed.', Boolean(error))
    if (!error) await refresh()
  }

  /* ------------------------------------------------------------------ views */

  const nav: Array<[Tab, string]> = [
    ['overview', 'Overview'],
    ['people', 'Students & Clients'],
    ['documents', 'Documents'],
    ['learning', 'Learning Library'],
    ['appointments', 'Counselling'],
    ['institutions', 'Universities & TVET'],
    ['settings', 'Branding & Settings'],
    ['audit', 'Audit Log']
  ]

  const themeStyle = {
    '--teal': settings.primary_color,
    '--gold': settings.accent_color,
    '--paper': settings.background_color,
    '--nav': settings.sidebar_color
  } as CSSProperties

  const pendingAppointments = appointments.filter(a => a.status === 'requested')

  return <div className="portal-shell" style={themeStyle}>
    <aside className="sidebar staff">
      <div className="sidebar-brand">
        <div className="brand-mark small logo-image">{settings.logo_url ? <img src={settings.logo_url} alt={`${settings.portal_name} logo`} /> : settings.portal_name.slice(0, 1)}</div>
        <div><strong>{settings.portal_name}</strong><span>{isAdmin ? 'Administrator' : 'Counsellor'}</span></div>
      </div>
      <nav>{nav.map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</nav>
      <div className="sidebar-user">
        <strong>{profile.full_name}</strong><span>{profile.email}</span>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </aside>

    <main className="portal-main">
      <div className="topbar">
        <div><p className="eyebrow">PATHWAYS ADMINISTRATION</p><h1>{nav.find(([key]) => key === tab)?.[1]}</h1></div>
        <button className="secondary" onClick={() => void refresh()}>Refresh</button>
      </div>

      {message && <div className="notice success">{message}</div>}
      {warning && <div className="notice">{warning}</div>}
      {credential && <div className="notice success">
        <strong>Temporary password for {credential.email}</strong>
        <p className="small">Give this to the participant in person or through a secure channel. They must change it the first time they sign in.</p>
        <p><code>{credential.password}</code></p>
        <button className="link-button" onClick={() => setCredential(null)}>Hide</button>
      </div>}
      {loading && <div className="notice">Loading the portal…</div>}

      {tab === 'overview' && <>
        <section className="hero">
          <div>
            <p className="eyebrow">WELCOME</p>
            <h2>{settings.organisation_name || settings.portal_name}</h2>
            <p>Manage participants, publish documents, assign learning and keep the career-development journey moving.</p>
          </div>
          <div className="hero-stat"><strong>{participants.filter(p => p.active).length}</strong><span>active participants</span></div>
        </section>
        <section className="grid four section-gap">
          <div className="card metric-card"><span>Students</span><strong>{participants.filter(p => typeOf(p.id) === 'Student').length}</strong></div>
          <div className="card metric-card"><span>Clients</span><strong>{participants.filter(p => typeOf(p.id) === 'Client').length}</strong></div>
          <div className="card metric-card"><span>Published documents</span><strong>{docs.filter(d => d.active).length}</strong></div>
          <div className="card metric-card"><span>Learning modules</span><strong>{modules.filter(m => m.is_published).length}</strong></div>
        </section>
        <section className="grid two section-gap">
          <div className="card">
            <p className="eyebrow">NEEDS ATTENTION</p>
            <h3>Counselling requests</h3>
            {pendingAppointments.length ? pendingAppointments.slice(0, 5).map(a => <div className="action-line" key={a.id}><span>{labelFor(a.student_id)} — {a.topic}</span></div>) : <p className="muted">No outstanding requests.</p>}
            <button className="link-button" onClick={() => setTab('appointments')}>Open counselling</button>
          </div>
          <div className="card">
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h3>Latest portal events</h3>
            {audit.slice(0, 6).map(event => <div className="action-line" key={event.id}><span>{event.action.replace(/_/g, ' ')} · {fmt(event.created_at)}</span></div>)}
            {!audit.length && <p className="muted">No activity recorded yet.</p>}
          </div>
        </section>
      </>}

      {tab === 'people' && <section className="stack">
        {isAdmin && <form className="card" onSubmit={createAccount}>
          <h3>Create a student or client login</h3>
          <p className="muted small">Participants cannot register themselves. Every account is created here, with a one-time temporary password.</p>
          <div className="grid two">
            <label>Full name<input name="fullName" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Account type<select name="participantType" defaultValue="student"><option value="student">Student</option><option value="client">Client</option></select></label>
            <label>Portal side<select name="role" defaultValue="student"><option value="student">Student / client portal</option><option value="counsellor">Counsellor (staff portal)</option></select></label>
            <label>School stage<select name="stage" defaultValue="Form 1">{stageOrder.map(stage => <option key={stage}>{stage}</option>)}</select></label>
          </div>
          <button className="primary">Create account</button>
        </form>}

        <div className="card">
          <h3>Students and clients</h3>
          {participants.length ? participants.map(person => {
            const detail = detailsFor(person.id)
            return <div className="list-row" key={person.id}>
              <div>
                <strong>{person.full_name} <span className="tag teal">{typeOf(person.id)}</span>{!person.active && <span className="tag">Inactive</span>}{person.force_password_change && <span className="tag">Password change pending</span>}</strong>
                <span>{person.email} · {detail?.stage || 'Stage not set'} · {detail?.career_focus || 'Focus not set'}</span>
              </div>
              <div className="btn-row">
                <button className="link-button" onClick={() => setSelectedId(selectedId === person.id ? null : person.id)}>{selectedId === person.id ? 'Close record' : 'Open record'}</button>
                <button className="link-button" onClick={() => void setActive(person.id, !person.active)}>{person.active ? 'Deactivate' : 'Activate'}</button>
                {isAdmin && <button className="link-button" onClick={() => void resetPassword(person.id)}>Reset password</button>}
              </div>
            </div>
          }) : <p className="muted">No participants yet. Create the first student or client account above.</p>}
        </div>

        {selectedId && <ParticipantRecord
          key={selectedId}
          person={people.find(p => p.id === selectedId)!}
          detail={detailsFor(selectedId)}
          docs={docs}
          docAssignments={docAssignments.filter(a => a.student_id === selectedId)}
          modules={modules}
          moduleAssignments={moduleAssignments.filter(a => a.student_id === selectedId)}
          onSaveDetails={saveParticipantDetails}
          authHeaders={authHeaders}
          notify={notify}
        />}

        <div className="card">
          <h3>Staff accounts</h3>
          {staff.map(person => <div className="list-row" key={person.id}>
            <div><strong>{person.full_name}</strong><span>{person.email} · {person.role}</span></div>
            <div className="btn-row">
              <button className="link-button" onClick={() => void setActive(person.id, !person.active)}>{person.active ? 'Deactivate' : 'Activate'}</button>
              {isAdmin && person.id !== profile.id && <button className="link-button" onClick={() => void resetPassword(person.id)}>Reset password</button>}
            </div>
          </div>)}
        </div>
      </section>}

      {tab === 'documents' && <section className="stack">
        <div className="grid two">
          <form className="card" onSubmit={saveDocument} key={editingDoc?.id || 'new-document'}>
            <div className="card-head"><h3>{editingDoc ? 'Edit document' : 'Add document or link'}</h3>{editingDoc && <button type="button" className="link-button" onClick={() => setEditingDoc(null)}>Cancel edit</button>}</div>
            <label>Title<input name="title" defaultValue={editingDoc?.title || ''} required /></label>
            <label>Description<textarea name="description" defaultValue={editingDoc?.description || ''} /></label>
            <label>Category<select name="category" defaultValue={editingDoc?.category || 'General'}>{DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Source<select name="source" defaultValue={editingDoc?.source_type || 'upload'}>
              <option value="upload">Upload a file</option>
              <option value="google_drive">Google Drive link</option>
              <option value="dropbox">Dropbox link</option>
              <option value="external">Other web link</option>
            </select></label>
            <label>File{editingDoc?.file_name ? <span className="small muted"> (current: {editingDoc.file_name} — choose a new file only if replacing)</span> : null}<input name="file" type="file" /></label>
            <label>Cloud or web URL<input name="url" type="url" placeholder="https://…" defaultValue={editingDoc?.external_url || ''} /></label>
            <label>Who can see it<select name="visibility" defaultValue={editingDoc?.visibility || 'assigned_students'}>
              <option value="assigned_students">Only participants I assign</option>
              <option value="all_students">Everyone in the portal</option>
              <option value="staff_only">Staff only</option>
            </select></label>
            <label>Status<select name="active" defaultValue={editingDoc ? String(editingDoc.active) : 'true'}><option value="true">Published</option><option value="false">Draft / unpublished</option></select></label>
            <button className="primary">{editingDoc ? 'Save changes' : 'Add document'}</button>
          </form>

          <form className="card" onSubmit={assignDocument}>
            <h3>Send a document to participants</h3>
            <label>Document<select name="document_id" required>{docs.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label>
            <label>Send to<select name="student_id" defaultValue="everyone">
              <option value="everyone">Everyone (all active students and clients)</option>
              {participants.map(p => <option key={p.id} value={p.id}>{p.full_name} — {typeOf(p.id)}</option>)}
            </select></label>
            <label>Personal message or instructions<textarea name="student_message" placeholder="Add guidance for this participant…" /></label>
            <label>Due date<input type="date" name="due_date" /></label>
            <button className="primary">Assign document</button>
          </form>
        </div>

        <div className="card">
          <h3>Document library</h3>
          {docs.length ? docs.map(doc => {
            const assigned = docAssignments.filter(a => a.document_id === doc.id)
            return <div key={doc.id} className="list-row">
              <div>
                <strong>{doc.title} {doc.active ? <span className="tag teal">Published</span> : <span className="tag">Unpublished</span>}</strong>
                <span>{doc.category} · {doc.source_type.replace(/_/g, ' ')} · {doc.visibility.replace(/_/g, ' ')} · {assigned.length} assignment{assigned.length === 1 ? '' : 's'}</span>
              </div>
              <div className="btn-row">
                <button className="link-button" onClick={() => { setEditingDoc(doc); setTab('documents'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Edit</button>
                <button className="link-button" onClick={() => void togglePublished(doc)}>{doc.active ? 'Unpublish' : 'Publish'}</button>
                <button className="link-button danger-text" onClick={() => void deleteDocument(doc)}>Delete</button>
              </div>
            </div>
          }) : <p className="muted">No documents yet.</p>}
        </div>

        <div className="card">
          <h3>Current assignments</h3>
          {docAssignments.length ? docAssignments.slice(0, 60).map(assignment => <div className="list-row" key={assignment.id}>
            <div>
              <strong>{docs.find(d => d.id === assignment.document_id)?.title || 'Document'} → {labelFor(assignment.student_id)}</strong>
              <span>{assignment.due_date ? `Due ${assignment.due_date}` : 'No due date'} · assigned {fmt(assignment.assigned_at)}</span>
            </div>
            <button className="link-button danger-text" onClick={() => void removeAssignment(assignment.id)}>Remove</button>
          </div>) : <p className="muted">Nothing assigned yet.</p>}
        </div>
      </section>}

      {tab === 'learning' && <section className="stack">
        <div className="grid two">
          <form className="card" onSubmit={saveModule}>
            <h3>Add or update a learning module</h3>
            <p className="muted small">Modules cover career development, subject choice, university and TVET planning, work and study, gap year, entrepreneurship, leaving school, interviews and CV preparation.</p>
            <label>Title<input name="title" required /></label>
            <label>Slug<input name="slug" placeholder="left blank = generated from the title" /></label>
            <label>Category<select name="category">{MODULE_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Summary<textarea name="summary" required /></label>
            <label>Module content<textarea name="content_md" className="large-textarea" required /></label>
            <label>External link<input name="external_url" type="url" placeholder="https://…" /></label>
            <label>Status<select name="is_published" defaultValue="true"><option value="true">Published</option><option value="false">Draft</option></select></label>
            <button className="primary">Save module</button>
          </form>

          <form className="card" onSubmit={assignModule}>
            <h3>Assign a module</h3>
            <label>Module<select name="module_id" required>{modules.map(m => <option key={m.id} value={m.id}>{m.category} — {m.title}</option>)}</select></label>
            <label>Assign to<select name="student_id" defaultValue="everyone">
              <option value="everyone">Everyone (all active students and clients)</option>
              {participants.map(p => <option key={p.id} value={p.id}>{p.full_name} — {typeOf(p.id)}</option>)}
            </select></label>
            <label>Due date<input type="date" name="due_date" /></label>
            <button className="primary">Assign module</button>
          </form>
        </div>

        <div className="card">
          <h3>Learning library</h3>
          {modules.length ? modules.map(record => <details key={record.id}>
            <summary>{record.title} — {record.category} {record.is_published ? '' : '(draft)'}</summary>
            <p className="muted">{record.summary}</p>
            <SafeMarkdown text={record.content_md.slice(0, 900)} />
            <div className="btn-row">
              <button className="link-button" onClick={() => void toggleModulePublished(record)}>{record.is_published ? 'Unpublish' : 'Publish'}</button>
              {record.external_url && <a className="link-button" href={record.external_url} target="_blank" rel="noreferrer">Open resource</a>}
            </div>
          </details>) : <p className="muted">No modules in the library yet.</p>}
        </div>
      </section>}

      {tab === 'appointments' && <section className="stack">
        <div className="card">
          <h3>Counselling requests and sessions</h3>
          {appointments.length ? appointments.map(appointment => <div className="appointment" key={appointment.id}>
            <div className="card-head">
              <div>
                <strong>{labelFor(appointment.student_id)} — {appointment.topic}</strong>
                <p className="small muted">Requested {fmt(appointment.requested_start)} · {appointment.duration_minutes} minutes · status {appointment.status}</p>
              </div>
              <span className="status-pill">{appointment.status}</span>
            </div>
            {appointment.student_message && <div className="callout"><strong>From the participant</strong><p>{appointment.student_message}</p></div>}
            <form onSubmit={e => void respondToAppointment(e, appointment)}>
              <div className="grid three">
                <label>Confirmed start<input type="datetime-local" name="confirmed_start" /></label>
                <label>Status<select name="status" defaultValue={appointment.status}>
                  <option value="requested">Requested</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select></label>
                <label>Response<input name="staff_response" defaultValue={appointment.staff_response || ''} /></label>
              </div>
              <button className="primary">Update appointment</button>
            </form>
          </div>) : <p className="muted">No counselling requests yet.</p>}
        </div>
      </section>}

      {tab === 'institutions' && <section className="stack">
        <form className="card" onSubmit={saveInstitution}>
          <h3>Add a university, college or TVET institution</h3>
          <div className="grid two">
            <label>Name<input name="name" required /></label>
            <label>Type<select name="institution_type"><option>University</option><option>TVET / Technical college</option><option>Private college</option><option>Apprenticeship provider</option></select></label>
            <label>Country<input name="country" defaultValue="Botswana" /></label>
            <label>Website<input name="website_url" type="url" required /></label>
            <label>Admissions page<input name="admissions_url" type="url" /></label>
          </div>
          <label>Notes<textarea name="notes" placeholder="Programmes, entry requirements, closing dates…" /></label>
          <button className="primary">Add institution</button>
        </form>
        <div className="card">
          <h3>Institution list</h3>
          {institutions.length ? institutions.map(institution => <div className="list-row" key={institution.id}>
            <div><strong>{institution.name} {institution.active ? '' : <span className="tag">Hidden</span>}</strong><span>{institution.institution_type} · {institution.country}</span></div>
            <div className="btn-row">
              <a className="link-button" href={institution.website_url} target="_blank" rel="noreferrer">Website</a>
              <button className="link-button" onClick={() => void toggleInstitution(institution)}>{institution.active ? 'Hide' : 'Show'}</button>
            </div>
          </div>) : <p className="muted">No institutions captured yet.</p>}
        </div>
      </section>}

      {tab === 'settings' && <section className="stack">
        <form className="card" onSubmit={saveSettings}>
          <h3>Portal identity and branding</h3>
          <p className="muted small">These settings apply to the login screen, the admin portal and the student/client portal.</p>
          <div className="grid two">
            <label>Portal name<input name="portal_name" defaultValue={settings.portal_name} /></label>
            <label>Organisation name<input name="organisation_name" defaultValue={settings.organisation_name} /></label>
            <label>Counsellor name<input name="counsellor_name" defaultValue={settings.counsellor_name} /></label>
            <label>Counsellor email<input name="counsellor_email" type="email" defaultValue={settings.counsellor_email || ''} /></label>
            <label>Booking provider<select name="booking_provider" defaultValue={settings.booking_provider}><option value="internal">Pathways internal booking</option><option value="external">External booking link</option></select></label>
            <label>Booking link<input name="booking_url" type="url" defaultValue={settings.booking_url || ''} /></label>
          </div>
          <label>Welcome message<textarea name="welcome_message" defaultValue={settings.welcome_message} /></label>
          <h4>Colours</h4>
          <div className="grid four">
            <label>Primary colour<input name="primary_color" type="color" defaultValue={settings.primary_color} /></label>
            <label>Accent colour<input name="accent_color" type="color" defaultValue={settings.accent_color} /></label>
            <label>Background colour<input name="background_color" type="color" defaultValue={settings.background_color} /></label>
            <label>Sidebar colour<input name="sidebar_color" type="color" defaultValue={settings.sidebar_color} /></label>
          </div>
          <button className="primary">Save branding and settings</button>
        </form>

        <form className="card" onSubmit={uploadLogo}>
          <h3>Portal logo</h3>
          <div className="logo-preview">{settings.logo_url ? <img src={settings.logo_url} alt="Current logo" /> : <div className="brand-mark">{settings.portal_name.slice(0, 1)}</div>}</div>
          <label>Upload a logo<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" required /></label>
          <p className="muted small">PNG, JPG, WEBP or SVG. The logo appears on the login screen and in both portals.</p>
          <div className="btn-row">
            <button className="primary">Upload logo</button>
            {settings.logo_url && <button type="button" className="secondary" onClick={() => void removeLogo()}>Remove logo</button>}
          </div>
        </form>
      </section>}

      {tab === 'audit' && <section className="card">
        <h3>Audit log</h3>
        <p className="muted small">The 100 most recent security and administration events.</p>
        {audit.length ? audit.map(event => <div className="list-row" key={event.id}>
          <div>
            <strong>{event.action.replace(/_/g, ' ')}</strong>
            <span>{fmt(event.created_at)} · {event.actor_id ? labelFor(event.actor_id) : 'system'} · {event.entity_type || '—'}</span>
          </div>
        </div>) : <p className="muted">No events recorded yet.</p>}
      </section>}
    </main>
  </div>
}

/* ------------------------------------------------------ participant record */

function ParticipantRecord({ person, detail, docs, docAssignments, modules, moduleAssignments, onSaveDetails, authHeaders, notify }: {
  person: Participant
  detail: Details | null
  docs: Doc[]
  docAssignments: DocAssignment[]
  modules: ModuleRecord[]
  moduleAssignments: ModuleAssignment[]
  onSaveDetails: (e: FormEvent<HTMLFormElement>, userId: string) => Promise<void>
  authHeaders: () => Promise<Record<string, string>>
  notify: (text: string, isWarning?: boolean) => void
}) {
  const supabase = useMemo(() => getSupabaseBrowser(), [])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [subjects, setSubjects] = useState<SubjectResult[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [noteText, setNoteText] = useState('')
  const [notesAvailable, setNotesAvailable] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const [a, s, p] = await Promise.all([
        supabase.from('assessment_results').select('*').eq('student_id', person.id).order('created_at', { ascending: false }),
        supabase.from('subject_results').select('id,subject_name,score,enjoyment,confidence').eq('student_id', person.id).order('subject_name'),
        supabase.from('action_plans').select('id,title,notes,due_date,status').eq('student_id', person.id).order('created_at', { ascending: false })
      ])
      if (!mounted) return
      setAssessments((a.data || []) as Assessment[])
      setSubjects((s.data || []) as SubjectResult[])
      setActions((p.data || []) as ActionItem[])
      try {
        const response = await fetch(`/api/counsellor/notes?studentId=${person.id}`, { headers: await authHeaders() })
        if (!mounted) return
        if (response.ok) { const result = await response.json(); setNotes(result.notes || []) } else setNotesAvailable(false)
      } catch { if (mounted) setNotesAvailable(false) }
    }
    void load()
    return () => { mounted = false }
  }, [person.id, supabase, authHeaders])

  async function addNote() {
    if (noteText.trim().length < 2) return
    const response = await fetch('/api/counsellor/notes', { method: 'POST', headers: await authHeaders(), body: JSON.stringify({ studentId: person.id, text: noteText.trim() }) })
    const result = await response.json().catch(() => ({ error: 'Unexpected response from the server.' }))
    if (!response.ok) { notify(result.error || 'The note could not be saved.', true); return }
    setNotes(current => [result.note, ...current])
    setNoteText('')
    notify('Private note saved.')
  }

  const profileResult = assessments.find(a => a.kind === 'profile')
  const swot = assessments.find(a => a.kind === 'swot')
  const swotPayload = (swot?.payload || {}) as Record<string, string>

  return <div className="card">
    <div className="card-head">
      <div><p className="eyebrow">PARTICIPANT RECORD</p><h3>{person.full_name}</h3><p className="muted small">{person.email}</p></div>
    </div>

    <form onSubmit={e => void onSaveDetails(e, person.id)}>
      <div className="grid four">
        <label>Account type<select name="participant_type" defaultValue={detail?.participant_type || 'student'}><option value="student">Student</option><option value="client">Client</option></select></label>
        <label>Stage<select name="stage" defaultValue={detail?.stage || 'Form 1'}>{stageOrder.map(stage => <option key={stage}>{stage}</option>)}</select></label>
        <label>Career focus<input name="career_focus" defaultValue={detail?.career_focus || ''} /></label>
        <label>Graduation year<input name="graduation_year" type="number" defaultValue={detail?.graduation_year || ''} /></label>
      </div>
      <button className="primary">Save participant details</button>
    </form>

    <div className="grid two section-gap">
      <div>
        <h4>Career profile</h4>
        {profileResult ? <div className="profile-bars">{Object.entries(profileResult.scores).sort((a, b) => b[1] - a[1]).map(([key, value]) => <div className="bar-row" key={key}><span>{key}</span><div className="bar"><i style={{ width: `${Math.round((value / 15) * 100)}%` }} /></div><strong>{value}/15</strong></div>)}</div> : <p className="muted">The assessment has not been completed yet.</p>}
        <h4>SWOT</h4>
        {swot ? <div className="grid two">{['strengths', 'weaknesses', 'opportunities', 'threats'].map(key => <div key={key}><strong>{key}</strong><p className="small">{swotPayload[key] || '—'}</p></div>)}</div> : <p className="muted">No SWOT recorded yet.</p>}
      </div>
      <div>
        <h4>Subjects</h4>
        {subjects.length ? subjects.map(subject => <div className="list-row" key={subject.id}><div><strong>{subject.subject_name}</strong><span>enjoyment {subject.enjoyment ?? '–'} · confidence {subject.confidence ?? '–'}</span></div><strong>{subject.score == null ? '–' : `${subject.score}%`}</strong></div>) : <p className="muted">No subject results recorded.</p>}
        <h4>Action plan</h4>
        {actions.length ? actions.map(action => <div className="action-line" key={action.id}><span>{action.title} — {action.status}{action.due_date ? ` · due ${action.due_date}` : ''}</span></div>) : <p className="muted">No action steps yet.</p>}
      </div>
    </div>

    <div className="grid two section-gap">
      <div>
        <h4>Assigned learning</h4>
        {moduleAssignments.length ? moduleAssignments.map(assignment => <div className="action-line" key={assignment.id}><span>{modules.find(m => m.id === assignment.module_id)?.title || 'Module'} — {assignment.status}</span></div>) : <p className="muted">No modules assigned.</p>}
      </div>
      <div>
        <h4>Assigned documents</h4>
        {docAssignments.length ? docAssignments.map(assignment => <div className="action-line" key={assignment.id}><span>{docs.find(d => d.id === assignment.document_id)?.title || 'Document'}{assignment.due_date ? ` · due ${assignment.due_date}` : ''}</span></div>) : <p className="muted">No documents assigned.</p>}
      </div>
    </div>

    <div className="section-gap">
      <h4>Private counsellor notes</h4>
      {notesAvailable ? <>
        <p className="muted small">Notes are encrypted before they are stored and are never visible to the participant.</p>
        <label>New note<textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Record what was discussed and the agreed next step…" /></label>
        <button className="primary" onClick={() => void addNote()}>Save private note</button>
        {notes.map(note => <div className="callout" key={note.id}><p className="small muted">{fmt(note.created_at)}</p><p>{note.text}</p></div>)}
      </> : <p className="muted">Private notes are unavailable until the notes encryption key is configured on the server.</p>}
    </div>
  </div>
}
