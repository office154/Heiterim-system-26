'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProject } from '@/lib/hooks/use-projects'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GeneralInfoTab } from './_components/general-info-tab'
import { StagesTab } from './_components/stages-tab'
import { StatusTab } from './_components/status-tab'
import { FilesTab } from './_components/files-tab'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import type { BreadcrumbItem } from '@/components/shared/Breadcrumb'

const TAB_LABELS: Record<string, string> = {
  stages: 'תשלומים',
  status: 'דוח סטטוס',
  files: 'קבצים',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: project, isLoading, error } = useProject(id)
  const [activeTab, setActiveTab] = useState('general')

  if (isLoading) {
    return <div className="py-12 text-center text-[#aaaaaa]">טוען פרויקט...</div>
  }

  if (error || !project) {
    return <div className="py-12 text-center text-[#C0392B]">שגיאה בטעינת הפרויקט</div>
  }

  const breadcrumbItems: BreadcrumbItem[] =
    activeTab === 'general'
      ? [
          { label: 'דשבורד', href: '/' },
          { label: 'פרויקטים', href: '/projects' },
          { label: project.title },
        ]
      : [
          { label: 'דשבורד', href: '/' },
          { label: 'פרויקטים', href: '/projects' },
          { label: project.title, href: `/projects/${id}` },
          { label: TAB_LABELS[activeTab] },
        ]

  return (
    <div className="space-y-4">
      <Breadcrumb items={breadcrumbItems} />

      <div className="print:hidden">
        <h1 className="text-2xl font-black text-[#1a1a1a] tracking-tight">{project.title}</h1>
        {project.location && (
          <p className="mt-1 text-sm text-[#666666]">{project.location}</p>
        )}
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="w-full justify-start print:hidden">
          <TabsTrigger value="general">מידע כללי</TabsTrigger>
          <TabsTrigger value="status">דוח סטטוס</TabsTrigger>
          <TabsTrigger value="stages">תשלומים</TabsTrigger>
          <TabsTrigger value="files">קבצים</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralInfoTab project={project} onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="stages" className="mt-4">
          <StagesTab projectId={id} />
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <StatusTab projectId={id} />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <FilesTab projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
