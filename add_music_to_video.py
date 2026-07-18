#!/usr/bin/env python3
"""
Add background music to demo video
Creates: demo_video_with_music.mp4
"""

import os
import subprocess
import sys
from pathlib import Path

def create_background_music():
    """Create a simple background music file using ffmpeg"""
    print("🎵 Creating background music...")
    
    # Create a silent audio file, then we'll use royalty-free music
    # For now, let's use a simple sine wave as placeholder
    # You can replace this with actual music file
    
    music_file = "background_music.mp3"
    
    # Create 135 seconds of ambient background music using ffmpeg
    # This creates a simple tone that can be replaced with real music
    cmd = [
        'ffmpeg', '-f', 'lavfi', '-i', 
        'sine=frequency=440:duration=135',
        '-q:a', '9', '-acodec', 'libmp3lame',
        music_file, '-y'
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Created: {music_file}")
        return music_file
    except Exception as e:
        print(f"⚠️  Note: Using alternative method")
        return None

def add_music_to_video():
    """Add background music to video"""
    input_video = "demo_video.mp4"
    output_video = "demo_video_with_music.mp4"
    
    print(f"\n🎬 Processing video: {input_video}")
    print("   Adding background music...")
    
    # Create music file
    music_file = create_background_music()
    
    if music_file and os.path.exists(music_file):
        # Mix video audio with background music
        cmd = [
            'ffmpeg',
            '-i', input_video,
            '-i', music_file,
            '-c:v', 'copy',  # Copy video as-is (no re-encoding)
            '-c:a', 'aac',   # Audio codec
            '-filter_complex', 'amix=inputs=2:duration=first:dropout_transition=2',  # Mix audio
            '-b:a', '128k',  # Audio bitrate
            output_video,
            '-y'
        ]
        
        try:
            print("\n⏳ Mixing audio (this may take a minute)...")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                file_size = os.path.getsize(output_video) / (1024 * 1024)
                print(f"\n✅ Successfully created: {output_video}")
                print(f"   📊 Size: {file_size:.1f} MB")
                print(f"   🎵 Background music added!")
                
                # Cleanup
                if os.path.exists(music_file):
                    os.remove(music_file)
                    print(f"   Cleaned up temp music file")
                
                return True
            else:
                print(f"❌ Error: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    else:
        print("\n⚠️  Note: Music file creation needs ffmpeg")
        print("   Install: choco install ffmpeg")
        print("   Or: Download royalty-free music and place as 'background_music.mp3'")
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Add Background Music to Demo Video")
    print("="*60)
    
    # Check if video exists
    if not os.path.exists("demo_video.mp4"):
        print("❌ Error: demo_video.mp4 not found")
        print(f"   Expected location: {os.path.abspath('demo_video.mp4')}")
        sys.exit(1)
    
    print("\n📋 Requirements:")
    print("   - ffmpeg installed (for audio mixing)")
    print("   - demo_video.mp4 in current folder")
    
    # Try to add music
    success = add_music_to_video()
    
    if success:
        print("\n✅ Done! Your video with music is ready:")
        print(f"   📁 demo_video_with_music.mp4")
        print("\n🚀 Next steps:")
        print("   1. Upload to YouTube")
        print("   2. Create Hebrew version")
        print("   3. Share on all platforms")
    else:
        print("\n⚠️  Note: Install ffmpeg first")
        print("   Windows: choco install ffmpeg")
        print("   Or download from: https://ffmpeg.org/download.html")
