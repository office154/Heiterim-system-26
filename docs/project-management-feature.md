# פיצ'ר: טאב ניהול פרויקט

## מטרה

הוספת טאב "ניהול פרויקט" לדף הפרויקט (`/projects/[id]`).  
הטאב כולל שני אזורים מרכזיים:
- **משימות** — ניהול משימות פנימיות עם עדיפות, סטטוס, תאריך יעד, תתי-משימות ותיוגים
- **אנשי קשר** — ניהול אנשי קשר ספציפיים לפרויקט (קבלן, מפקח, יועץ...)

---

## החלטות אדריכליות שהתקבלו

| נושא | החלטה |
|------|--------|
| מיקום | טאב נפרד ועצמאי — לא הרחבה של `status-tab` |
| אנשי קשר | ספציפיים לפרויקט, בטבלה נפרדת (`project_contacts`) |
| DB Security | RLS `for all` עם `auth.role() = 'authenticated'` — זהה לשאר הטבלאות |
| Hooks | co-located עם הפיצ'ר ב-`_components/project-management/hooks/` |
| Types | union types ב-`types/database.ts` (single source of truth) + re-export ב-`types.ts` המקומי |
| Labels | מילוני תרגום לעברית ב-`types.ts` (לא inline בקומפוננטים) |

---

## מה כבר נעשה ✓

- [x] **Migration** — `supabase/migrations/20260425000000_project_management_tab.sql`
  - טבלה `project_contacts` (id, project_id, name, role, company, phone, email, notes, created_at)
  - טבלה `project_tasks` (id, project_id, title, description, priority, status, urgency, deadline, contact_id, waiting_on_contact_id, phase, party, tags, subtasks jsonb, created_at, completed_at)
  - RLS + indexes על `project_id` בשתי הטבלאות
  - הטבלאות הורצו ב-Supabase ✓

- [x] **Types ב-`types/database.ts`**
  - `project_contacts` — סכמה חדשה
  - `project_tasks` — Row / Insert / Update מלאים
  - Convenience types: `ProjectContact`, `ProjectTask`, `Subtask`
  - Union types: `TaskPriority`, `TaskStatus`, `TaskUrgency`, `TaskPhase`, `TaskParty`

- [x] **`_components/project-management/types.ts`**
  - Re-export כל ה-types מ-`@/types/database`
  - מילוני תרגום: `PRIORITY_LABELS`, `STATUS_LABELS`, `URGENCY_LABELS`, `PHASE_LABELS`, `PARTY_LABELS`
  - מערכי options מוכנים לשימוש ב-`<select>`: `PRIORITY_OPTIONS`, `STATUS_OPTIONS`, `URGENCY_OPTIONS`, `PHASE_OPTIONS`, `PARTY_OPTIONS`

- [x] **`hooks/use-project-tasks.ts`**
  - `useProjectTasks(projectId)` — query key: `['project-tasks', projectId]`
  - `useCreateTask()`, `useUpdateTask()`, `useDeleteTask()`
  - `useToggleSubtask()` — מקבל `{ id, projectId, subtasks, index }`, מחשב toggle פנימית
  - `useUpdateTask` מנהל `completed_at` אוטומטית

- [x] **`hooks/use-project-contacts.ts`**
  - `useProjectContacts(projectId)` — query key: `['project-contacts', projectId]`
  - `useCreateContact()`, `useUpdateContact()`, `useDeleteContact()`

- [x] **ניקוי dead code**
  - הוסר קומפוננט `ContactsTable` מ-`status-tab.tsx`
  - נמחק `lib/hooks/use-contacts.ts`
  - Build עבר ✓ | TypeScript נקי ✓

- [x] **שלב 7א — Atoms** (`components/atoms/`)
  - `priority-badge.tsx` — badge לפי עדיפות (critical=אדום, high=כתום, normal=אפור, low=שקוף עם גבול)
  - `urgency-badge.tsx` — today=badge אדום, week=טקסט כתום, later=טקסט אפור; תומך ב-`deadline` לפורמט DD.MM
  - `tag-chip.tsx` — chip קטן עם רקע stone-100
  - `contact-avatar.tsx` — ראשי תיבות + שם, 4 פלטות צבע לפי hash של השם, תומך size="sm"|"md"
  - `subtask-progress.tsx` — `☑ X/Y` כ-chip

- [x] **שלב 7ב — Task Row & Group** (`components/`)
  - `task-row.tsx` — שורת משימה: checkbox, כותרת, urgency badge, כפתור "בוצע", priority badge, tags, subtask progress. תומך בהרחבה (description + תתי-משימות). רקע `#FCEBEB` כשisUrgent
  - `task-group.tsx` — עוטף TaskRow-ים עם header חופשי (ReactNode), border אדום כשisUrgent

- [x] **שלב 7ג — 4 תצוגות** (`components/views/`)
  - `types.ts` — `ViewProps` משותף לכל התצוגות
  - `by-urgency-view.tsx` — קבוצות: היום / השבוע / בהמשך (מסנן done)
  - `by-contact-view.tsx` — קבוצות לפי איש קשר, ממוינות: urgent→waiting→רגיל; כולל "ללא איש קשר"
  - `by-phase-view.tsx` — קבוצות: תכנון / אישורים / החלטות לקוח / הגשה
  - `by-party-view.tsx` — קבוצות: פנימי / לקוח / רשויות / יועצים

- [x] **שלב 7ד — Entry Point + חיבור ל-page.tsx**
  - `project-management-tab.tsx` — stats cards (היום/שבוע/בהמשך/בוצעו), בורר תצוגות, ViewComponent דינמי, handlers ל-toggleDone ו-toggleSubtask
  - `page.tsx` — import, TAB_LABELS, valid tabs, TabsTrigger, TabsContent
  - **הטאב מוצג בהצלחה ב-localhost** ✓ — מציג "אין משימות בפרויקט הזה" (אין נתונים עדיין)

---

## מה נשאר לעשות

### שלב 7ה — טפסים (השלב הבא)
- [ ] `forms/task-form.tsx` — הוספה/עריכה של משימה (כל השדות: title, description, priority, urgency, deadline, phase, party, tags, subtasks, contact_id)
- [ ] `forms/contact-form.tsx` — הוספה/עריכה של איש קשר (name, role, company, phone, email, notes)
- [ ] חיבור הכפתורים ב-`project-management-tab.tsx` (כרגע disabled עם "(בשלב הבא)")

### שלב 7ו — מסך דוח לקוח (אופציונלי / שלב מאוחר)
- [ ] תצוגת "דוח לקוח" — סיכום ייצוגי של הפרויקט

---

## מבנה תיקיות סופי

```
app/(dashboard)/projects/[id]/_components/project-management/
├── types.ts                          ✓
├── hooks/
│   ├── use-project-tasks.ts          ✓
│   └── use-project-contacts.ts       ✓
└── components/
    ├── atoms/
    │   ├── priority-badge.tsx         ✓
    │   ├── urgency-badge.tsx          ✓
    │   ├── tag-chip.tsx               ✓
    │   ├── contact-avatar.tsx         ✓
    │   └── subtask-progress.tsx       ✓
    ├── task-row.tsx                   ✓
    ├── task-group.tsx                 ✓
    ├── views/
    │   ├── types.ts                   ✓
    │   ├── by-urgency-view.tsx        ✓
    │   ├── by-contact-view.tsx        ✓
    │   ├── by-phase-view.tsx          ✓
    │   └── by-party-view.tsx          ✓
    └── forms/
        ├── task-form.tsx              ← שלב 7ה
        └── contact-form.tsx           ← שלב 7ה

app/(dashboard)/projects/[id]/_components/
└── project-management-tab.tsx        ✓  (entry point)
```

---

## סטנדרטים לעקוב

| נושא | כלל |
|------|-----|
| UI Components | shadcn/ui (`Button`, `Checkbox`, `Tabs`...) |
| Styling | Tailwind + hex hardcoded (לא CSS variables — לוודא יציבות חזותית) |
| כיוון | `dir="rtl"` | classes: `me-`, `ms-`, `ps-`, `pe-` |
| Data | React Query — hooks בלבד, לא fetch ישיר בקומפוננט |
| Pattern | זהה ל-`use-stages.ts`: `useQuery` + `useMutation` + `invalidateQueries` |
| TypeScript | strict — לא `any`, לא cast מיותר |
| תרגומים | תמיד דרך `PRIORITY_LABELS` / `STATUS_LABELS` וכו' מ-`types.ts` |
| Comments | רק כשה-WHY לא ברור — לא תיאור של WHAT |
| UI Text | עברית בלבד |

### Design tokens רלוונטיים לפיצ'ר
```
critical  → bg-[#E24B4A] text-white
high      → bg-[#F0997B] text-[#4A1B0C]
normal    → bg-stone-100 text-stone-600
low       → border border-stone-200 text-stone-500

today     → bg-[#FCEBEB] / badge: bg-[#E24B4A] text-white
week      → bg-[#FAEEDA] / text-[#854F0B]
later     → bg-stone-100 / text-stone-500

done      → bg-[#EAF3DE] text-[#27500A]
```

### useUpdateTask — חתימה נכונה
```ts
updateTask.mutate({ id, projectId, status: newStatus })
// הook מנהל completed_at אוטומטית — אין צורך להעביר אותו
```
