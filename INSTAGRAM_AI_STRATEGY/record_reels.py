"""
🎬 HTML → Reel Video Recorder
Records each HTML animation file as a professional 9-second MP4 Reel
using Playwright's screenshot-based frame capture.
"""
import asyncio
import subprocess
import os
import sys
from pathlib import Path
import imageio_ffmpeg  # bundled ffmpeg

# Use bundled ffmpeg
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

HTML_DIR = Path(__file__).parent / "reels_html"
OUT_DIR  = Path(__file__).parent / "reels_pro"
OUT_DIR.mkdir(exist_ok=True)

FPS      = 30
DURATION = 9          # seconds
W, H     = 1080, 1920

REELS = [
    ("reel_01_chatgpt_demo.html",       "reel_01_chatgpt_demo.mp4"),
    ("reel_02_before_after.html",       "reel_02_before_after.mp4"),
    ("reel_03_3_tools.html",            "reel_03_3_tools.mp4"),
    ("reel_04_whatsapp.html",           "reel_04_whatsapp.mp4"),
    ("reel_05_stats.html",              "reel_05_stats.mp4"),
    ("reel_06_secret75.html",           "reel_06_secret75.mp4"),
    ("reel_P1_electrician.html",        "reel_P1_electrician.mp4"),
    ("reel_P2_before_after_people.html","reel_P2_before_after_people.mp4"),
    ("reel_P3_story.html",              "reel_P3_story.mp4"),
    ("reel_R1_real_electrician.html",   "reel_R1_real_electrician.mp4"),
    ("reel_R2_real_split.html",         "reel_R2_real_split.mp4"),
    ("reel_R3_cinematic.html",          "reel_R3_cinematic.mp4"),
]


async def record_reel(html_file: str, out_file: str):
    from playwright.async_api import async_playwright

    html_path = HTML_DIR / html_file
    out_path  = OUT_DIR / out_file
    frames_dir = OUT_DIR / "frames_tmp"
    frames_dir.mkdir(exist_ok=True)

    total_frames = DURATION * FPS
    print(f"  🎥 Recording {html_file} ({total_frames} frames)...", flush=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": W, "height": H},
            device_scale_factor=1
        )
        page = await context.new_page()
        await page.goto(f"file:///{html_path.as_posix()}")
        await asyncio.sleep(0.3)  # Let initial CSS load

        for i in range(total_frames):
            t = i / FPS
            # Set CSS animation playback position via JS
            await page.evaluate(f"""
                document.getAnimations().forEach(a => {{
                    try {{
                        a.currentTime = {t * 1000};
                    }} catch(e) {{}}
                }});
            """)
            frame_path = frames_dir / f"frame_{i:05d}.png"
            await page.screenshot(path=str(frame_path), full_page=False)

        await browser.close()

    # Encode with ffmpeg
    print(f"  🎞️  Encoding {out_file}...", flush=True)
    ffmpeg_cmd = [
        FFMPEG, "-y",
        "-framerate", str(FPS),
        "-i", str(frames_dir / "frame_%05d.png"),
        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(out_path)
    ]
    result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ❌ ffmpeg error: {result.stderr[-200:]}")
    else:
        print(f"  ✅ {out_file} ({out_path.stat().st_size // 1024} KB)")

    # Cleanup frames
    import shutil
    shutil.rmtree(frames_dir, ignore_errors=True)


async def main():
    print("🎬 Recording professional animated Reels...\n")

    # Check ffmpeg
    try:
        subprocess.run([FFMPEG, "-version"], capture_output=True, check=True)
        print(f"  ✅ ffmpeg found: {FFMPEG}")
    except Exception as e:
        print(f"❌ ffmpeg error: {e}")
        sys.exit(1)

    # Check playwright
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("Installing playwright...")
        subprocess.run([sys.executable, "-m", "pip", "install", "playwright", "-q"])
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"])

    for html_file, out_file in REELS:
        out_path = OUT_DIR / out_file
        if out_path.exists():
            print(f"  ⏭️  Skipping {out_file} (already exists)")
            continue
        if not (HTML_DIR / html_file).exists():
            print(f"  ⚠️  {html_file} not found, skipping")
            continue
        if (OUT_DIR / out_file).exists():
            print(f"  ⏭️  {out_file} already exists, skipping")
            continue
        try:
            await record_reel(html_file, out_file)
        except Exception as e:
            print(f"  ❌ {html_file}: {e}")

    print(f"\n✅ Done! Videos in: {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
