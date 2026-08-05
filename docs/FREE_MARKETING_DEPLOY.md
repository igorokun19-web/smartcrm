# Free Marketing Site

המטרה: להעלות אתר שיווקי חינמי ומהיר בלי backend.

## מה נפרס

- רק `frontend`
- עמוד הבית הוא דף נחיתה ציבורי
- `login` נשאר זמין, אבל המערכת המלאה דורשת backend

## איפה לפרוס

- Vercel Free
- Netlify Free

## Vercel

1. מעלים את תיקיית `frontend`
2. `Build Command`: `npm run build`
3. `Output Directory`: `dist`

`vercel.json` כבר כולל rewrite ל-React Router.

## משתני סביבה מומלצים

```env
VITE_CONTACT_EMAIL=you@example.com
VITE_WHATSAPP_NUMBER=9725XXXXXXXX
VITE_BOOK_DEMO_URL=https://wa.me/9725XXXXXXXX
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_INTERNAL_ANALYTICS=false
```

## הערה על אנליטיקה

בפריסה חינמית ללא backend:
- המדידה הפנימית ל-SQLite לא תפעל
- GA4 יכול לפעול אם תגדיר `VITE_GA_MEASUREMENT_ID`

אם רוצים שאיסוף הנתונים יישמר בתוך המערכת עצמה, צריך לפרוס גם backend.