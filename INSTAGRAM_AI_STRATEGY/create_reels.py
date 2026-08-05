"""
Convert Instagram post images to short Reels-ready MP4 videos.
Each image becomes a 7-second vertical video (1080x1920) with a fade-in effect.
"""
from moviepy import ImageClip, AudioFileClip, CompositeAudioClip
from moviepy.video.fx import FadeIn, FadeOut
from PIL import Image
import os
import numpy as np

INPUT_DIR = os.path.join(os.path.dirname(__file__), "posts")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "reels")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Instagram Reels: 1080x1920 (9:16)
REEL_W, REEL_H = 1080, 1920
DURATION = 7  # seconds per reel
FPS = 30

posts = [
    ("post_01_pov_electrician.jpg",    "reel_01_pov.mp4"),
    ("post_02_before_after.jpg",       "reel_02_before_after.mp4"),
    ("post_03_secret.jpg",             "reel_03_secret.mp4"),
    ("post_04_3_mistakes.jpg",         "reel_04_mistakes.mp4"),
    ("post_05_quote_card.jpg",         "reel_05_quote.mp4"),
    ("post_06_whatsapp_tip.jpg",       "reel_06_whatsapp.mp4"),
    ("post_07_chatgpt_prompt.jpg",     "reel_07_prompt.mp4"),
    ("post_08_stats.jpg",              "reel_08_stats.mp4"),
    ("post_09_2026_reality.jpg",       "reel_09_reality.mp4"),
    ("post_10_cta_follow.jpg",         "reel_10_cta.mp4"),
]


def create_reel_from_image(img_path, out_path, duration=DURATION):
    """Convert a 1080x1080 image to a 1080x1920 vertical video for Reels."""
    # Open and resize image to 1080x1080
    img = Image.open(img_path).convert("RGB")
    img = img.resize((REEL_W, REEL_W), Image.LANCZOS)

    # Create 1080x1920 canvas (black bg) — center image vertically
    canvas = Image.new("RGB", (REEL_W, REEL_H), (10, 10, 10))
    y_offset = (REEL_H - REEL_W) // 2
    canvas.paste(img, (0, y_offset))

    img_array = np.array(canvas)

    # Create static video clip with fade effects
    clip = (ImageClip(img_array, duration=duration)
            .with_effects([FadeIn(0.5), FadeOut(0.5)]))

    # Export
    clip.write_videofile(
        out_path,
        fps=FPS,
        codec="libx264",
        audio=False,
        preset="ultrafast",
        ffmpeg_params=["-crf", "23"],
        logger=None,
    )
    print(f"✅ {os.path.basename(out_path)}")
    clip.close()


if __name__ == "__main__":
    print("🎬 יוצר Reels מהתמונות...\n")
    for img_file, out_file in posts:
        img_path = os.path.join(INPUT_DIR, img_file)
        out_path = os.path.join(OUTPUT_DIR, out_file)
        if not os.path.exists(img_path):
            print(f"⚠️  לא נמצא: {img_file}")
            continue
        try:
            create_reel_from_image(img_path, out_path)
        except Exception as e:
            print(f"❌ שגיאה ב-{img_file}: {e}")

    print(f"\n✅ כל הסרטונים נשמרו ב: {OUTPUT_DIR}")
