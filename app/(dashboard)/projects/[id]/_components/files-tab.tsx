'use client'

import { useRef, useState } from 'react'
import { useProjectFiles, useUploadFile, useDeleteFile, getSignedUrl } from '@/lib/hooks/use-files'

interface FilesTabProps {
  projectId: string
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('he-IL')
}

function FileIcon({ fileType }: { fileType: string | null }) {
  if (!fileType) return <span className="text-[#666666]">📄</span>
  if (fileType.startsWith('image/')) return <span>🖼️</span>
  if (fileType === 'application/pdf') return <span>📋</span>
  if (fileType.includes('word') || fileType.includes('document')) return <span>📝</span>
  if (fileType.includes('sheet') || fileType.includes('excel')) return <span>📊</span>
  return <span className="text-[#666666]">📄</span>
}

export function FilesTab({ projectId }: FilesTabProps) {
  const { data: files, isLoading } = useProjectFiles(projectId)
  const uploadFile = useUploadFile(projectId)
  const deleteFile = useDeleteFile(projectId)
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>('')
  const [previewType, setPreviewType] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    for (const file of selected) {
      await uploadFile.mutateAsync(file)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handlePreview(filePath: string, fileName: string, fileType: string | null) {
    try {
      const url = await getSignedUrl(filePath)
      setPreviewUrl(url)
      setPreviewName(fileName)
      setPreviewType(fileType)
    } catch {
      alert('לא ניתן לפתוח את הקובץ')
    }
  }

  async function handleDelete(id: string, filePath: string) {
    if (!confirm('למחוק את הקובץ?')) return
    setDeletingId(id)
    try {
      await deleteFile.mutateAsync({ id, filePath })
    } finally {
      setDeletingId(null)
    }
  }

  const isPreviewable = (fileType: string | null) =>
    fileType?.startsWith('image/') || fileType === 'application/pdf'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1a1a1a]">קבצים</h2>
        <div className="flex items-center gap-2">
          {uploadFile.isPending && (
            <span className="text-[12px] text-[#666666]">מעלה...</span>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploadFile.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6A9E] px-3 py-1.5 text-[13px] font-extrabold text-[#1a1a1a] hover:bg-[#D4B010] disabled:opacity-40 transition-colors"
          >
            + העלה קובץ
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>
      </div>

      {/* File list */}
      <div
        className="rounded-lg border border-[#dddddd] bg-white overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        {isLoading ? (
          <div className="py-10 text-center text-[13px] text-[#666666]">טוען קבצים...</div>
        ) : !files || files.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[#666666]">אין קבצים עדיין</p>
            <p className="mt-1 text-[12px] text-[#aaaaaa]">לחץ על &quot;העלה קובץ&quot; כדי להתחיל</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#dddddd] bg-[#f8f8f8]">
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">שם קובץ</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">גודל</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">תאריך העלאה</th>
                <th className="w-36 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr
                  key={file.id}
                  className="group border-b border-[#f4f4f4] last:border-0 hover:bg-[#f8f8f8] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileIcon fileType={file.file_type} />
                      <span className="font-medium text-[#1a1a1a] truncate max-w-[280px]">
                        {file.file_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#666666]">
                    {formatBytes(file.file_size)}
                  </td>
                  <td className="px-4 py-3 text-[#666666]">
                    {formatDate(file.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview — eye icon (always visible) */}
                      <button
                        onClick={async () => {
                          if (isPreviewable(file.file_type)) {
                            handlePreview(file.file_path, file.file_name, file.file_type)
                          } else {
                            const url = await getSignedUrl(file.file_path)
                            window.open(url, '_blank')
                          }
                        }}
                        title="תצוגה מקדימה"
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#EBF1F9] text-[#3D6A9E] hover:text-[#D4B010] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      {/* Download — arrow icon */}
                      <button
                        onClick={async () => {
                          const url = await getSignedUrl(file.file_path)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = file.file_name
                          a.click()
                        }}
                        title="הורדה"
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F0F2F5] text-[#666666] hover:text-[#1a1a1a] transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      {/* Delete — trash icon */}
                      <button
                        onClick={() => handleDelete(file.id, file.file_path)}
                        disabled={deletingId === file.id}
                        title="מחיקה"
                        className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#fdf0ef] text-[#aaaaaa] hover:text-[#C0392B] transition-colors disabled:opacity-40"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-auto bg-white"
            style={{ borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#dddddd] px-5 py-3">
              <span className="text-[13px] font-semibold text-[#1a1a1a] truncate max-w-[400px]">
                {previewName}
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="mr-4 text-[#666666] hover:text-[#1a1a1a] text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              {previewType?.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={previewName}
                  className="max-h-[75vh] max-w-[80vw] rounded object-contain"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  title={previewName}
                  className="h-[75vh] w-[70vw] rounded"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
