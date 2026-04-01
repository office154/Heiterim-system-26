'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClients } from '@/lib/hooks/use-clients'
import { CreateClientModal } from '@/components/create-client-modal'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/shared/Breadcrumb'

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black text-[#1a1a1a] tracking-tight">לקוחות</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#3D6A9E] text-[#1a1a1a] text-[13px] font-extrabold rounded-lg hover:bg-[#D4B010] transition-colors"
        >
          + לקוח חדש
        </button>
      </div>

      {/* Search */}
      <Input
        placeholder="חיפוש לפי שם או חברה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs h-9 text-[13px] border-[#dddddd] bg-white text-[#1a1a1a] placeholder:text-[#aaaaaa] focus-visible:ring-[#3D6A9E]"
      />

      {/* Table */}
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
              <tr className="border-b border-[#dddddd]">
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">שם</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">חברה</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">טלפון</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">אימייל</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">מקור</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-[#f4f4f4] last:border-0 hover:bg-[#f8f8f8] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-[#1a1a1a] hover:text-[#3D6A9E] transition-colors"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#666666]">{client.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666]" dir="ltr">{client.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666]" dir="ltr">{client.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666]">{client.lead_source ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#666666]">
                    {new Date(client.created_at).toLocaleDateString('he-IL')}
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
