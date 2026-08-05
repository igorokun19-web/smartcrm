"""
🎬 SmartCRM Demo Presentation → MP4
Records the HTML slideshow as a 1920x1080 MP4 demo video.
Each slide shown for ~5 seconds with smooth transitions.
"""
import asyncio
import subprocess
import os
import shutil
from pathlib import Path
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

HTML_FILE = Path(__file__).parent / "demo_presentation.html"
FRAMES_DIR = Path(__file__).parent / "frames_tmp"
OUT_FILE = Path(__file__).parent / "smartcrm_demo.mp4"

FPS = 24
SLIDE_DURATION = 5   # seconds per slide
TOTAL_SLIDES = 10
W, H = 1920, 1080

# Slide titles for progress indicator
SLIDE_TITLES = [
    "SmartCRM — ניהול לידים חכם",
    "הבעיה — לידים נופלים בין הכיסאות",
    "הפתרון — מקום אחד לכל דבר",
    "סימולציה — 3 עסקים שונים",
    "Data Isolation — כל עסק רואה רק את שלו",
    "Dashboard — ביצועים בזמן אמת",
    "AI Features — חכמה מובנית",
    "בדיקות — 100% עובר",
    "מה בנינו ביום אחד",
    "התחל חינם — frontend-two-pearl-10.vercel.app",
]


async def record_demo():
    from playwright.async_api import async_playwright

    FRAMES_DIR.mkdir(parents=True, exist_ok=True)

    # Clear old frames
    for f in FRAMES_DIR.glob("*.png"):
        f.unlink()

    slide_images = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": W, "height": H})

        html_url = f"file:///{HTML_FILE.as_posix()}"
        await page.goto(html_url, wait_until="domcontentloaded")
        await asyncio.sleep(1.5)

        for slide_num in range(1, TOTAL_SLIDES + 1):
            print(f"  📸 Slide {slide_num}/{TOTAL_SLIDES}: {SLIDE_TITLES[slide_num-1][:40]}")

            await page.evaluate(f"goTo({slide_num - 1})")
            await asyncio.sleep(0.8)

            png_path = FRAMES_DIR / f"slide_{slide_num:02d}.png"
            await page.screenshot(path=str(png_path), clip={"x": 0, "y": 0, "width": W, "height": H})
            slide_images.append(png_path)

        await browser.close()

    print(f"  ✅ Captured {len(slide_images)} slide screenshots")

    # Build ffmpeg concat file — each slide shown for SLIDE_DURATION seconds
    concat_file = FRAMES_DIR / "concat.txt"
    with open(concat_file, "w", encoding="utf-8") as cf:
        for img_path in slide_images:
            cf.write(f"file '{img_path.as_posix()}'\n")
            cf.write(f"duration {SLIDE_DURATION}\n")
        # Last frame needs to be listed again without duration
        cf.write(f"file '{slide_images[-1].as_posix()}'\n")

    # Encode MP4
    print("  🎞️  Encoding MP4...")
    cmd = [
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-vf", f"fps={FPS},scale={W}:{H}",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(OUT_FILE)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ❌ ffmpeg error: {result.stderr[-800:]}")
        return False

    import shutil
    shutil.rmtree(str(FRAMES_DIR))

    size_mb = OUT_FILE.stat().st_size / 1024 / 1024
    print(f"\n  ✅ Video ready!")
    print(f"     Duration: {TOTAL_SLIDES * SLIDE_DURATION}s | Size: {size_mb:.1f}MB")
    print(f"     📁 {OUT_FILE}")
    return True


if __name__ == "__main__":
    print("🎬 Recording SmartCRM Demo Video...")
    print(f"   Slides: {TOTAL_SLIDES} × {SLIDE_DURATION}s = {TOTAL_SLIDES * SLIDE_DURATION}s total")
    print(f"   Resolution: {W}×{H} @ {FPS}fps\n")

    success = asyncio.run(record_demo())

    if success:
        print("\n🎉 Done! Open with any video player.")
    else:
        print("\n❌ Failed. Check errors above.")
