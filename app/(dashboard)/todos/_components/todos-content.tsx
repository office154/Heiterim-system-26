'use client'

import Link from 'next/link'
import { useTodos, useUpdateTodo, useDeleteTodo } from '@/lib/hooks/use-todos'
import { Breadcrumb } from '@/components/shared/Breadcrumb'
import type { Todo } from '@/types/database'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function CheckCircle({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
      style={{
        backgroundColor: done ? '#27AE60' : 'white',
        borderColor: done ? '#27AE60' : '#cccccc',
      }}
      title={done ? 'סמן כלא בוצע' : 'סמן כבוצע'}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
    </button>
  )
}

function TodoRow({ todo }: { todo: Todo }) {
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-[#fafafa] transition-colors group"
      style={{
        borderBottom: '1px solid #f4f4f4',
        borderRight: `3px solid ${todo.done ? '#27AE60' : '#3D6A9E'}`,
        opacity: todo.done ? 0.55 : 1,
      }}
    >
      <CheckCircle
        done={todo.done}
        onClick={() => updateTodo.mutate({ id: todo.id, done: !todo.done })}
      />
      <span
        className="flex-1 text-[13px] text-[#1a1a1a]"
        style={{ textDecoration: todo.done ? 'line-through' : 'none', color: todo.done ? '#aaaaaa' : '#1a1a1a' }}
      >
        {todo.task}
      </span>
      {todo.project_id && (
        <Link
          href={`/projects/${todo.project_id}`}
          className="text-[12px] font-semibold shrink-0 hover:underline"
          style={{ color: '#3D6A9E' }}
        >
          {todo.project_title}
        </Link>
      )}
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{ background: todo.done ? '#c8e8d0' : '#c8d8e8', color: 'white' }}
      >
        {formatDate(todo.created_at)}
      </span>
      <button
        onClick={() => deleteTodo.mutate(todo.id)}
        className="text-[#cccccc] hover:text-[#C0392B] opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5"
        title="מחק משימה"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  )
}

export function TodosContent() {
  const { data: todos, isLoading } = useTodos()

  const pending = (todos ?? []).filter((t) => !t.done)
  const done = (todos ?? []).filter((t) => t.done)

  // Group pending by project
  const groups = pending.reduce<Record<string, Todo[]>>((acc, t) => {
    const key = t.project_title || 'כללי'
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'משימות' }]} />

      <div>
        <h1 className="text-[22px] font-black text-[#1a1a1a] tracking-tight">משימות</h1>
        <p className="text-[13px] text-[#aaaaaa] mt-1">
          {pending.length} פתוחות · {done.length} הושלמו
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-11 rounded-lg bg-[#e8e8e8]" />
          ))}
        </div>
      ) : (todos ?? []).length === 0 ? (
        <div
          className="text-center py-16"
          style={{ background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
        >
          <p className="text-[32px] mb-3">✓</p>
          <p className="text-[14px] font-semibold text-[#1a1a1a]">אין משימות עדיין</p>
          <p className="text-[13px] text-[#aaaaaa] mt-1">
            הוסף משימות מדפי הסטטוס של הפרויקטים
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Pending — grouped by project */}
          {Object.keys(groups).length > 0 && (
            <div
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid #E5E7EB', background: '#f8f8f8' }}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">פתוחות</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#EBF1F9', color: '#3D6A9E' }}
                >
                  {pending.length}
                </span>
              </div>

              {Object.entries(groups).map(([project, items]) => (
                <div key={project}>
                  <div
                    className="px-5 py-2"
                    style={{ background: '#EBF1F9', borderBottom: '1px solid #E5E7EB' }}
                  >
                    <span className="text-[11px] font-bold text-[#3D6A9E] uppercase tracking-[0.06em]">
                      {project}
                    </span>
                  </div>
                  {items.map((todo) => (
                    <TodoRow key={todo.id} todo={todo} />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {done.length > 0 && (
            <div
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid #E5E7EB', background: '#f8f8f8' }}
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#aaaaaa]">הושלמו</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: '#e6f4ed', color: '#27AE60' }}
                >
                  {done.length}
                </span>
              </div>
              {done.map((todo) => (
                <TodoRow key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
