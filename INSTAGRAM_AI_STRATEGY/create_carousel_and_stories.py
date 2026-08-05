"""
Creates a 10-slide Instagram Carousel "10 ChatGPT Prompts" 
+ 3 Story Poll images
All 1080x1080 (carousel) and 1080x1920 (stories)
"""
from PIL import Image, ImageDraw, ImageFont
from bidi.algorithm import get_display
import arabic_reshaper
import os

BASE = os.path.dirname(__file__)
CAROUSEL_DIR = os.path.join(BASE, "carousel_prompts")
STORIES_DIR  = os.path.join(BASE, "story_polls")
os.makedirs(CAROUSEL_DIR, exist_ok=True)
os.makedirs(STORIES_DIR, exist_ok=True)

def heb(text):
    try:
        text = clean(text)
        return get_display(arabic_reshaper.reshape(text))
    except:
        return get_display(clean(text))

def font(size):
    for p in ["C:/Windows/Fonts/arialbd.ttf","C:/Windows/Fonts/arial.ttf","C:/Windows/Fonts/tahoma.ttf"]:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: pass
    return ImageFont.load_default()

def clean(text):
    """Remove/replace emoji with clean text alternatives."""
    replacements = {
        "💼": "[*]", "🤝": "[+]", "📲": "[>]", "📋": "[=]",
        "📣": "[!]", "💰": "[$]", "🔄": "[~]", "📞": "[T]",
        "⭐": "[*]", "🎯": "[X]", "🎁": "GIFT", "📊": "POLL",
        "🤖": "AI", "😓": ":/", "😅": ":)", "😩": ":(",
        "📄": "[doc]", "🤦": "...", "⚡": ">>", "←": "<-",
        "📌": "[PIN]", "✅": "[V]", "❌": "[X]", "🔧": "[tool]",
        "👇": "[V]", "👍": "[+]", "💬": "[msg]", "⬇️": "[v]",
        "🎉": "[!]", "😊": ":)", "🚀": "[^]", "🔥": "[HOT]",
        "🌙": "[night]",
    }
    for emoji, replacement in replacements.items():
        text = text.replace(emoji, replacement)
    # Remove remaining emoji (any non-ASCII non-Hebrew)
    result = []
    for ch in text:
        if ord(ch) < 0x590 or (0x5D0 <= ord(ch) <= 0x5EA) or ch in ' \n\t.,!?-:;/()[]':
            result.append(ch)
        elif 0x21 <= ord(ch) <= 0x7E:  # printable ASCII
            result.append(ch)
    return ''.join(result)

def center_text(draw, text, f, y, color, W=1080, shadow_color=None):
    text = heb(text)
    bb = draw.textbbox((0,0), text, font=f)
    tw = bb[2]-bb[0]
    x = (W - tw) // 2
    if shadow_color:
        draw.text((x+3, y+3), text, font=f, fill=shadow_color)
    draw.text((x, y), text, font=f, fill=color)
    return bb[3]-bb[1]

def wrap_text(draw, text, f, max_w):
    """Simple word wrap for Hebrew."""
    words = text.split()
    lines = []
    current = []
    for w in words:
        test = " ".join(current + [w])
        bb = draw.textbbox((0,0), heb(test), font=f)
        if bb[2]-bb[0] > max_w and current:
            lines.append(" ".join(current))
            current = [w]
        else:
            current.append(w)
    if current:
        lines.append(" ".join(current))
    return lines

# ═══════════════════════════════════════
# CAROUSEL SLIDES (1080x1080)
# ═══════════════════════════════════════

PROMPTS = [
    {
        "num": "1",
        "title": "הצעת מחיר מקצועית",
        "prompt": '"כתוב הצעת מחיר לחשמלאי. עבודה: [סכום]. חומרים: [סכום]. מקצועי, עברית, קצר."',
        "use": "חשמלאים / אינסטלטורים / שיפוצניקים",
        "time": "30 שניות",
        "color_bg": (8, 5, 20),
        "color_accent": (255, 100, 0),
        "emoji": "💼",
    },
    {
        "num": "2",
        "title": "תשובה ללקוח לא מרוצה",
        "prompt": '"לקוח כתב: [ההודעה שלו]. כתוב תשובה מקצועית ואמפתית שתגרום לו להרגיש שנשמע."',
        "use": "כל בעל עסק",
        "time": "20 שניות",
        "color_bg": (5, 15, 8),
        "color_accent": (0, 200, 80),
        "emoji": "🤝",
    },
    {
        "num": "3",
        "title": "פולו-אפ לאחר הצעת מחיר",
        "prompt": '"כתוב הודעת WhatsApp קצרה ומנומסת לבדוק אם [שם לקוח] קיבל החלטה על ההצעה שלחנו."',
        "use": "כל בעל עסק",
        "time": "15 שניות",
        "color_bg": (15, 5, 5),
        "color_accent": (255, 50, 50),
        "emoji": "📲",
    },
    {
        "num": "4",
        "title": "סיכום שיחת לקוח",
        "prompt": '"סכם בנקודות את השיחה הבאה עם לקוח: [הדבק את השיחה]. מה הוסכם? מה הצעדים הבאים?"',
        "use": "אחרי כל פגישה",
        "time": "10 שניות",
        "color_bg": (5, 5, 20),
        "color_accent": (80, 150, 255),
        "emoji": "📋",
    },
    {
        "num": "5",
        "title": "תיאור שירות לפייסבוק",
        "prompt": '"כתוב פוסט פייסבוק מושך לעסק של [מקצוע] שמציע [שירות]. 3 שורות. הוסף קריאה לפעולה."',
        "use": "שיווק ופרסום",
        "time": "25 שניות",
        "color_bg": (15, 5, 15),
        "color_accent": (200, 80, 255),
        "emoji": "📣",
    },
    {
        "num": "6",
        "title": "תזכורת ללקוח ישן",
        "prompt": '"כתוב הודעה ידידותית ל[שם] שעבדנו איתו לפני שנה. שאל אם הכל תקין ואם צריך שירות נוסף."',
        "use": "החזרת לקוחות ישנים",
        "time": "20 שניות",
        "color_bg": (5, 15, 15),
        "color_accent": (0, 200, 200),
        "emoji": "🔄",
    },
    {
        "num": "7",
        "title": "תמחור נכון",
        "prompt": '"אני [מקצוע] בישראל. עבודה של [תיאור]. כמה לגבות? תן טווח מחירים ריאלי לשנת 2026."',
        "use": "תמחור שירותים",
        "time": "15 שניות",
        "color_bg": (15, 10, 0),
        "color_accent": (255, 180, 0),
        "emoji": "💰",
    },
    {
        "num": "8",
        "title": "סקריפט לטלפון",
        "prompt": '"כתוב סקריפט קצר לשיחת טלפון עם לקוח חדש שהתעניין ב[שירות]. טבעי, מקצועי, 2 דקות."',
        "use": "שיחות מכירה",
        "time": "30 שניות",
        "color_bg": (8, 5, 15),
        "color_accent": (150, 100, 255),
        "emoji": "📞",
    },
    {
        "num": "9",
        "title": "תשובה לביקורת שלילית",
        "prompt": '"קיבלתי ביקורת שלילית בגוגל: [הטקסט]. כתוב תשובה מקצועית שמציגה אותי באור טוב."',
        "use": "ניהול מוניטין",
        "time": "20 שניות",
        "color_bg": (15, 3, 3),
        "color_accent": (255, 80, 80),
        "emoji": "⭐",
    },
    {
        "num": "10",
        "title": "תוכנית עסקית חודשית",
        "prompt": '"אני [מקצוע] עם [X] לקוחות. עזור לי לתכנן את החודש הבא — יעדים, פעולות ומדדי הצלחה."',
        "use": "תכנון עסקי",
        "time": "45 שניות",
        "color_bg": (3, 8, 20),
        "color_accent": (50, 180, 255),
        "emoji": "🎯",
    },
]

def make_cover():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), (5, 5, 15))
    draw = ImageDraw.Draw(img)

    # Gradient bg
    for y in range(H):
        r = int(5 + 20 * y/H)
        g = int(5 + 5 * y/H)
        b = int(15 + 30 * y/H)
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    # Decorative circles
    draw.ellipse([-100,-100,400,400], outline=(255,150,0,30), width=2)
    draw.ellipse([700,700,1200,1200], outline=(80,150,255,30), width=2)
    draw.ellipse([200,600,900,1300], outline=(200,80,255,20), width=2)

    # Top badge
    badge_font = font(40)
    badge_text = heb("🎁 מתנה חינמית")
    bb = draw.textbbox((0,0), badge_text, font=badge_font)
    bw = bb[2]-bb[0]
    bx = (W-bw)//2
    draw.rounded_rectangle([(bx-24,80),(bx+bw+24,148)], radius=50,
                            fill=(255,140,0,200))
    draw.text((bx, 88), badge_text, font=badge_font, fill=(0,0,0))

    # Main title
    t1 = font(96)
    center_text(draw, "10 פרומפטים", t1, 190, (255,255,255),
                shadow_color=(0,0,0))
    t2 = font(72)
    center_text(draw, "לChatGPT", t2, 310, (255, 200, 50),
                shadow_color=(100,60,0))

    # Subtitle
    t3 = font(46)
    center_text(draw, "שכל בעל מקצוע בישראל", t3, 420, (200,200,200))
    center_text(draw, "חייב לשמור", t3, 480, (200,200,200))

    # Preview icons
    emojis = ["💼","🤝","📲","📋","📣","💰","🔄","📞","⭐","🎯"]
    x_start = 60
    ey = 580
    ef = font(52)
    for i, e in enumerate(emojis):
        x = x_start + i * 98
        draw.text((x, ey), e, font=ef, fill=(255,255,255))

    # Horizontal line
    draw.rectangle([(60,670),(1020,674)], fill=(255,255,255,30))

    # Bottom CTA
    t4 = font(38)
    center_text(draw, "שמרו 📌 + עקבו @okun_igal", t4, 720,
                (150,220,255))
    t5 = font(30)
    center_text(draw, "כל פרומפט = 15-45 שניות חיסכון", t5, 790,
                (160,160,160))

    # Slide counter
    tc = font(28)
    center_text(draw, "1 / 11", tc, 870, (100,100,100))

    # Watermark
    wm = font(26)
    center_text(draw, "@okun_igal", wm, 1040, (80,80,80))

    path = os.path.join(CAROUSEL_DIR, "slide_00_cover.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"✅ Cover slide")

def make_prompt_slide(data, slide_num):
    W, H = 1080, 1080
    bg = data["color_bg"]
    accent = data["color_accent"]

    img = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)

    # Subtle gradient
    for y in range(H):
        r = min(255, bg[0] + int(15 * y/H))
        g = min(255, bg[1] + int(10 * y/H))
        b = min(255, bg[2] + int(20 * y/H))
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    # Accent top bar
    draw.rectangle([(0,0),(W,8)], fill=accent)
    draw.rectangle([(0,0),(8,H)], fill=accent)

    # Number + emoji badge
    num_font = font(52)
    num_text = heb(f"#{data['num']}")
    draw.rounded_rectangle([(40,28),(190,110)], radius=20, fill=accent)
    bb = draw.textbbox((0,0), num_text, font=num_font)
    nx = 40 + (150 - (bb[2]-bb[0]))//2
    draw.text((nx, 36), num_text, font=num_font, fill=(255,255,255))

    # Emoji
    em_font = font(70)
    draw.text((820, 20), data["emoji"], font=em_font)

    # Title
    title_font = font(72)
    th = center_text(draw, data["title"], title_font, 140,
                     (255,255,255), shadow_color=(0,0,0))

    # Divider
    draw.rectangle([(60,230),(1020,233)], fill=(*accent, 80))

    # Prompt box
    draw.rounded_rectangle([(40,255),(1040,660)], radius=20,
                            fill=(255,255,255,12),
                            outline=(*accent, 60), width=2)

    # Prompt label
    lf = font(28)
    draw.text((64, 275), heb("💬 הפרומפט:"), font=lf,
              fill=(*accent, 255))

    # Prompt text (word-wrapped)
    pf = font(32)
    lines = wrap_text(draw, data["prompt"], pf, 940)
    py = 320
    for line in lines[:6]:
        lh = center_text(draw, line, pf, py, (220,220,220))
        py += lh + 10

    # Use case + time
    info_y = 690
    draw.rounded_rectangle([(40,info_y),(520,info_y+80)], radius=14,
                            fill=(255,255,255,8))
    draw.rounded_rectangle([(540,info_y),(780,info_y+80)], radius=14,
                            fill=(*accent, 30))

    if_font = font(28)
    draw.text((58, info_y+10), heb("🎯 " + data["use"]), font=if_font,
              fill=(180,180,180))
    tc_font = font(34)
    tc_text = heb("⚡ " + data["time"])
    bb2 = draw.textbbox((0,0), tc_text, font=tc_font)
    tx = 540 + (240 - (bb2[2]-bb2[0]))//2
    draw.text((tx, info_y+14), tc_text, font=tc_font, fill=accent)

    # "Try it" arrow
    try_font = font(34)
    center_text(draw, "← נסה אותו עכשיו ב-ChatGPT", try_font, 800,
                (160,160,160))

    # Slide counter
    sc_font = font(28)
    center_text(draw, f"{slide_num+1} / 11", sc_font, 900, (80,80,80))

    # Watermark
    wm = font(26)
    center_text(draw, "@okun_igal", wm, 1040, (80,80,80))

    path = os.path.join(CAROUSEL_DIR, f"slide_{slide_num:02d}_{data['title'].replace(' ','_')[:20]}.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"✅ Slide {slide_num}: {data['title']}")

def make_final_slide():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), (5, 5, 15))
    draw = ImageDraw.Draw(img)

    for y in range(H):
        r = int(5 + 25 * y/H)
        draw.line([(0,y),(W,y)], fill=(r, 5, 15+int(25*y/H)))

    draw.rectangle([(0,0),(W,8)], fill=(255,200,0))

    t1 = font(80)
    center_text(draw, "שמרתם?", t1, 120, (255,200,0),
                shadow_color=(100,60,0))

    t2 = font(52)
    center_text(draw, "אלה 10 הפרומפטים ששמרתי", t2, 240, (200,200,200))
    center_text(draw, "לעצמי — עכשיו הם שלכם", t2, 310, (200,200,200))

    draw.rectangle([(60,380),(1020,383)], fill=(255,255,255,20))

    steps = [
        ("1.", "עקבו @okun_igal — טיפ AI חדש כל יום"),
        ("2.", "שמרו את הפוסט הזה לשימוש עתידי"),
        ("3.", "תייגו חבר בעל עסק שצריך את זה"),
    ]
    y = 420
    sf = font(38)
    nf = font(44)
    for num, text in steps:
        draw.text((80, y), heb(num), font=nf, fill=(255,180,0))
        tw = draw.textbbox((0,0), heb(text), font=sf)
        draw.text((145, y+4), heb(text), font=sf, fill=(220,220,220))
        y += 75

    draw.rounded_rectangle([(60,640),(1020,760)], radius=20,
                            fill=(255,180,0,40))
    t3 = font(46)
    center_text(draw, "SmartCRM — ניהול לקוחות חינם", t3, 672,
                (255,200,100))
    t4 = font(32)
    center_text(draw, "frontend-two-pearl-10.vercel.app/home", t4, 726,
                (150,180,255))

    sc_f = font(28)
    center_text(draw, "11 / 11", sc_f, 900, (80,80,80))
    wm = font(26)
    center_text(draw, "@okun_igal", wm, 1040, (80,80,80))

    path = os.path.join(CAROUSEL_DIR, "slide_11_final.jpg")
    img.save(path, "JPEG", quality=95)
    print("✅ Final CTA slide")

# ═══════════════════════════════════════
# STORY POLL IMAGES (1080x1920)
# ═══════════════════════════════════════

POLLS = [
    {
        "filename": "story_poll_1.jpg",
        "question": "ניסית\nChatGPT\nלעסק שלך?",
        "option_a": "כן! 🤖",
        "option_b": "עוד לא 😅",
        "bg_top": (8, 5, 20),
        "bg_bot": (15, 5, 5),
        "accent": (255, 100, 0),
        "sub": "כתוב בתגובות את התוצאה 👇",
    },
    {
        "filename": "story_poll_2.jpg",
        "question": "כמה שעות\nאתה עובד\nביום?",
        "option_a": "8-10 שעות",
        "option_b": "10+ שעות 😩",
        "bg_top": (5, 15, 5),
        "bg_bot": (5, 5, 20),
        "accent": (0, 200, 80),
        "sub": "עם AI אפשר לחתוך את זה בחצי",
    },
    {
        "filename": "story_poll_3.jpg",
        "question": "מה הכי\nמעצבן\nבניהול עסק?",
        "option_a": "ניירת 📄",
        "option_b": "לקוחות 🤦",
        "bg_top": (15, 5, 15),
        "bg_bot": (5, 5, 20),
        "accent": (200, 80, 255),
        "sub": "AI פותר את שניהם — עקבו",
    },
]

def make_story_poll(data):
    W, H = 1080, 1920
    img = Image.new("RGB", (W, H), data["bg_top"])
    draw = ImageDraw.Draw(img)
    acc = data["accent"]

    # Gradient bg
    for y in range(H):
        t = y/H
        r = int(data["bg_top"][0]*(1-t) + data["bg_bot"][0]*t)
        g = int(data["bg_top"][1]*(1-t) + data["bg_bot"][1]*t)
        b = int(data["bg_top"][2]*(1-t) + data["bg_bot"][2]*t)
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    # Top accent
    draw.rectangle([(0,0),(W,10)], fill=acc)

    # Instagram-style header
    header_f = font(36)
    draw.text((50, 60), heb("@okun_igal"), font=header_f,
              fill=(200,200,200))
    draw.text((50, 100), heb("AI לעסקים קטנים 🤖"), font=header_f,
              fill=(150,150,150))

    # Question
    q_f = font(90)
    q_lines = data["question"].split("\n")
    y_q = 280
    for line in q_lines:
        h = center_text(draw, line, q_f, y_q, (255,255,255),
                        shadow_color=(0,0,0))
        y_q += h + 20

    # Poll box (mimics Instagram poll sticker)
    poll_y = 900
    draw.rounded_rectangle([(60, poll_y), (1020, poll_y+420)],
                            radius=28,
                            fill=(30,30,40))

    # Poll label
    pl_f = font(32)
    draw.text((80, poll_y+24), heb("📊 POLL"), font=pl_f,
              fill=(180,180,180))

    # Option A
    ay = poll_y + 80
    draw.rounded_rectangle([(80, ay), (1000, ay+120)],
                            radius=20, fill=acc)
    af = font(52)
    center_text(draw, data["option_a"], af, ay+34, (255,255,255))

    # Option B
    by = ay + 145
    draw.rounded_rectangle([(80, by), (1000, by+120)],
                            radius=20, fill=(60,60,80))
    center_text(draw, data["option_b"], af, by+34, (220,220,220))

    # Tap hint
    hint_f = font(28)
    center_text(draw, "← הקש על התשובה שלך", hint_f,
                poll_y+380, (120,120,120))

    # Sub text
    sub_f = font(44)
    center_text(draw, data["sub"], sub_f, 1420, (200,200,200))

    # CTA
    cta_f = font(52)
    center_text(draw, "עקבו @okun_igal ⬇️", cta_f, 1600,
                acc, shadow_color=(0,0,0))

    draw.rectangle([(0,H-10),(W,H)], fill=acc)

    path = os.path.join(STORIES_DIR, data["filename"])
    img.save(path, "JPEG", quality=95)
    print(f"✅ Story: {data['filename']}")


if __name__ == "__main__":
    print("🎨 Building Carousel (11 slides) + 3 Story Polls...\n")
    make_cover()
    for i, p in enumerate(PROMPTS, 1):
        make_prompt_slide(p, i)
    make_final_slide()
    print()
    for poll in POLLS:
        make_story_poll(poll)
    print(f"\n✅ Carousel: {CAROUSEL_DIR}")
    print(f"✅ Stories:  {STORIES_DIR}")
