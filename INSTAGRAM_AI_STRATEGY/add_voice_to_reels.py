"""
🎙️ Voice + Reel Merger
Generates Hebrew neural voice (Microsoft Edge TTS) for each Reel
and merges with the HTML-recorded video using ffmpeg.
Output: reels_final/ — ready to upload Reels with voice
"""
import asyncio
import subprocess
import sys
from pathlib import Path
import imageio_ffmpeg

REELS_DIR  = Path(__file__).parent / "reels_pro"
AUDIO_DIR  = Path(__file__).parent / "reels_audio"
FINAL_DIR  = Path(__file__).parent / "reels_final"
AUDIO_DIR.mkdir(exist_ok=True)
FINAL_DIR.mkdir(exist_ok=True)

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Hebrew neural voice — Avri (male, warm & professional)
VOICE = "he-IL-AvriNeural"

# ── NARRATION SCRIPTS FOR EACH REEL ──
# Keep under 9 seconds of speech. Rate=+15% = slightly faster.
NARRATIONS = {
    "reel_01_chatgpt_demo": {
        "text": """
        דני החשמלאי כתב לצ'אט ג'יי פי טי:
        "כתוב לי הצעת מחיר להחלפת לוח חשמל."
        תוך שמונה שניות — הצעת מחיר מקצועית מוכנה.
        שעה של עבודה — בשמונה שניות.
        עקבו לעוד טיפים כל יום.
        """,
        "rate": "+15%"
    },
    "reel_02_before_after": {
        "text": """
        לפני AI: שעה לכל הצעת מחיר.
        תשובות ידניות. פולו-אפ שלא קורה.
        אחרי AI: שלושים שניות. הכל אוטומטי.
        שמרו את הפוסט הזה — תחזרו אליו.
        """,
        "rate": "+10%"
    },
    "reel_03_3_tools": {
        "text": """
        שלושה כלים שכל בעל עסק חייב —
        צ'אט ג'יי פי טי, וואטסאפ ביזנס, וסמארט סי ארם.
        ביחד הם חוסכים לך שמונים שעה בחודש.
        קישורים בביו.
        """,
        "rate": "+10%"
    },
    "reel_04_whatsapp": {
        "text": """
        לקוח שלח בשעה שתיים לילה.
        ואטסאפ ביזנס ענה אוטומטית תוך שלושים שניות.
        הלקוח לא הלך למתחרה.
        שלוש דקות הגדרה — חינם לגמרי.
        """,
        "rate": "+10%"
    },
    "reel_05_stats": {
        "text": """
        מאה עשרים ושישה אלף מחפשי עבודה בקבוצה אחת.
        שמונים ותשעה אלף בקבוצת דרושים.
        שלוש מאות שמונים אלף בעלי עסקים.
        אם אתה לא שם — המתחרה שלך כן.
        """,
        "rate": "+10%"
    },
    "reel_06_secret75": {
        "text": """
        שבעים וחמישה אחוז מהכסף שלך —
        מחכה אצל לקוחות שכבר שילמו לך.
        פשוט לא פנית אליהם שוב.
        צ'אט ג'יי פי טי כותב לך פולו-אפ בשלושים שניות.
        שמרו.
        """,
        "rate": "+10%"
    },
    "reel_P1_electrician": {
        "text": """
        דני החשמלאי בזבז שעה על כל הצעת מחיר.
        היום? שמונה שניות עם צ'אט ג'יי פי טי.
        חינם לגמרי. עכשיו.
        עקבו לעוד טיפים יומיים.
        """,
        "rate": "+15%"
    },
    "reel_P2_before_after_people": {
        "text": """
        בעל מקצוע לפני AI — עייף, שעות ארוכות, לקוחות בורחים.
        בעל מקצוע אחרי AI — שמח, פחות שעות, יותר כסף.
        ההבדל? ארבע שעות פנויות ביום.
        שמרו.
        """,
        "rate": "+10%"
    },
    "reel_P3_story": {
        "text": """
        לקוח שלח הודעה. לא קיבל תשובה.
        עשר דקות אחר כך — הלך לגוגל.
        הזמין את המתחרה שענה ראשון.
        ואטסאפ ביזנס מונע את זה — חינם.
        שמרו.
        """,
        "rate": "+10%"
    },
    "reel_R1_real_electrician": {
        "text": """
        דני. חשמלאי. עשר שנות ניסיון.
        היה מבזבז שעה על כל הצעת מחיר.
        עכשיו? שמונה שניות עם צ'אט ג'יי פי טי.
        עשרים שעות חופשיות בחודש.
        עקבו לטיפ הבא.
        """,
        "rate": "+15%"
    },
    "reel_R2_real_split": {
        "text": """
        משמאל — אותו עסק לפני AI.
        מימין — אחרי AI.
        ששים דקות הפכו לשלושים שניות.
        שלושים אחוז עלייה בהכנסה.
        כלי חינמי. עכשיו.
        """,
        "rate": "+10%"
    },
    "reel_R3_cinematic": {
        "text": """
        יוסי האינסטלטור. לקוח לא ענה לו בערב.
        עשר דקות אחר כך — הלקוח הזמין מתחרה.
        היום, ואטסאפ ביזנס עונה אוטומטית.
        ארבעים אחוז יותר עסקאות נסגרות.
        שמרו.
        """,
        "rate": "+10%"
    },
}


async def generate_voice(reel_name: str, text: str, rate: str) -> Path:
    """Generate Hebrew voice using Microsoft Edge TTS."""
    import edge_tts
    audio_path = AUDIO_DIR / f"{reel_name}.mp3"
    if audio_path.exists():
        print(f"    ⏭️  Audio exists: {reel_name}.mp3")
        return audio_path

    # Clean up text
    text = " ".join(text.split())  # normalize whitespace

    communicate = edge_tts.Communicate(text, VOICE, rate=rate)
    await communicate.save(str(audio_path))
    size = audio_path.stat().st_size // 1024
    print(f"    🎙️  Generated: {reel_name}.mp3 ({size} KB)")
    return audio_path


def merge_video_audio(reel_name: str, audio_path: Path) -> Path:
    """Merge video + audio using ffmpeg, adjusting audio duration to video."""
    video_path = REELS_DIR / f"{reel_name}.mp4"
    output_path = FINAL_DIR / f"{reel_name}_voiced.mp4"

    if not video_path.exists():
        print(f"    ⚠️  Video not found: {video_path}")
        return None

    if output_path.exists():
        print(f"    ⏭️  Already merged: {reel_name}_voiced.mp4")
        return output_path

    # Get video duration
    probe = subprocess.run(
        [FFMPEG, "-i", str(video_path)],
        capture_output=True, text=True
    )
    duration_str = ""
    for line in probe.stderr.split("\n"):
        if "Duration:" in line:
            duration_str = line.split("Duration:")[1].split(",")[0].strip()
            break

    # Merge: audio might be shorter/longer than 9s video
    cmd = [
        FFMPEG, "-y",
        "-i", str(video_path),
        "-i", str(audio_path),
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",           # Trim to shorter of video/audio
        "-af", "afade=t=in:ss=0:d=0.3,afade=t=out:st=8.5:d=0.5",  # Fade in/out
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        size = output_path.stat().st_size // 1024
        print(f"    ✅ {reel_name}_voiced.mp4 ({size} KB)")
    else:
        print(f"    ❌ Error: {result.stderr[-200:]}")
        return None
    return output_path


async def main():
    import edge_tts  # verify installed
    print("🎙️  Generating Hebrew voices + merging with Reels...\n")

    results = []
    for reel_name, config in NARRATIONS.items():
        print(f"  📼 {reel_name}:")
        try:
            audio_path = await generate_voice(reel_name, config["text"], config["rate"])
            output = merge_video_audio(reel_name, audio_path)
            if output:
                results.append(f"✅ {reel_name}_voiced.mp4")
        except Exception as e:
            results.append(f"❌ {reel_name}: {e}")
            print(f"    ❌ Error: {e}")
        print()

    print(f"\n{'='*50}")
    print(f"✅ Done! {len([r for r in results if r.startswith('✅')])} Reels with voice")
    print(f"📁 Output: {FINAL_DIR}")
    print(f"\nFiles:")
    for r in results:
        print(f"  {r}")


if __name__ == "__main__":
    asyncio.run(main())
