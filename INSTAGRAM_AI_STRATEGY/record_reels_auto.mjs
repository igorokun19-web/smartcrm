/**
 * record_reels.mjs — מקליט את כל ה-HTML reels כ-MP4
 * הרץ: node record_reels.mjs
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FFMPEG = process.env.FFMPEG_PATH ||
  'C:\\Users\\okunig\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe';
const REELS_DIR   = resolve(__dirname, 'reels_html');
const WEBM_DIR    = resolve(__dirname, 'reels_webm');
const OUTPUT_DIR  = resolve(__dirname, 'reels_final');
const DURATION_MS = 9000; // 9 seconds per reel
const WIDTH       = 1080;
const HEIGHT      = 1920;

// Create output dirs
[WEBM_DIR, OUTPUT_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

// Find all HTML reels
const files = readdirSync(REELS_DIR)
  .filter(f => f.endsWith('.html'))
  .sort();

console.log(`\n🎬 מקליט ${files.length} ריאלס...\n`);

const browser = await chromium.launch({ headless: true });

for (const file of files) {
  const name    = basename(file, '.html');
  const htmlUrl = `file:///${REELS_DIR.replace(/\\/g, '/')}/${file}`;
  const webmOut = join(WEBM_DIR, `${name}.webm`);
  const mp4Out  = join(OUTPUT_DIR, `${name}.mp4`);

  console.log(`  ⏺  ${file}`);

  try {
    const context = await browser.newContext({
      viewport: { width: WIDTH, height: HEIGHT },
      recordVideo: {
        dir: WEBM_DIR,
        size: { width: WIDTH, height: HEIGHT },
      },
    });

    const page = await context.newPage();
    await page.goto(htmlUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(DURATION_MS);

    const videoPath = await page.video().path();
    await context.close(); // finalize WebM

    // Convert to MP4
    execSync(
      `"${FFMPEG}" -y -i "${videoPath}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p "${mp4Out}"`,
      { stdio: 'pipe' }
    );

    console.log(`  ✅  נשמר: ${name}.mp4\n`);
  } catch (err) {
    console.error(`  ❌  שגיאה ב-${file}:`, err.message);
  }
}

await browser.close();
console.log('\n🎉 סיום! כל הקבצים נמצאים בתיקיית reels_final/\n');
