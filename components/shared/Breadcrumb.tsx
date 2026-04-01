'use client'

import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string // if undefined = current page (not clickable)
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

function HomeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 20 20"
      fill="currentColor"
      style={{ display: 'inline', verticalAlign: 'middle', marginBottom: '1px', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  )
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      dir="rtl"
      aria-label="breadcrumb"
      style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '16px',
        fontFamily: "'Rubik', sans-serif",
      }}
    >
      <ol className="flex items-center flex-wrap list-none m-0 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isFirst = index === 0

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  style={{ color: '#cccccc', margin: '0 8px', fontSize: '13px', lineHeight: 1 }}
                >
                  ›
                </span>
              )}

              {isLast ? (
                // Current page — not clickable, darker
                <span
                  className="flex items-center gap-1"
                  style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}
                  aria-current="page"
                >
                  {isFirst && <HomeIcon />}
                  {item.label}
                </span>
              ) : item.href ? (
                // Clickable link
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-[#aaaaaa] hover:text-[#3D6A9E] hover:underline transition-colors"
                  style={{ fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}
                >
                  {isFirst && <HomeIcon />}
                  {item.label}
                </Link>
              ) : (
                // Middle item with no href — static label
                <span
                  className="flex items-center gap-1"
                  style={{ fontSize: '13px', fontWeight: 500, color: '#aaaaaa' }}
                >
                  {isFirst && <HomeIcon />}
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
