import type { TrackValue, ProjectStatus } from '@/types/database'

export const TRACK_LABELS: Record<TrackValue, string> = {
  permit: 'היתר',
  design: 'תכנון',
  interior_design: 'עיצוב פנים',
  business_license: 'רשיון עסק',
  claim: 'תבע',
  other: 'אחר',
}

export const TRACK_OPTIONS: { value: TrackValue; label: string }[] = [
  { value: 'permit', label: 'היתר' },
  { value: 'design', label: 'תכנון' },
  { value: 'interior_design', label: 'עיצוב פנים' },
  { value: 'business_license', label: 'רשיון עסק' },
  { value: 'claim', label: 'תבע' },
  { value: 'other', label: 'אחר' },
]

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'פעיל',
  completed: 'הושלם',
  on_hold: 'מושהה',
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  active:    'bg-[#E8F5F3] text-[#1A7A6E] border border-[#a8d4d0]',
  completed: 'bg-[#f4f4f4] text-[#888888] border border-[#cccccc]',
  on_hold:   'bg-[#fef3e0] text-[#D4820A] border border-[#f5d080]',
}

export const LEAD_SOURCE_OPTIONS = [
  { value: 'טלפון', label: 'טלפון' },
  { value: 'מייל', label: 'מייל' },
  { value: 'קמפיין', label: 'קמפיין' },
  { value: 'אחר', label: 'אחר' },
] as const

// Default stages inserted per track
export const DEFAULT_STAGES: Record<TrackValue, string[]> = {
  permit: [
    'בדיקת התכנות', 'חתימת חוזה', 'הגשת תיק מידע',
    'הגא', 'הגשת בקשה להיתר', 'החלטת ועדה', 'קבלת היתר',
  ],
  design: [
    'אישור חלופה', 'סיום הכנת תכניות למכרז',
    'סיום הכנת תכניות לביצוע', 'בחירת חומרים', 'ליווי פרויקט', 'מסירה',
  ],
  interior_design: [
    'בחירת חלופה', 'סיום תכניות מכרז',
    'סיום תכניות ביצוע', 'בחירת חומרים', 'מסירה',
  ],
  business_license: [
    'בדיקת התכנות', 'חתימת חוזה', 'הגשת תיק מידע',
    'הגא', 'הגשת בקשה להיתר', 'החלטת ועדה', 'קבלת היתר',
  ],
  claim: [
    'בדיקת התכנות', 'חתימת חוזה', 'הגשת תיק מידע',
    'הגא', 'הגשת בקשה להיתר', 'החלטת ועדה', 'קבלת היתר',
  ],
  other: [
    'בדיקת התכנות', 'חתימת חוזה', 'הגשת תיק מידע',
    'הגא', 'הגשת בקשה להיתר', 'החלטת ועדה', 'קבלת היתר',
  ],
}
