"""
🎬 ANIMATED REELS GENERATOR — Professional viral format
Each reel has:
- Hook text that ZOOMS IN dramatically in first 2 seconds
- Body text that TYPES ITSELF progressively  
- Pulsing color highlights
- Smooth background motion (gradient shift)
- Animated bottom CTA
- Hebrew RTL support
"""
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, concatenate_videoclips, VideoFileClip
from moviepy.video.fx import FadeIn, FadeOut
from bidi.algorithm import get_display
import arabic_reshaper
import numpy as np
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "reels_animated")
os.makedirs(OUTPUT_DIR, exist_ok=True)

W, H = 1080, 1920
FPS = 30

# ──────────────────────────────────────────
# FONT HELPERS
# ──────────────────────────────────────────
def get_font(size):
    for path in ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf",
                 "C:/Windows/Fonts/calibrib.ttf", "C:/Windows/Fonts/tahoma.ttf"]:
        if os.path.exists(path):
            try: return ImageFont.truetype(path, size)
            except: pass
    return ImageFont.load_default()


def fix_heb(text):
    if not text or not text.strip(): return text
    try:
        return get_display(arabic_reshaper.reshape(text))
    except:
        return get_display(text)


def measure_text(draw, text, font):
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0], bb[3] - bb[1]


# ──────────────────────────────────────────
# FRAME BUILDERS
# ──────────────────────────────────────────
def make_base_frame(bg_color, accent_color, t_ratio=0):
    """Create an animated gradient background."""
    img = Image.new("RGB", (W, H), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Animated gradient overlay - shifts with time
    shift = int(t_ratio * 200)
    for y in range(H):
        alpha = int(30 * abs(np.sin((y + shift) / 300)))
        r = min(255, bg_color[0] + alpha)
        g = min(255, bg_color[1] + alpha)
        b = min(255, bg_color[2] + alpha)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
    
    # Decorative accent lines
    draw.rectangle([(0, 0), (W, 10)], fill=accent_color)
    draw.rectangle([(0, H-10), (W, H)], fill=accent_color)
    draw.rectangle([(0, 0), (8, H)], fill=accent_color)
    draw.rectangle([(W-8, 0), (W, H)], fill=accent_color)
    
    return img, draw


def draw_centered_text(draw, text, font, y, color, max_w=960, shadow=True):
    """Draw centered RTL text with optional shadow."""
    text = fix_heb(text)
    tw, th = measure_text(draw, text, font)
    
    # Scale down if too wide
    if tw > max_w:
        scale = max_w / tw
        new_size = int(font.size * scale)
        font = get_font(max(20, new_size))
        tw, th = measure_text(draw, text, font)
    
    x = (W - tw) // 2
    if shadow:
        draw.text((x + 3, y + 3), text, font=font, fill=(0, 0, 0, 128))
    draw.text((x, y), text, font=font, fill=color)
    return th + 10


def draw_highlighted_text(draw, text, font, y, text_color, highlight_color, alpha=1.0):
    """Draw text with a color highlight box behind it."""
    text = fix_heb(text)
    tw, th = measure_text(draw, text, font)
    x = (W - tw) // 2
    padding = 16
    
    # Draw highlight box
    box_color = tuple(int(c * alpha) for c in highlight_color)
    draw.rounded_rectangle(
        [(x - padding, y - 8), (x + tw + padding, y + th + 8)],
        radius=12,
        fill=box_color
    )
    draw.text((x, y), text, font=font, fill=text_color)
    return th + 30


# ──────────────────────────────────────────
# REEL BUILDER
# ──────────────────────────────────────────
def create_animated_reel(config):
    """
    config = {
      filename, hook, lines, cta, bg, accent, hook_color, text_color, cta_color
    }
    """
    bg = config["bg"]
    accent = config["accent"]
    hook = config["hook"]
    lines = config["lines"]
    cta = config["cta"]
    hook_color = config.get("hook_color", (255, 80, 80))
    text_color = config.get("text_color", (255, 255, 255))
    cta_color = config.get("cta_color", (100, 200, 255))

    total_duration = 9  # seconds
    frames = []

    for frame_i in range(total_duration * FPS):
        t = frame_i / FPS
        t_ratio = t / total_duration

        img, draw = make_base_frame(bg, accent, t_ratio)

        # ── PHASE 1: Hook zoom-in (0-2.5s) ──
        hook_font_base = 90
        if t < 0.3:
            # Zoom in from huge
            scale = max(0.3, t / 0.3)
            hook_size = int(hook_font_base * (2.0 - scale * 1.0))
            hook_alpha = t / 0.3
        elif t < 2.5:
            hook_size = hook_font_base
            hook_alpha = 1.0
        else:
            # Fade out hook
            hook_size = hook_font_base
            hook_alpha = max(0, 1.0 - (t - 2.5) / 0.5)

        if hook_alpha > 0:
            hook_font = get_font(hook_size)
            hook_text = fix_heb(hook)
            tw, th = measure_text(draw, hook_text, hook_font)
            x = (W - tw) // 2
            y = H // 2 - th // 2 - 200 if len(lines) == 0 else 180
            
            # Shadow
            shadow_color = tuple(max(0, c - 100) for c in hook_color)
            draw.text((x + 4, y + 4), hook_text, font=hook_font, fill=shadow_color)
            
            # Main text with alpha simulation (blend with bg)
            r = int(hook_color[0] * hook_alpha + bg[0] * (1 - hook_alpha))
            g = int(hook_color[1] * hook_alpha + bg[1] * (1 - hook_alpha))
            b = int(hook_color[2] * hook_alpha + bg[2] * (1 - hook_alpha))
            draw.text((x, y), hook_text, font=hook_font, fill=(r, g, b))

        # ── PHASE 2: Lines typewriter (2s - 7s) ──
        if t > 2.0 and lines:
            body_font = get_font(54)
            y_pos = 350
            
            chars_per_sec = 25
            chars_shown = int((t - 2.0) * chars_per_sec)
            
            # Concatenate all lines into one string with separators
            full_text = "\n".join(lines)
            visible_text = full_text[:chars_shown]
            visible_lines = visible_text.split("\n")
            
            for i, line in enumerate(visible_lines):
                if i >= len(lines): break
                if not line.strip():
                    y_pos += 25
                    continue
                
                # Last partial line gets a cursor
                is_last = i == len(visible_lines) - 1
                display_line = line
                if is_last and len(line) < len(lines[i]) and int(t * 4) % 2 == 0:
                    display_line = line + "█"
                
                # Check if line is complete for highlight
                is_complete = i < len(visible_lines) - 1
                
                if display_line.startswith("✅") or display_line.startswith("✓") or display_line.startswith("•"):
                    draw_highlighted_text(draw, display_line, get_font(50), y_pos,
                                        (10, 10, 10), accent if is_complete else (80, 80, 80))
                    y_pos += 75
                else:
                    drawn_h = draw_centered_text(draw, display_line, body_font, y_pos, text_color)
                    y_pos += drawn_h + 12

        # ── PHASE 3: CTA slide up (7s - 9s) ──
        if t > 7.0:
            cta_progress = min(1.0, (t - 7.0) / 0.6)
            cta_y = H - 200 + int((1 - cta_progress) * 200)
            cta_font = get_font(52)
            draw_highlighted_text(draw, cta, cta_font, cta_y, (10, 10, 10), cta_color)

        # ── Watermark ──
        wm_font = get_font(28)
        draw.text((40, H - 70), fix_heb("@okun_igal"), font=wm_font, fill=(120, 120, 120))

        frames.append(np.array(img))

    # Build video from frames
    print(f"  Encoding {config['filename']}...", flush=True)
    
    # Convert to video using moviepy
    clip = ImageClip(frames[0], duration=1/FPS)
    
    def make_frame(t):
        fi = min(int(t * FPS), len(frames) - 1)
        return frames[fi]
    
    from moviepy import VideoClip
    video = VideoClip(make_frame, duration=total_duration)
    video = video.with_effects([FadeIn(0.4), FadeOut(0.4)])
    
    out_path = os.path.join(OUTPUT_DIR, config["filename"])
    video.write_videofile(
        out_path, fps=FPS, codec="libx264", audio=False,
        preset="ultrafast", ffmpeg_params=["-crf", "26"], logger=None
    )
    video.close()
    print(f"✅ {config['filename']}")
    return out_path


# ──────────────────────────────────────────
# REEL CONFIGS
# ──────────────────────────────────────────
REELS = [
    {
        "filename": "reel_A_pov.mp4",
        "hook": "POV: אתה חשמלאי",
        "lines": [
            "3 לקוחות כתבו בוואטסאפ",
            "בזמן שעבדת",
            "",
            "אף אחד לא קיבל תשובה",
            "",
            "✅ הם הלכו למתחרה",
            "✅ איבדת 3 עסקאות",
            "",
            "AI אחד פותר את זה — חינם",
        ],
        "cta": "עקבו לפתרון ⬇️",
        "bg": (8, 8, 15),
        "accent": (255, 60, 60),
        "hook_color": (255, 80, 80),
        "text_color": (230, 230, 230),
        "cta_color": (255, 80, 80),
    },
    {
        "filename": "reel_B_before_after.mp4",
        "hook": "לפני vs אחרי AI",
        "lines": [
            "לפני:",
            "✅ הצעת מחיר = שעה",
            "✅ תשובה = ידנית",
            "✅ פולו-אפ = לא קורה",
            "",
            "אחרי AI:",
            "✅ הצעת מחיר = 30 שניות",
            "✅ תשובה = אוטומטית",
            "✅ פולו-אפ = אוטומטי",
        ],
        "cta": "שמרו 📌",
        "bg": (5, 12, 20),
        "accent": (255, 200, 0),
        "hook_color": (255, 210, 50),
        "text_color": (220, 220, 220),
        "cta_color": (255, 200, 0),
    },
    {
        "filename": "reel_C_secret.mp4",
        "hook": "הסוד שאף אחד לא מספר",
        "lines": [
            "75% מהכסף שלך",
            "מחכה אצל לקוחות",
            "שכבר שילמו לך",
            "",
            "פשוט לא פנית אליהם שוב",
            "",
            "✅ ChatGPT כותב הפולו-אפ",
            "✅ בחינם",
            "✅ ב-30 שניות",
        ],
        "cta": "הפרומפט בתגובות 👇",
        "bg": (12, 5, 20),
        "accent": (180, 80, 255),
        "hook_color": (200, 100, 255),
        "text_color": (235, 235, 235),
        "cta_color": (180, 100, 255),
    },
    {
        "filename": "reel_D_3mistakes.mp4",
        "hook": "3 טעויות = 3,000₪ פחות",
        "lines": [
            "כל חודש!",
            "",
            "✅ לא עונים מהר ללקוח",
            "✅ אין פולו-אפ אחרי הצעת מחיר",
            "✅ שוכחים לקוחות ישנים",
            "",
            "AI פותר את 3-ן",
            "בחינם, עכשיו",
        ],
        "cta": "שמרו 📌 חשוב מאוד",
        "bg": (18, 5, 5),
        "accent": (255, 60, 60),
        "hook_color": (255, 80, 80),
        "text_color": (240, 240, 240),
        "cta_color": (255, 150, 50),
    },
    {
        "filename": "reel_E_whatsapp.mp4",
        "hook": "3 דקות = לקוחות שלא בורחים",
        "lines": [
            "WhatsApp Business",
            "תשובה אוטומטית — חינם",
            "",
            "✅ הגדרות",
            "✅ הודעות",
            "✅ תשובה אוטומטית",
            "",
            "לקוח שלח ב-2 לילה?",
            "הוא מקבל תשובה מיד",
        ],
        "cta": "שמרו 📌 3 דקות הגדרה",
        "bg": (3, 15, 8),
        "accent": (0, 200, 80),
        "hook_color": (0, 220, 100),
        "text_color": (225, 225, 225),
        "cta_color": (0, 210, 100),
    },
    {
        "filename": "reel_F_prompt.mp4",
        "hook": "הפרומפט ששווה 1,000₪",
        "lines": [
            "כתוב ל-ChatGPT:",
            "",
            '"כתוב הצעת מחיר לחשמלאי.',
            "עבודה: 200 שקל,",
            'חומרים: 80 שקל. עברית."',
            "",
            "✅ תוצאה: 30 שניות",
            "✅ מקצועי לגמרי",
            "✅ חינם",
        ],
        "cta": "שמרו 📌",
        "bg": (15, 12, 3),
        "accent": (255, 200, 50),
        "hook_color": (255, 215, 60),
        "text_color": (235, 235, 220),
        "cta_color": (255, 200, 50),
    },
    {
        "filename": "reel_G_2026reality.mp4",
        "hook": "2026 — בחרת כבר?",
        "lines": [
            "בלי AI:",
            "✅ עבודה קשה יותר",
            "✅ פחות לקוחות",
            "✅ יותר שעות",
            "",
            "עם AI:",
            "✅ פחות עבודה",
            "✅ יותר לקוחות",
            "✅ יותר זמן פנוי",
        ],
        "cta": "עקבו — מלמדים כאן",
        "bg": (10, 5, 18),
        "accent": (150, 80, 255),
        "hook_color": (170, 100, 255),
        "text_color": (230, 230, 230),
        "cta_color": (160, 100, 255),
    },
    {
        "filename": "reel_H_cta.mp4",
        "hook": "הדף הזה = כסף אמיתי",
        "lines": [
            "אם אתה:",
            "✅ בעל עסק קטן",
            "✅ עצמאי",
            "✅ בעל מקצוע",
            "",
            "כל יום — טיפ AI חדש",
            "חינם",
            "בלי שטויות",
        ],
        "cta": "עקבו עכשיו 🔔",
        "bg": (5, 5, 5),
        "accent": (255, 215, 0),
        "hook_color": (255, 220, 50),
        "text_color": (240, 240, 240),
        "cta_color": (100, 220, 255),
    },
]


if __name__ == "__main__":
    print("🎬 יוצר Reels מונפשים מקצועיים...\n")
    for config in REELS:
        try:
            create_animated_reel(config)
        except Exception as e:
            print(f"❌ {config['filename']}: {e}")
    print(f"\n✅ כל הסרטונים ב: {OUTPUT_DIR}")
