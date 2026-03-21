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
        <h1 className="text-[20px] font-black text-[#2B2B2B] tracking-tight">לקוחות</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#E8C420] text-[#2B2B2B] text-[13px] font-extrabold rounded-[2px] hover:bg-[#D4B010] transition-colors"
        >
          + לקוח חדש
        </button>
      </div>

      {/* Search */}
      <Input
        placeholder="חיפוש לפי שם או חברה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs h-9 text-[13px] border-[#E0DDD4] bg-white text-[#2B2B2B] placeholder:text-[#6A6660] focus-visible:ring-[#1A7A6E]"
      />

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-[13px] text-[#6A6660]">טוען...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-[#6A6660]">
          {clients?.length === 0 ? 'אין לקוחות עדיין' : 'לא נמצאו תוצאות'}
        </div>
      ) : (
        <div className="bg-white border border-[#E0DDD4] rounded-[2px] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E0DDD4]">
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">שם</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">חברה</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">טלפון</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">אימייל</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">מקור</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#6A6660]">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="border-b border-[#F0EDE4] last:border-0 hover:bg-[#F8F6F2] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-[#2B2B2B] hover:text-[#E8C420] transition-colors"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#6A6660]">{client.company ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#6A6660]" dir="ltr">{client.phone ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#6A6660]" dir="ltr">{client.email ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#6A6660]">{client.lead_source ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[#6A6660]">
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
