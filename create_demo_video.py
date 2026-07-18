#!/usr/bin/env python3
"""
MyServices CRM Demo Video Generator
Creates an automated walkthrough video of the CRM features
Output: demo_video.mp4 (in the same folder)
"""

import cv2
import numpy as np
import time
from PIL import Image, ImageDraw, ImageFont
import os
import subprocess

# Configuration
OUTPUT_FILE = "demo_video.mp4"
FPS = 30
DURATION_SECONDS = 120  # 2 minute demo
WIDTH = 1280
HEIGHT = 720

def create_frame_with_text(width, height, bg_color, title="", subtitle="", body_text="", step_number=0):
    """Create a frame with text content"""
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        title_font = ImageFont.truetype("arial.ttf", 60)
        subtitle_font = ImageFont.truetype("arial.ttf", 40)
        body_font = ImageFont.truetype("arial.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
    
    y_offset = 100
    
    # Draw step number
    if step_number > 0:
        step_text = f"Step {step_number}"
        draw.text((50, 30), step_text, fill=(100, 150, 255), font=subtitle_font)
    
    # Draw title
    if title:
        draw.text((50, y_offset), title, fill=(255, 255, 255), font=title_font)
        y_offset += 100
    
    # Draw subtitle
    if subtitle:
        draw.text((50, y_offset), subtitle, fill=(200, 200, 200), font=subtitle_font)
        y_offset += 80
    
    # Draw body text
    if body_text:
        for line in body_text.split('\n'):
            draw.text((50, y_offset), line, fill=(220, 220, 220), font=body_font)
            y_offset += 60
    
    return np.array(img)

def create_demo_video():
    """Create the demo video"""
    print("🎬 Creating MyServices CRM Demo Video...")
    print(f"   Resolution: {WIDTH}x{HEIGHT} @ {FPS} FPS")
    print(f"   Duration: {DURATION_SECONDS} seconds")
    
    # Define video codec
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT_FILE, fourcc, FPS, (WIDTH, HEIGHT))
    
    frames_needed = FPS * DURATION_SECONDS
    frame_count = 0
    
    # Define scenes
    scenes = [
        {
            "duration": 10,
            "bg": (20, 40, 80),
            "title": "MyServices CRM",
            "subtitle": "Lead Management for Service Businesses",
            "body": "Professional. Powerful. Simple.",
            "step": 0
        },
        {
            "duration": 15,
            "bg": (25, 50, 100),
            "title": "Problem We Solve",
            "subtitle": "Leads scattered everywhere?",
            "body": "❌ Emails, WhatsApp, Notes\n❌ Missing follow-ups\n❌ Lost revenue",
            "step": 1
        },
        {
            "duration": 15,
            "bg": (30, 60, 120),
            "title": "Solution",
            "subtitle": "One Dashboard for Everything",
            "body": "✅ All leads in one place\n✅ Auto reminders\n✅ Track what matters",
            "step": 2
        },
        {
            "duration": 20,
            "bg": (35, 70, 140),
            "title": "Feature #1",
            "subtitle": "Smart Lead Management",
            "body": "• Automatic lead scoring (0-100)\n• Lead status tracking\n• Custom fields",
            "step": 3
        },
        {
            "duration": 20,
            "bg": (40, 80, 160),
            "title": "Feature #2",
            "subtitle": "Sales Pipeline Kanban",
            "body": "• Visualize your sales\n• Drag-drop leads between stages\n• See conversion rates",
            "step": 4
        },
        {
            "duration": 20,
            "bg": (45, 90, 180),
            "title": "Feature #3",
            "subtitle": "Task & Follow-up Reminders",
            "body": "• Never miss a follow-up\n• Automatic task creation\n• Daily reminders",
            "step": 5
        },
        {
            "duration": 15,
            "bg": (50, 100, 200),
            "title": "Feature #4",
            "subtitle": "Invoice Management",
            "body": "• Create invoices in seconds\n• Track payment status\n• Automated reminders",
            "step": 6
        },
        {
            "duration": 10,
            "bg": (30, 70, 150),
            "title": "Result",
            "subtitle": "3-4x More Deals Closed",
            "body": "With 50% less stress",
            "step": 7
        },
        {
            "duration": 10,
            "bg": (20, 50, 120),
            "title": "Ready to Start?",
            "subtitle": "Free for First 30 Days",
            "body": "https://smartcrm-3cle.onrender.com",
            "step": 0
        },
    ]
    
    # Render each scene
    for scene in scenes:
        duration = scene["duration"]
        frames_for_scene = int(FPS * duration)
        
        # Create frame
        frame = create_frame_with_text(
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
    print("MyServices CRM - Demo Video Generator")
    print("="*60)
    print(f"\nThis script will create a 2-minute demo video.")
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
        exit(1)
    
    print("\nStarting video generation...\n")
    create_demo_video()
