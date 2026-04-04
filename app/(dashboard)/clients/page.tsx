'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClients, useDeleteClient } from '@/lib/hooks/use-clients'
import { CreateClientModal } from '@/components/create-client-modal'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

function DeleteButton({ clientId }: { clientId: string }) {
  const [confirm, setConfirm] = useState(false)
  const deleteClient = useDeleteClient()

  if (confirm) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
        <button
          onClick={() => deleteClient.mutate(clientId)}
          disabled={deleteClient.isPending}
          className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-[#C0392B] text-white hover:bg-[#a93226] disabled:opacity-50"
        >
          {deleteClient.isPending ? '...' : 'מחק'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="rounded px-1.5 py-0.5 text-[10px] text-[#888] hover:text-[#333]"
        >
          ביטול
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirm(true) }}
      className="opacity-0 group-hover:opacity-100 text-[#cccccc] hover:text-[#C0392B] transition-all text-[11px] px-1 rounded hover:bg-[#fdf0ef]"
      title="מחק לקוח"
    >
      ✕
    </button>
  )
}

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

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
        <h1 className="text-[20px] font-black text-[#1a1a1a] tracking-tight">לקוחות</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#3D6A9E] text-white text-[13px] font-extrabold rounded-lg hover:bg-[#2F5A8A] transition-colors"
        >
          + לקוח חדש
        </button>
      </div>

      <Input
        placeholder="חיפוש לפי שם או חברה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs h-9 text-[13px] border-[#dddddd] bg-white text-[#1a1a1a] placeholder:text-[#aaaaaa] focus-visible:ring-[#3D6A9E]"
      />

      {isLoading ? (
        <div className="py-16 text-center text-[13px] text-[#666666]">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-[#666666]">
          {clients?.length === 0 ? 'אין לקוחות עדיין' : 'לא נמצאו תוצאות'}
        </div>
      ) : (
        <div
          className="bg-white border border-[#dddddd] rounded-lg overflow-hidden"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#dddddd] bg-[#f8f8f8]">
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">שם</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">מספר חברה</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">טלפון</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">אימייל</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">מקור</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">תאריך</th>
                <th className="w-8 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="group border-b border-[#f4f4f4] last:border-0 hover:bg-[#f8f8f8] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-[#1a1a1a] hover:text-[#3D6A9E] transition-colors"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#666666]">{client.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666] text-center" dir="ltr">{client.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666] text-center" dir="ltr">{client.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666] text-center">{client.lead_source ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666] text-center">
                    {new Date(client.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <DeleteButton clientId={client.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateClientModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
