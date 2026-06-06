'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useClients, useDeleteClient } from '@/lib/hooks/use-clients'
import { CreateClientModal } from '@/components/create-client-modal'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import { useResizableColumns } from '@/lib/hooks/use-resizable-columns'
import { ResizableTh } from '@/components/ui/resizable-th'
import { useCurrentRole } from '@/lib/hooks/use-profile'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

function DeleteButton({ clientId }: { clientId: string }) {
  const [confirm, setConfirm] = useState(false)
  const deleteClient = useDeleteClient()

  if (confirm) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
        <button
          onClick={() => deleteClient.mutate(clientId)}
          disabled={deleteClient.isPending}
          className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-[var(--danger-text)] text-white hover:bg-[var(--danger-bg)] disabled:opacity-50"
        >
          {deleteClient.isPending ? '...' : 'מחק'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="rounded px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ביטול
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirm(true) }}
      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--danger-text)] transition-all text-[11px] px-1 rounded hover:bg-[var(--danger-bg)]"
      title="מחק לקוח"
    >
      ✕
    </button>
  )
}

export default function ClientsPage() {
  const router = useRouter()
  const { data: role, isLoading: roleLoading } = useCurrentRole()
  const { data: clients, isLoading } = useClients()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { widths, startResize } = useResizableColumns([200, 150, 150, 200, 120, 120, 40])

  useEffect(() => {
    if (!roleLoading && role === 'employee') router.replace('/')
  }, [role, roleLoading, router])

  if (roleLoading || role !== 'admin') return null

  const filtered = (clients ?? []).filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'דשבורד', href: '/' }, { label: 'לקוחות' }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-[var(--text-primary)] tracking-tight">לקוחות</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[var(--accent-primary)] text-white text-[13px] font-extrabold rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors"
        >
          + לקוח חדש
        </button>
      </div>

      <Input
        placeholder="חיפוש לפי שם או חברה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs h-9 text-[13px] border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-[var(--accent-primary)]"
      />

      {isLoading ? (
        <div className="py-16 text-center text-[13px] text-[var(--text-secondary)]">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-[var(--text-secondary)]">
          {clients?.length === 0 ? 'אין לקוחות עדיין' : 'לא נמצאו תוצאות'}
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="border-0 hover:bg-transparent">
                <ResizableTh width={widths[0]} onResizeStart={startResize(0)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">שם</ResizableTh>
                <ResizableTh width={widths[1]} onResizeStart={startResize(1)} className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">מספר חברה</ResizableTh>
                <ResizableTh width={widths[2]} onResizeStart={startResize(2)} className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">טלפון</ResizableTh>
                <ResizableTh width={widths[3]} onResizeStart={startResize(3)} className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">אימייל</ResizableTh>
                <ResizableTh width={widths[4]} onResizeStart={startResize(4)} className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">מקור</ResizableTh>
                <ResizableTh width={widths[5]} onResizeStart={startResize(5)} className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">תאריך</ResizableTh>
                <TableHead style={{ width: widths[6] }} className="px-3 py-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id} className="group last:border-0">
                  <TableCell className="px-5 py-3.5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-5 py-3.5 text-[var(--text-secondary)]">{client.company ?? '—'}</TableCell>
                  <TableCell className="px-5 py-3.5 text-[var(--text-secondary)] text-center" dir="ltr">{client.phone ?? '—'}</TableCell>
                  <TableCell className="px-5 py-3.5 text-[var(--text-secondary)] text-center" dir="ltr">{client.email ?? '—'}</TableCell>
                  <TableCell className="px-5 py-3.5 text-[var(--text-secondary)] text-center">{client.lead_source ?? '—'}</TableCell>
                  <TableCell className="px-5 py-3.5 text-[var(--text-secondary)] text-center">
                    {new Date(client.created_at).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-center">
                    <DeleteButton clientId={client.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateClientModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
