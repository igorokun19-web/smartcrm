#!/usr/bin/env python3
"""
Create Hebrew Demo Video - Simple Approach
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_FILE = "demo_video_hebrew.mp4"
FPS = 30
DURATION_SECONDS = 135
WIDTH = 1280
HEIGHT = 720
TOTAL_FRAMES = int(FPS * DURATION_SECONDS)

# Hebrew texts for each scene
scenes = [
    {
        'title': 'MyServices CRM',
        'subtitle': 'ניהול לקוחות חכם וקל',
        'body': 'פתרון הניהול המודרני שלך',
        'duration': 15,
        'color': (30, 58, 138)  # Dark blue
    },
    {
        'title': 'שלב 1: הוסף לידים חדשים',
        'subtitle': 'בחר "לידים חדשים" מהתפריט',
        'body': 'מלא את פרטי הלקוח בקלות',
        'duration': 18,
        'color': (37, 99, 235)  # Blue
    },
    {
        'title': 'שלב 2: עקוב בזמן אמת',
        'subtitle': 'ראה את מצב כל לקוח',
        'body': 'מעקב אוטומטי לכל פעולה',
        'duration': 18,
        'color': (59, 130, 246)  # Light blue
    },
    {
        'title': 'שלב 3: שלח הודעות WhatsApp',
        'subtitle': 'דיוור ישיר ללקוח בלחיצה אחת',
        'body': 'חיבור ישיר לשירות ה-WhatsApp',
        'duration': 18,
        'color': (6, 182, 212)  # Cyan
    },
    {
        'title': 'שלב 4: ניהול חשבוניות',
        'subtitle': 'יצור וטרם שלח חשבוניות',
        'body': 'עקוב אחר תשלומים אוטומטיים',
        'duration': 18,
        'color': (16, 185, 129)  # Green
    },
    {
        'title': 'שלב 5: דוחות ותאנליטיקס',
        'subtitle': 'בחר מדדים חשובים לעסק',
        'body': 'יותר תובנות, פחות זמן במשרדיות',
        'duration': 15,
        'color': (245, 158, 11)  # Amber
    },
    {
        'title': 'שלב 6: נתונים מאובטחים',
        'subtitle': 'הצפנה וגיבוי אוטומטי',
        'body': 'כל הנתונים שלך מוגנים בשרת',
        'duration': 15,
        'color': (220, 38, 38)  # Red
    },
    {
        'title': 'שלב 7: תמיכה בעברית וערבית',
        'subtitle': 'ממשק מלא בשפות RTL',
        'body': 'עיצוב מקומי מעודכן',
        'duration': 12,
        'color': (139, 92, 246)  # Purple
    },
    {
        'title': 'התחל עכשיו!',
        'subtitle': 'MyServices CRM - לכל עסק',
        'body': 'גשת חינם ללא תשלום ראשוני',
        'duration': 14,
        'color': (99, 102, 241)  # Indigo
    }
]

def create_frame_with_text(width, height, bg_color, title, subtitle, body, scene_num):
    """Create frame with Hebrew text"""
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to load font
    try:
        title_font = ImageFont.truetype("arial.ttf", 72)
        subtitle_font = ImageFont.truetype("arial.ttf", 48)
        body_font = ImageFont.truetype("arial.ttf", 36)
        scene_font = ImageFont.truetype("arial.ttf", 32)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        scene_font = ImageFont.load_default()
    
    # Scene number (top right)
    scene_text = f"שלב {scene_num}"
    draw.text((width - 40, 30), scene_text, fill=(255, 215, 0), font=scene_font)
    
    # Title (centered, RTL)
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    draw.text((width - 40, 150), title, fill=(255, 255, 255), font=title_font)
    
    # Subtitle
    draw.text((width - 40, 280), subtitle, fill=(224, 224, 224), font=subtitle_font)
    
    # Body
    draw.text((width - 40, 420), body, fill=(255, 255, 255), font=body_font)
    
    # Convert to numpy array
    frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    return frame

def create_fade_frame(frame1, frame2, alpha):
    """Create fade transition between two frames"""
    return cv2.addWeighted(frame1, alpha, frame2, 1 - alpha, 0)

print("🎬 Creating Hebrew Demo Video...")
print(f"Resolution: {WIDTH}x{HEIGHT} @ {FPS} FPS")
print(f"Duration: {DURATION_SECONDS} seconds")

# Initialize video writer
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_FILE, fourcc, FPS, (WIDTH, HEIGHT))

frame_count = 0
scene_num = 1

for scene in scenes:
    frames_for_scene = int(FPS * scene['duration'])
    
    # Create frame for this scene
    scene_frame = create_frame_with_text(
        WIDTH, HEIGHT,
        scene['color'],
        scene['title'],
        scene['subtitle'],
        scene['body'],
        scene_num
    )
    
    # Fade in
    fade_in_frames = int(FPS * 0.5)
    black_frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    
    for i in range(fade_in_frames):
        alpha = i / fade_in_frames
        frame = cv2.addWeighted(scene_frame, alpha, black_frame, 1 - alpha, 0)
        out.write(frame)
        frame_count += 1
    
    # Main scene
    main_frames = frames_for_scene - fade_in_frames - fade_in_frames
    for i in range(main_frames):
        out.write(scene_frame)
        frame_count += 1
    
    # Fade out
    for i in range(fade_in_frames):
        alpha = 1 - (i / fade_in_frames)
        frame = cv2.addWeighted(scene_frame, alpha, black_frame, 1 - alpha, 0)
        out.write(frame)
        frame_count += 1
    
    scene_num += 1
    print(f"✅ Scene {scene_num - 1}: {scene['title'][:30]}... ({scene['duration']}s)")

out.release()

# Verify output
if os.path.exists(OUTPUT_FILE):
    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    duration_sec = frame_count / FPS
    print(f"\n✅ Hebrew video created successfully!")
    print(f"📁 File: {OUTPUT_FILE}")
    print(f"📊 Size: {size_mb:.1f} MB")
    print(f"🎬 Frames: {frame_count}")
    print(f"⏱️ Duration: {duration_sec:.1f} seconds")
else:
    print(f"❌ Failed to create video")
