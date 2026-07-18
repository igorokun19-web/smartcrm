#!/usr/bin/env python3
"""
Create a stunning promotional video for the landing page
Short, engaging, professional design - 25 seconds
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_FILE = "promo_video_landing.mp4"
FPS = 30
DURATION_SECONDS = 25  # Short promo
WIDTH = 1280
HEIGHT = 720
TOTAL_FRAMES = int(FPS * DURATION_SECONDS)

def create_gradient_bg(width, height, color1, color2):
    """Create a gradient background"""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        blend = y / height
        color = tuple(int(c1 + (c2 - c1) * blend) for c1, c2 in zip(color1, color2))
        img[y, :] = color
    return img

def create_hero_frame(width, height, title, subtitle, button_text, color1, color2):
    """Create a hero frame with title and call-to-action"""
    # Background
    img = Image.new('RGB', (width, height), color=(50, 50, 50))
    draw = ImageDraw.Draw(img)
    
    # Gradient effect using multiple rectangles
    for y in range(height):
        blend = y / height
        r = int(color1[0] + (color2[0] - color1[0]) * blend)
        g = int(color1[1] + (color2[1] - color1[1]) * blend)
        b = int(color1[2] + (color2[2] - color1[2]) * blend)
        draw.rectangle([(0, y), (width, y+1)], fill=(b, g, r))
    
    # Fonts
    try:
        title_font = ImageFont.truetype("arial.ttf", 80)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        button_font = ImageFont.truetype("arial.ttf", 28)
    except:
        title_font = subtitle_font = button_font = ImageFont.load_default()
    
    # Title
    draw.text((width//2, height//3), title, fill=(255, 255, 255), 
              font=title_font, anchor="mm")
    
    # Subtitle
    draw.text((width//2, height//2), subtitle, fill=(200, 220, 255), 
              font=subtitle_font, anchor="mm")
    
    # Button background
    btn_width = 300
    btn_height = 60
    btn_x = (width - btn_width) // 2
    btn_y = height * 2 // 3
    draw.rectangle([btn_x, btn_y, btn_x + btn_width, btn_y + btn_height], 
                   fill=(255, 150, 0), outline=(255, 200, 50), width=3)
    
    # Button text
    draw.text((width//2, btn_y + btn_height//2), button_text, 
              fill=(255, 255, 255), font=button_font, anchor="mm")
    
    # Logo/brand text at top
    draw.text((40, 40), "MyServices CRM", fill=(255, 255, 255), 
              font=subtitle_font, anchor="lm")
    
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def create_feature_frame(width, height, icon_text, title, description, color_bg):
    """Create a feature highlight frame"""
    img = Image.new('RGB', (width, height), color=color_bg)
    draw = ImageDraw.Draw(img)
    
    try:
        icon_font = ImageFont.truetype("arial.ttf", 100)
        title_font = ImageFont.truetype("arial.ttf", 60)
        desc_font = ImageFont.truetype("arial.ttf", 36)
    except:
        icon_font = title_font = desc_font = ImageFont.load_default()
    
    # Icon
    draw.text((width//2, height//4), icon_text, fill=(255, 255, 255), 
              font=icon_font, anchor="mm")
    
    # Title
    draw.text((width//2, height//2), title, fill=(255, 255, 255), 
              font=title_font, anchor="mm")
    
    # Description
    draw.text((width//2, height*3//4), description, fill=(220, 220, 220), 
              font=desc_font, anchor="mm")
    
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def apply_fade(frame, alpha):
    """Apply fade effect"""
    black = np.zeros_like(frame)
    return cv2.addWeighted(frame, alpha, black, 1 - alpha, 0)

print("🎬 Creating Professional Landing Page Promo Video...")
print(f"Resolution: {WIDTH}x{HEIGHT} @ {FPS} FPS")
print(f"Duration: {DURATION_SECONDS} seconds")

# Initialize video writer
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_FILE, fourcc, FPS, (WIDTH, HEIGHT))

scenes = [
    {
        'type': 'hero',
        'title': 'MyServices CRM',
        'subtitle': 'ניהול לקוחות חכם וקל',
        'button': 'התחל חינם',
        'duration': 5,
        'color1': (25, 45, 120),
        'color2': (60, 100, 200)
    },
    {
        'type': 'feature',
        'icon': '📊',
        'title': 'נהל לידים',
        'description': 'עקוב אחר כל לקוח בקלות',
        'duration': 4,
        'color': (30, 70, 150)
    },
    {
        'type': 'feature',
        'icon': '💼',
        'title': 'ארגן לקוחות',
        'description': 'כל הנתונים במקום אחד',
        'duration': 4,
        'color': (40, 100, 180)
    },
    {
        'type': 'feature',
        'icon': '💬',
        'title': 'דיוור ישיר',
        'description': 'שלח הודעות WhatsApp בלחיצה',
        'duration': 4,
        'color': (50, 130, 200)
    },
    {
        'type': 'feature',
        'icon': '✅',
        'title': 'תוצאות מהירות',
        'description': 'ראה תוך שעות את השינוי',
        'duration': 4,
        'color': (60, 150, 220)
    },
    {
        'type': 'hero',
        'title': 'התחל עכשיו!',
        'subtitle': 'בחינם, ללא אישור אשראי',
        'button': 'כנס לאתר',
        'duration': 4,
        'color1': (100, 50, 150),
        'color2': (200, 100, 255)
    }
]

frame_num = 0

for scene in scenes:
    frames_for_scene = int(FPS * scene['duration'])
    
    if scene['type'] == 'hero':
        base_frame = create_hero_frame(
            WIDTH, HEIGHT,
            scene['title'],
            scene['subtitle'],
            scene['button'],
            scene['color1'],
            scene['color2']
        )
    else:
        base_frame = create_feature_frame(
            WIDTH, HEIGHT,
            scene['icon'],
            scene['title'],
            scene['description'],
            scene['color']
        )
    
    # Fade in (0.3 seconds)
    fade_frames = int(FPS * 0.3)
    for i in range(fade_frames):
        alpha = i / fade_frames
        frame = apply_fade(base_frame, alpha)
        out.write(frame)
        frame_num += 1
    
    # Main frame (hold it)
    main_frames = frames_for_scene - fade_frames * 2
    for i in range(main_frames):
        out.write(base_frame)
        frame_num += 1
    
    # Fade out (0.3 seconds)
    for i in range(fade_frames):
        alpha = 1 - (i / fade_frames)
        frame = apply_fade(base_frame, alpha)
        out.write(frame)
        frame_num += 1
    
    print(f"✅ Scene: {scene.get('title', scene.get('icon', 'unknown'))} ({scene['duration']}s)")

out.release()

# Verify output
if os.path.exists(OUTPUT_FILE):
    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    actual_duration = frame_num / FPS
    print(f"\n✅ Promo video created successfully!")
    print(f"📁 File: {OUTPUT_FILE}")
    print(f"📊 Size: {size_mb:.1f} MB")
    print(f"🎬 Frames: {frame_num}")
    print(f"⏱️  Duration: {actual_duration:.1f} seconds")
    print(f"🎨 Colors: Professional gradients + animations")
    print(f"✨ Perfect for landing page hero!")
else:
    print(f"❌ Failed to create video")
