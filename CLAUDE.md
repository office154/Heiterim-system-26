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