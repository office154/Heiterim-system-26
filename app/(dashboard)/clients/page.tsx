'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClients } from '@/lib/hooks/use-clients'
import { CreateClientModal } from '@/components/create-client-modal'
import { Input } from '@/components/ui/input'

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">לקוחות</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#6366F1] text-white text-[13px] font-semibold rounded-md hover:bg-[#4F46E5] transition-colors"
        >
          + לקוח חדש
        </button>
      </div>

      {/* Search */}
      <Input
        placeholder="חיפוש לפי שם או חברה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs h-9 text-[13px] border-[#E5E7EB] bg-white text-[#0F172A] placeholder:text-[#64748B] focus-visible:ring-[#6366F1]"
      />

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-[13px] text-[#64748B]">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-[#64748B]">
          {clients?.length === 0 ? 'אין לקוחות עדיין' : 'לא נמצאו תוצאות'}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">שם</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">חברה</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">טלפון</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">אימייל</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">מקור</th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-[#64748B]">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-[#F6F7F9] last:border-0 hover:bg-[#F6F7F9] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-[#0F172A] hover:text-[#6366F1] transition-colors"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B]">{client.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#64748B]" dir="ltr">{client.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#64748B]" dir="ltr">{client.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">{client.lead_source ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#64748B]">
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
