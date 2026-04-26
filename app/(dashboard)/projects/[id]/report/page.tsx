'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ClientReport } from '../_components/client-report'

type ViewKey = "urgency" | "contact" | "phase" | "party"
const VALID_VIEWS: ViewKey[] = ["urgency", "contact", "phase", "party"]

function ReportContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const viewParam = searchParams.get('view')
  const initialView: ViewKey = VALID_VIEWS.includes(viewParam as ViewKey)
    ? (viewParam as ViewKey)
    : "urgency"

  return <ClientReport projectId={projectId} initialView={initialView} />
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-stone-400 text-sm">טוען דוח...</div>}>
      <ReportContent />
    </Suspense>
  )
}
