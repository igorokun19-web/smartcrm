# Analytics Setup

המערכת שומרת עכשיו אירועי שימוש פנימיים ב-SQLite דרך `backend/routes/analytics.js`.

מה נמדד כרגע:
- `page_view` על כל מעבר עמוד
- `login_success` / `login_failed`
- `register_success` / `register_failed`
- `forgot_password_requested` / `forgot_password_failed`
- `reset_password_success` / `reset_password_failed`
- `logout`

מה אפשר לשאול אחר כך:
- כמה אנשים נכנסו לאתר
- כמה סשנים היו
- כמה משתמשים מחוברים השתמשו במערכת
- מאיזה `utm_campaign` ו-`utm_source` הגיעו
- אילו עמודים קיבלו הכי הרבה צפיות

## Optional GA4

אם רוצים גם Google Analytics 4, מוסיפים ב-frontend env:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

ואז ה-frontend ישלח את אותם אירועים גם ל-GA4.

## UTM מומלץ לפרסום

```text
https://your-site.com/?utm_source=facebook&utm_medium=group&utm_campaign=ani_shulman
```

הפרמטרים נשמרים עם כל `page_view`, כך שאפשר לנתח אחר כך איזה קמפיין וקבוצה הביאו כניסות.