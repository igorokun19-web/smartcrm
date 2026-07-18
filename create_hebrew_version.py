#!/usr/bin/env python3
"""
Create Hebrew version of demo video with Hebrew text overlays
Creates: demo_video_hebrew.mp4
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import sys

# Configuration
OUTPUT_FILE = "demo_video_hebrew.mp4"
FPS = 30
DURATION_SECONDS = 135  # Same as English
WIDTH = 1280
HEIGHT = 720

def create_frame_with_hebrew_text(width, height, bg_color, title="", subtitle="", body_text="", step_number=0):
    """Create a frame with Hebrew text content"""
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to load Hebrew-friendly fonts
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        body_font = ImageFont.truetype("arial.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
    
    y_offset = 100
    
    # Draw step number (RTL-aware)
    if step_number > 0:
        step_text = f"שלב {step_number}"
        draw.text((50, 30), step_text, fill=(100, 150, 255), font=subtitle_font)
    
    # Draw title (Hebrew right-aligned)
    if title:
        draw.text((width - 50, y_offset), title, fill=(255, 255, 255), font=title_font, anchor="rt")
        y_offset += 100
    
    # Draw subtitle (Hebrew right-aligned)
    if subtitle:
        draw.text((width - 50, y_offset), subtitle, fill=(200, 200, 200), font=subtitle_font, anchor="rt")
        y_offset += 80
    
    # Draw body text (Hebrew right-aligned)
    if body_text:
        for line in body_text.split('\n'):
            draw.text((width - 50, y_offset), line, fill=(220, 220, 220), font=body_font, anchor="rt")
            y_offset += 60
    
    return np.array(img)

def create_hebrew_demo_video():
    """Create the Hebrew demo video"""
    print("🎬 Creating MyServices CRM Hebrew Demo Video...")
    print(f"   Resolution: {WIDTH}x{HEIGHT} @ {FPS} FPS")
    print(f"   Duration: {DURATION_SECONDS} seconds")
    
    # Define video codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT_FILE, fourcc, FPS, (WIDTH, HEIGHT))
    
    frames_needed = FPS * DURATION_SECONDS
    frame_count = 0
    
    # Define scenes in Hebrew
    scenes = [
        {
            "duration": 10,
            "bg": (20, 40, 80),
            "title": "MyServices CRM",
            "subtitle": "ניהול לידים חכם לעסקי שירותים",
            "body": "מקצועי. חזק. פשוט.",
            "step": 0
        },
        {
            "duration": 15,
            "bg": (25, 50, 100),
            "title": "הבעיה שלנו פותרים",
            "subtitle": "לידים פזורים בכל מקום?",
            "body": "❌ דוא״ל, WhatsApp, הערות\n❌ לידים שנשכחים\n❌ כסף איבוד",
            "step": 1
        },
        {
            "duration": 15,
            "bg": (30, 60, 120),
            "title": "הפתרון שלנו",
            "subtitle": "דשבורד אחד לכל דבר",
            "body": "✅ כל הלידים במקום אחד\n✅ תזכורות אוטומטיות\n✅ עקוב אחרי מה שחשוב",
            "step": 2
        },
        {
            "duration": 20,
            "bg": (35, 70, 140),
            "title": "תכונה #1",
            "subtitle": "ניהול לידים חכם",
            "body": "• ניקוד לידים אוטומטי (0-100)\n• עקוב אחרי סטטוס\n• שדות מותאמים",
            "step": 3
        },
        {
            "duration": 20,
            "bg": (40, 80, 160),
            "title": "תכונה #2",
            "subtitle": "Kanban Pipeline למכירות",
            "body": "• ראה את המכירות בעין\n• גרור לידים בין שלבים\n• שיעורי המרה",
            "step": 4
        },
        {
            "duration": 20,
            "bg": (45, 90, 180),
            "title": "תכונה #3",
            "subtitle": "משימות ותזכורות",
            "body": "• אף פעם לא תשכח follow-up\n• יצירת משימות אוטומטית\n• תזכורות יומיות",
            "step": 5
        },
        {
            "duration": 15,
            "bg": (50, 100, 200),
            "title": "תכונה #4",
            "subtitle": "ניהול חשבוניות",
            "body": "• יצירת חשבוניות בשניות\n• עקוב אחרי תשלומים\n• תזכורות אוטומטיות",
            "step": 6
        },
        {
            "duration": 10,
            "bg": (30, 70, 150),
            "title": "התוצאה",
            "subtitle": "3-4x יותר עסקאות סגורות",
            "body": "עם 50% פחות סטרס",
            "step": 7
        },
        {
            "duration": 10,
            "bg": (20, 50, 120),
            "title": "מוכן להתחיל?",
            "subtitle": "חינם 30 ימים ראשונים",
            "body": "https://smartcrm-3cle.onrender.com",
            "step": 0
        },
    ]
    
    # Render each scene
    for scene in scenes:
        duration = scene["duration"]
        frames_for_scene = int(FPS * duration)
        
        # Create frame
        frame = create_frame_with_hebrew_text(
            WIDTH, HEIGHT,
            bg_color=scene["bg"],
            title=scene["title"],
            subtitle=scene["subtitle"],
            body_text=scene["body"],
            step_number=scene["step"]
        )
        
        # Convert BGR for OpenCV
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Add animation effect (fade in/out)
        for i in range(frames_for_scene):
            alpha = min(1.0, i / 10)  # Fade in for first 10 frames
            alpha = min(alpha, 1.0 - max(0, (i - frames_for_scene + 10)) / 10)  # Fade out
            
            animated_frame = (frame_bgr * alpha).astype(np.uint8)
            
            # Add border
            bordered = cv2.copyMakeBorder(
                animated_frame, 10, 10, 10, 10,
                cv2.BORDER_CONSTANT, value=(0, 0, 0)
            )
            
            if bordered.shape[:2] != (HEIGHT, WIDTH):
                bordered = cv2.resize(bordered, (WIDTH, HEIGHT))
            
            out.write(bordered)
            frame_count += 1
            
            # Progress indicator
            progress = (frame_count / frames_needed) * 100
            print(f"   Progress: {progress:.1f}% ({frame_count}/{frames_needed} frames)", end='\r')
    
    # Release video writer
    out.release()
    print(f"\n✅ Video created successfully!")
    print(f"   📁 File: {OUTPUT_FILE}")
    print(f"   🎬 Total frames: {frame_count}")
    print(f"   ⏱️  Duration: ~{frame_count/FPS:.1f} seconds")
    
    # Verify file exists
    if os.path.exists(OUTPUT_FILE):
        file_size = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)  # MB
        print(f"   📊 File size: {file_size:.1f} MB")
        print(f"\n🎉 Ready to upload to YouTube!")
        print(f"   Location: {os.path.abspath(OUTPUT_FILE)}")
    else:
        print(f"⚠️  Warning: File may not have been created")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("MyServices CRM - Hebrew Demo Video Generator")
    print("="*60)
    print(f"\nThis script will create a 2-minute Hebrew demo video.")
    print(f"Output: {OUTPUT_FILE}\n")
    
    # Check dependencies
    try:
        import cv2
        import numpy as np
        from PIL import Image, ImageDraw, ImageFont
        print("✅ All dependencies available")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("\nInstall with:")
        print("   pip install opencv-python numpy pillow")
        sys.exit(1)
    
    print("\nStarting video generation...\n")
    create_hebrew_demo_video()
