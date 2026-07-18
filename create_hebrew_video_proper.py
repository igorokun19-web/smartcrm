#!/usr/bin/env python3
"""
Create Hebrew version of demo video with proper Hebrew text
Uses matplotlib for better Unicode/Hebrew support
"""

import cv2
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
from matplotlib import rcParams
import io
from PIL import Image
import os

# Configure matplotlib for Hebrew
matplotlib.use('Agg')
rcParams['font.sans-serif'] = ['Arial', 'Tahoma', 'Calibri']

OUTPUT_FILE = "demo_video_hebrew.mp4"
FPS = 30
DURATION_SECONDS = 135
WIDTH = 1280
HEIGHT = 720
TOTAL_FRAMES = int(FPS * DURATION_SECONDS)

def create_hebrew_frame(title, subtitle, body, scene_num, color_bg):
    """Create a frame with Hebrew text using matplotlib"""
    fig, ax = plt.subplots(figsize=(WIDTH/100, HEIGHT/100), dpi=100)
    fig.patch.set_facecolor(color_bg)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    # Title (RTL)
    ax.text(0.5, 8.5, title, fontsize=48, weight='bold', color='white',
            ha='right', va='top', family='sans-serif', wrap=True)
    
    # Subtitle (RTL)
    if subtitle:
        ax.text(0.5, 7.2, subtitle, fontsize=32, color='#E0E0E0',
                ha='right', va='top', family='sans-serif')
    
    # Body text (RTL)
    if body:
        ax.text(0.5, 5.5, body, fontsize=24, color='white',
                ha='right', va='top', family='sans-serif', wrap=True)
    
    # Scene number
    ax.text(9.5, 9.5, f"שלב {scene_num}", fontsize=20, color='#FFD700',
            ha='right', va='top', family='sans-serif')
    
    plt.tight_layout(pad=0)
    
    # Convert to image
    buf = io.BytesIO()
    plt.savefig(buf, format='png', facecolor=color_bg, bbox_inches='tight', pad_inches=0)
    buf.seek(0)
    
    img = Image.open(buf)
    img = img.resize((WIDTH, HEIGHT))
    frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    
    plt.close(fig)
    buf.close()
    
    return frame

def add_fade_effect(frame, alpha):
    """Add fade effect to frame"""
    overlay = np.ones_like(frame) * 0
    return cv2.addWeighted(frame, alpha, overlay, 1 - alpha, 0)

print("🎬 Creating Hebrew Demo Video...")
print(f"Resolution: {WIDTH}x{HEIGHT} @ {FPS} FPS")
print(f"Duration: {DURATION_SECONDS} seconds ({TOTAL_FRAMES} frames)")

# Initialize video writer
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_FILE, fourcc, FPS, (WIDTH, HEIGHT))

scenes = [
    {
        'title': 'MyServices CRM',
        'subtitle': 'ניהול לקוחות חכם וקל',
        'body': 'פתרון הניהול המודרני שלך',
        'duration': 15,
        'color': '#1E3A8A'
    },
    {
        'title': 'שלב 1: הוסף לידים חדשים',
        'subtitle': 'בחר "לידים חדשים" מהתפריט',
        'body': 'מלא את פרטי הלקוח והמון זיהוי כלפי חוזה',
        'duration': 18,
        'color': '#2563EB'
    },
    {
        'title': 'שלב 2: עקוב בזמן אמת',
        'subtitle': 'ראה את מצב כל לקוח',
        'body': 'מעקב אוטומטי לכל פעולה וקשר',
        'duration': 18,
        'color': '#3B82F6'
    },
    {
        'title': 'שלב 3: שלח הודעות WhatsApp',
        'subtitle': 'דיוור ישיר ללקוח',
        'body': 'אנא ההודעה בלחיצה אחת מספריטו',
        'duration': 18,
        'color': '#06B6D4'
    },
    {
        'title': 'שלב 4: ניהול חשבוניות',
        'subtitle': 'יצור וטרם שלח חשבוניות',
        'body': 'עקוב אחר תשלומים וזכרונות אוטומטיים',
        'duration': 18,
        'color': '#10B981'
    },
    {
        'title': 'שלב 5: דוחות ותאנליטיקס',
        'subtitle': 'בחר מדדים חשובים לעסק',
        'body': 'פחות זמן במשרדיות, יותר זמן במכירות',
        'duration': 15,
        'color': '#F59E0B'
    },
    {
        'title': 'שלב 6: נתונים מאובטחים',
        'subtitle': 'הצפנה וגיבוי אוטומטי',
        'body': 'כל הנתונים שלך מוגנים בשרת מאובטח',
        'duration': 15,
        'color': '#DC2626'
    },
    {
        'title': 'שלב 7: תמיכה בעברית וערבית',
        'subtitle': 'ממשק מלא בשפות RTL',
        'body': 'עיצוב מקומי מעודכן וחדש',
        'duration': 12,
        'color': '#8B5CF6'
    },
    {
        'title': 'התחל עכשיו!',
        'subtitle': 'MyServices CRM - לכל עסק',
        'body': 'זלוג אל האתר וקבל גישה חינם',
        'duration': 14,
        'color': '#6366F1'
    }
]

frame_num = 0
scene_num = 1

for scene in scenes:
    frames_for_scene = int(FPS * scene['duration'])
    color_rgb = scene['color']
    
    # Convert hex to BGR
    color_hex = color_rgb.lstrip('#')
    color_bgr = tuple(int(color_hex[i:i+2], 16) for i in (4, 2, 0))
    
    for frame_idx in range(frames_for_scene):
        # Calculate fade effect
        fade_in_frames = int(FPS * 0.5)
        fade_out_frames = int(FPS * 0.5)
        
        if frame_idx < fade_in_frames:
            alpha = frame_idx / fade_in_frames
        elif frame_idx > frames_for_scene - fade_out_frames:
            alpha = 1 - (frame_idx - (frames_for_scene - fade_out_frames)) / fade_out_frames
        else:
            alpha = 1.0
        
        # Create base frame with proper color
        frame = np.ones((HEIGHT, WIDTH, 3), dtype=np.uint8)
        frame[:, :] = color_bgr
        
        # Create text frame
        text_frame = create_hebrew_frame(
            scene['title'],
            scene['subtitle'],
            scene['body'],
            scene_num,
            color_rgb
        )
        
        # Apply fade
        frame = cv2.addWeighted(text_frame, alpha, frame, 1 - alpha, 0)
        
        out.write(frame)
        frame_num += 1
    
    scene_num += 1
    print(f"✅ Scene {scene_num - 1}: {scene['title']} ({scene['duration']}s)")

out.release()

# Verify output
if os.path.exists(OUTPUT_FILE):
    size_mb = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"\n✅ Video created successfully!")
    print(f"📁 File: {OUTPUT_FILE}")
    print(f"📊 Size: {size_mb:.1f} MB")
    print(f"🎬 Frames: {frame_num}")
    print(f"⏱️ Duration: {frame_num / FPS:.1f} seconds")
else:
    print(f"❌ Failed to create video")
