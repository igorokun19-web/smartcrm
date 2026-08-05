from PIL import Image, ImageDraw, ImageFont
import os
import textwrap
from bidi.algorithm import get_display
import arabic_reshaper

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "posts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

W, H = 1080, 1080  # Instagram square

POSTS = [
    {
        "filename": "post_01_pov_electrician.jpg",
        "hook": "POV:",
        "lines": [
            "אתה חשמלאי",
            "3 לקוחות כתבו",
            "בזמן שעבדת",
            "",
            "אף אחד לא קיבל",
            "תשובה",
            "",
            "הם אצל המתחרה",
        ],
        "cta": "עקבו לפתרון ⬇️",
        "bg": (10, 10, 10),
        "hook_color": (255, 50, 50),
        "text_color": (255, 255, 255),
        "cta_color": (100, 200, 255),
    },
    {
        "filename": "post_02_before_after.jpg",
        "hook": "לפני AI vs אחרי AI",
        "lines": [
            "לפני:",
            "✗  הצעת מחיר = שעה",
            "✗  תשובה ללקוח = ידנית",
            "✗  פולו-אפ = לא קורה",
            "",
            "אחרי:",
            "✓  הצעת מחיר = 30 שניות",
            "✓  תשובה = אוטומטית",
            "✓  פולו-אפ = אוטומטי",
        ],
        "cta": "שמרו 📌",
        "bg": (8, 8, 20),
        "hook_color": (255, 200, 0),
        "text_color": (220, 220, 220),
        "cta_color": (100, 255, 150),
    },
    {
        "filename": "post_03_secret.jpg",
        "hook": "הדבר שאף אחד",
        "lines": [
            "לא מספר לך",
            "",
            "75% מהכסף שלך",
            "מחכה בלקוחות",
            "שכבר שילמו לך",
            "",
            "פשוט לא פנית",
            "אליהם שוב",
        ],
        "cta": "הפרומפט בתגובות 👇",
        "bg": (15, 5, 25),
        "hook_color": (220, 100, 255),
        "text_color": (240, 240, 240),
        "cta_color": (200, 150, 255),
    },
    {
        "filename": "post_04_3_mistakes.jpg",
        "hook": "3 טעויות =",
        "lines": [
            "3,000₪ פחות",
            "כל חודש",
            "",
            "1. לא עונים מהר",
            "2. אין פולו-אפ",
            "3. שוכחים לקוחות",
            "",
            "AI פותר את 3-ן",
            "בחינם",
        ],
        "cta": "שמרו 📌 חשוב",
        "bg": (20, 5, 5),
        "hook_color": (255, 80, 80),
        "text_color": (240, 240, 240),
        "cta_color": (255, 180, 100),
    },
    {
        "filename": "post_05_quote_card.jpg",
        "hook": "\"עבודה קשה",
        "lines": [
            "ב-2026",
            "זה לא מספיק\"",
            "",
            "עבודה חכמה",
            "+ AI",
            "= הכסף האמיתי",
        ],
        "cta": "עקבו לעוד טיפים ⬇️",
        "bg": (5, 15, 30),
        "hook_color": (100, 200, 255),
        "text_color": (220, 220, 220),
        "cta_color": (100, 220, 150),
    },
    {
        "filename": "post_06_whatsapp_tip.jpg",
        "hook": "WhatsApp Business",
        "lines": [
            "= לקוחות שלא",
            "בורחים בלילה 🌙",
            "",
            "3 דקות הגדרה:",
            "הגדרות ← הודעות",
            "← תשובה אוטומטית",
            "",
            "חינם לגמרי",
        ],
        "cta": "שמרו 📌",
        "bg": (5, 20, 10),
        "hook_color": (0, 200, 100),
        "text_color": (230, 230, 230),
        "cta_color": (100, 255, 150),
    },
    {
        "filename": "post_07_chatgpt_prompt.jpg",
        "hook": "הפרומפט שחוסך",
        "lines": [
            "שעה ביום:",
            "",
            "\"כתוב הצעת מחיר",
            "לחשמלאי.",
            "עבודה: 200₪",
            "חומרים: 80₪",
            "מקצועי, עברית\"",
            "",
            "30 שניות. תוצאה.",
        ],
        "cta": "שמרו 📌 + שתפו",
        "bg": (15, 15, 5),
        "hook_color": (255, 220, 50),
        "text_color": (235, 235, 235),
        "cta_color": (255, 180, 0),
    },
    {
        "filename": "post_08_stats.jpg",
        "hook": "126,000 מחפשי עבודה",
        "lines": [
            "בקבוצה אחת",
            "",
            "53,000 בעלי עסקים",
            "בקבוצה אחת",
            "",
            "אם אתה לא שם —",
            "המתחרה שלך כן",
        ],
        "cta": "AI לעסקים קטנים ⬇️",
        "bg": (10, 10, 25),
        "hook_color": (80, 150, 255),
        "text_color": (230, 230, 230),
        "cta_color": (100, 200, 255),
    },
    {
        "filename": "post_09_2026_reality.jpg",
        "hook": "המציאות של 2026:",
        "lines": [
            "",
            "עסק בלי AI",
            "= מחיר גבוה יותר",
            "= זמן ארוך יותר",
            "= לקוחות פחות",
            "",
            "עסק עם AI",
            "= הפוך מכל זה",
        ],
        "cta": "עקבו — מלמדים כאן",
        "bg": (12, 8, 18),
        "hook_color": (200, 100, 255),
        "text_color": (230, 230, 230),
        "cta_color": (180, 120, 255),
    },
    {
        "filename": "post_10_cta_follow.jpg",
        "hook": "אם אתה:",
        "lines": [
            "✓ בעל עסק קטן",
            "✓ עצמאי / פרילנסר",
            "✓ בעל מקצוע",
            "",
            "הדף הזה שווה לך",
            "אלפי שקלים",
            "",
            "עקבו עכשיו 🔔",
        ],
        "cta": "@okun_igal",
        "bg": (5, 5, 5),
        "hook_color": (255, 255, 100),
        "text_color": (240, 240, 240),
        "cta_color": (150, 220, 255),
    },
]


def get_font(size):
    """Try to load a Hebrew-compatible bold font, fallback to default."""
    font_paths = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/tahoma.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def fix_hebrew(text):
    """Fix Hebrew RTL rendering."""
    if not text or text.strip() in ("", ""):
        return text
    try:
        reshaped = arabic_reshaper.reshape(text)
        return get_display(reshaped)
    except Exception:
        return get_display(text)


def draw_post(post):
    img = Image.new("RGB", (W, H), post["bg"])
    draw = ImageDraw.Draw(img)

    # Subtle gradient overlay
    for y in range(H):
        alpha = int(20 * (y / H))
        draw.line([(0, y), (W, y)], fill=tuple(min(255, c + alpha) for c in post["bg"]))

    # Top accent line
    draw.rectangle([(0, 0), (W, 8)], fill=post["hook_color"])

    # Bottom accent line
    draw.rectangle([(0, H - 8), (W, H)], fill=post["hook_color"])

    # Watermark
    wm_font = get_font(26)
    draw.text((40, H - 55), "@okun_igal", font=wm_font, fill=(120, 120, 120))

    # Hook (large, colored)
    hook_font = get_font(72)
    hook_text = fix_hebrew(post["hook"])
    bbox = draw.textbbox((0, 0), hook_text, font=hook_font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, 80), hook_text, font=hook_font, fill=post["hook_color"])

    # Body lines
    body_font = get_font(52)
    y_pos = 200
    for line in post["lines"]:
        if line == "":
            y_pos += 20
            continue
        display_line = fix_hebrew(line)
        bbox = draw.textbbox((0, 0), display_line, font=body_font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        draw.text((x, y_pos), display_line, font=body_font, fill=post["text_color"])
        y_pos += 70

    # CTA
    cta_font = get_font(48)
    cta_text = fix_hebrew(post["cta"])
    bbox = draw.textbbox((0, 0), cta_text, font=cta_font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, H - 120), cta_text, font=cta_font, fill=post["cta_color"])

    # Save
    path = os.path.join(OUTPUT_DIR, post["filename"])
    img.save(path, "JPEG", quality=95)
    print(f"✅ {post['filename']}")
    return path


if __name__ == "__main__":
    print("🎨 יוצר 10 תמונות לאינסטגרם...\n")
    for post in POSTS:
        draw_post(post)
    print(f"\n✅ כל התמונות נשמרו ב: {OUTPUT_DIR}")
