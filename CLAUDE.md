# CLAUDE.md

## Project Identity

This is a production-oriented internal system for managing clients and projects.

The system is not a demo, not a prototype, and not a generic SaaS template.
It is a real product that must remain stable, predictable, and maintainable.

Core purpose:
- Manage clients
- Manage multiple projects per client
- Track project progress and stages
- Track payments, invoices, and alerts
- Provide admin and employee views

## Tech Stack (DO NOT CHANGE)

- Next.js 14 (App Router)
- React 18
- TypeScript
- Supabase (database and backend)
- React Query (data fetching and caching)
- Tailwind CSS
- shadcn UI patterns

Do not replace or introduce alternative frameworks without explicit instruction.

## Folder Structure (MANDATORY)

- app → routing, pages, layouts
- components → UI and feature components
  - ui → low-level reusable components
  - shared → cross-feature components
  - features → domain-specific components
- lib → logic layer
  - hooks → data hooks (React Query)
  - supabase → backend access
  - constants / utils → shared logic
- supabase → SQL schema and migrations

Do not break this structure.
Do not move files randomly.
Do not duplicate logic across folders.

## Data Flow Rules (CRITICAL)

All data must come through hooks in:
lib/hooks

Example:
useDashboardData()

Do NOT:
- fetch directly inside components
- mix UI with data fetching logic
- bypass React Query

If new data is needed:
→ create or extend a hook in lib/hooks

## Supabase Rules (HIGH RISK AREA)

Supabase is a critical system.

Do NOT:
- change schema without explicit instruction
- modify SQL files unless asked
- alter authentication logic
- expose keys or secrets
- move backend logic into frontend

All Supabase interaction must go through:
lib/supabase

## UI Rules (VERY IMPORTANT)

Current UI is already styled and consistent.
Do not redesign randomly.

Avoid:
- generic SaaS look
- heavy rounded childish UI
- random colors
- inline messy styling
- inconsistent spacing

Prefer:
- clean layout
- strong hierarchy
- minimal and precise UI
- consistent spacing
- reusable components

If UI is repeated:
→ extract component into components/ui or shared

## Component Rules

Before creating a new component:
- check if one already exists
- reuse existing patterns

Avoid:
- duplicating components
- mixing business logic inside UI
- large monolithic components

Prefer:
- small focused components
- clear props
- readable structure

## Editing Rules (STRICT)

Before editing:
1. Read the relevant file
2. Understand current behavior
3. Make minimal change

Do NOT:
- rewrite working code
- refactor large areas without request
- rename files freely
- change structure “because it feels better”

## Styling Rules

Tailwind is used.

Do NOT:
- introduce another styling system
- mix multiple styling approaches

Avoid:
- random hex colors
- inconsistent spacing
- breaking existing design language

## Routing Rules

Routing is handled by Next.js App Router.

Do NOT:
- change route structure arbitrarily
- move pages without reason

## Safety Rules

NEVER:
- delete files unless explicitly asked
- touch environment files
- modify authentication
- change database structure
- break dashboard logic

## Work Process

For every task:

1. Inspect existing code
2. Explain what will be changed
3. Apply minimal safe change

If something is unclear:
→ do not assume
→ do not invent logic

## System Behavior

- A client can have multiple projects
- Each project has stages
- Each stage may have financial data
- Dashboard depends on aggregated data
- Alerts depend on business logic

Do not break these relationships.

## Long Term Direction

The system will grow.

Future features may include:
- more advanced workflows
- client communication
- document management
- analytics

Build in a way that supports growth without rewriting the system.

---

## Language & Direction (MANDATORY)

- All UI text must be in **Hebrew**
- Layout is **RTL** — use `dir="rtl"` where needed, and prefer RTL-aware Tailwind classes (`me-`, `ms-`, `ps-`, `pe-`)
- Font: **Rubik** (already set globally in globals.css)
- Do not write English UI labels, button text, or placeholder text

## Design System (DO NOT DEVIATE)

Design tokens are defined in `app/globals.css`. Always use CSS variables, not hardcoded hex values.

Key tokens:
```
--bg-base / --bg-surface:    #F0F2F5   (page background)
--bg-card:                   #ffffff   (card/panel background)
--bg-hover:                  #EBF1F9   (row hover)
--accent-primary:            #3D6A9E   (blue — primary action)
--accent-primary-light:      #EBF1F9   (light blue — badges, highlights)
--accent-secondary:          #5C7A92
--danger:                    #C0392B
--danger-light:              #fdf0ef
--warning:                   #D4820A
--warning-light:             #fef3e0
--text-primary:              #1a1a1a
--text-secondary:            #6B7280
--text-muted:                #9CA3AF
--border:                    #E5E7EB
--radius:                    0.5rem    (use rounded-sm / rounded-md via Tailwind)
--shadow-card:               subtle card shadow
```

Use Tailwind classes that map to these tokens (e.g. `bg-card`, `text-foreground`, `border-border`, `text-primary`).

## Existing Hooks (lib/hooks)

Do not recreate — extend if needed:

| Hook | Purpose |
|------|---------|
| `use-dashboard.ts` | Dashboard aggregated data |
| `use-clients.ts` | Client list and mutations |
| `use-contacts.ts` | Client/project contacts |
| `use-projects.ts` | Project list and mutations |
| `use-stages.ts` | Project stages (financial data) |
| `use-requirements.ts` | Status checklist items |
| `use-requirement-steps.ts` | Steps within requirements |
| `use-files.ts` | Project file uploads |
| `use-payments.ts` | Payments data |
| `use-reports.ts` | Reports data |
| `use-todos.ts` | Todo items |
| `use-users.ts` | User/profile management |
| `use-profile.ts` | Current user profile |

## Pages & Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Dashboard — overview widgets, alerts | All |
| `/clients` | Client list | All |
| `/clients/[id]` | Client detail | All |
| `/projects` | Project list (sort, drag, delete) | All |
| `/projects/new` | Create new project | All |
| `/projects/[id]` | Project detail — tabs below | All |
| `/projects/[id]` → general-info | Basic project info | All |
| `/projects/[id]` → stages | Financial stages | All |
| `/projects/[id]` → status | Requirements checklist | All |
| `/projects/[id]` → files | File uploads | All |
| `/payments` | Payments overview | **Admin only** |
| `/reports` | Financial & operational reports | **Admin only** |
| `/settings/users` | User management | **Admin only** |
| `/todos` | Todo/task list | All |

## Domain Values (EXACT — do not invent variants)

**Project tracks:**
`permit` | `design` | `interior_design` | `business_license` | `claim` | `other`

**Project status:**
`active` | `completed` | `on_hold`

**User roles:**
`admin` | `employee`

**Stage flags:**
`completed` | `invoice_sent` | `paid`

## Key Components (components/features/projects)

| File | Purpose |
|------|---------|
| `general-info-tab.tsx` | Project general info tab |
| `stages-tab.tsx` | Financial stages tab |
| `status-tab.tsx` | Requirements/checklist tab |
| `files-tab.tsx` | File uploads tab |
| `project-overview.tsx` | Project summary card |
| `ProjectTimeline.tsx` | Visual timeline |