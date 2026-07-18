#!/usr/bin/env python3
"""
Add background music to demo video using moviepy
Creates: demo_video_with_music.mp4
"""

import os
import sys
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip
from moviepy.audio.AudioFileClip import AudioFileClip as AudioClip
import numpy as np

def create_ambient_music(duration_seconds):
    """Create a simple ambient music audio track"""
    print("🎵 Creating ambient background music...")
    
    from moviepy.audio.fx import volumex
    from moviepy.audio.AudioClip import make_frame
    
    # Create a simple sine wave tone as background
    def make_tone(t):
        # Create a simple ambient tone using multiple frequencies
        freq1 = 55  # A1
        freq2 = 110  # A2
        freq3 = 220  # A3
        
        wave = 0.1 * (np.sin(2 * np.pi * freq1 * t) + 
                      0.5 * np.sin(2 * np.pi * freq2 * t) + 
                      0.3 * np.sin(2 * np.pi * freq3 * t))
        
        # Add volume envelope (fade in and out)
        fade_in = min(1.0, t / 2)  # Fade in over 2 seconds
        fade_out = max(0, 1 - (t - (duration_seconds - 2)) / 2)  # Fade out last 2 seconds
        
        return wave * fade_in * fade_out * 0.3
    
    from moviepy.audio.AudioClip import AudioClip
    
    audio = AudioClip(make_frame, duration=duration_seconds, fps=44100)
    return audio

def add_music_to_video():
    """Add background music to video"""
    input_video = "demo_video.mp4"
    output_video = "demo_video_with_music.mp4"
    
    print(f"\n🎬 Processing: {input_video}")
    
    # Check if video exists
    if not os.path.exists(input_video):
        print(f"❌ Error: {input_video} not found")
        return False
    
    try:
        # Load video
        print("   Loading video...")
        video = VideoFileClip(input_video)
        duration = video.duration
        
        print(f"   Duration: {duration:.1f} seconds")
        print(f"   FPS: {video.fps}")
        print(f"   Size: {video.size}")
        
        # Create background music
        print("\n   Creating background music...")
        music = create_ambient_music(duration)
        
        # Get original audio if exists, or use silence
        original_audio = video.audio
        
        if original_audio is not None:
            print("   Mixing with original audio...")
            # Mix original audio with background music
            final_audio = CompositeAudioClip([
                music.volumex(0.3),  # Background music at 30% volume
                original_audio.volumex(0.7)  # Original audio at 70% volume
            ])
        else:
            print("   No original audio found, using music only...")
            final_audio = music.volumex(0.5)
        
        # Set audio to video
        video_with_music = video.set_audio(final_audio)
        
        # Write output
        print(f"\n⏳ Encoding video with music...")
        print(f"   Output: {output_video}")
        print("   (This may take a minute...)")
        
        video_with_music.write_videofile(
            output_video,
            codec='libx264',
            audio_codec='aac',
            verbose=False,
            logger=None
        )
        
        # Verify
        if os.path.exists(output_video):
            file_size = os.path.getsize(output_video) / (1024 * 1024)
            print(f"\n✅ Success! Created: {output_video}")
            print(f"   📊 Size: {file_size:.1f} MB")
            print(f"   🎵 Background music added!")
            return True
        else:
            print(f"❌ Error: Output file not created")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("Add Background Music to Demo Video")
    print("="*60)
    
    # Check if video exists
    if not os.path.exists("demo_video.mp4"):
        print("❌ Error: demo_video.mp4 not found")
        sys.exit(1)
    
    print("\n📋 This will:")
    print("   1. Load demo_video.mp4")
    print("   2. Create ambient background music")
    print("   3. Mix and create demo_video_with_music.mp4")
    
    success = add_music_to_video()
    
    if success:
        print("\n✅ Done! Your video with music is ready:")
        print("   📁 demo_video_with_music.mp4")
    else:
        print("\n❌ Failed to add music")
        sys.exit(1)
