'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  activeTab: '',
  setActiveTab: () => {},
})

function Tabs({
  defaultValue,
  children,
  className,
  dir,
}: {
  defaultValue: string
  children: React.ReactNode
  className?: string
  dir?: string
}) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('flex flex-col gap-2', className)} dir={dir}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center border-b border-[#E0DDD4] bg-transparent gap-0 p-0',
        className
      )}
    >
      {children}
    </div>
  )
}

function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)
  const isActive = activeTab === value

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-5 py-2.5 text-[13px] font-medium transition-all border-b-2 -mb-px',
        isActive
          ? 'text-[#2B2B2B] font-bold border-[#E8C420]'
          : 'text-[#9A9690] border-transparent hover:text-[#4A4844] hover:border-[#E0DDD4]',
        className
      )}
    >
      {children}
    </button>
  )
}

function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { activeTab } = React.useContext(TabsContext)

  if (activeTab !== value) return null

  return <div className={cn('outline-none', className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
