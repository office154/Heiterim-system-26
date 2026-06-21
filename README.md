# Heiterim System 26

מערכת ניהול פרויקטים לתכנון ואדריכלות — פנימית למשרד.

## Stack

- Next.js 14 App Router
- Supabase (Auth + DB)
- TanStack Query v5
- Tailwind v4
- shadcn/ui
- TypeScript

## התקנה

```bash
# 1. שכפול
git clone https://github.com/office154/Heiterim-system-26.git
cd Heiterim-system-26

# 2. התקנת תלויות
npm install

# 3. משתני סביבה
cp .env.example .env.local
# ערכי הסביבה האמיתיים נמצאים ב-Vercel Dashboard → Settings → Environment Variables

# 4. הרצה
npm run dev
```

פתחי [http://localhost:3000](http://localhost:3000)

## משתני סביבה

ראי `.env.example` לרשימה המלאה. הערכים האמיתיים שמורים ב:
- **Vercel Dashboard** → Project → Settings → Environment Variables
- **Supabase Dashboard** → Project → Settings → API

## ענפים

| ענף | מטרה |
|-----|------|
| `master` | Production — Vercel מפרסם אוטומטית |
| `develop` | פיתוח — Vercel בונה Preview URL |

כל שינוי עובר דרך PR מ-`develop` ל-`master`.

## תפקידים

| תפקיד | הרשאות |
|--------|---------|
| `admin` | גישה מלאה כולל נתונים פיננסיים |
| `employee` | גישה לפרויקטים, ללא נתונים פיננסיים |
| `pm` | גישה לפרויקטים מוקצים בלבד |
