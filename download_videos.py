#!/usr/bin/env python3
"""
Download Demo Videos from Website
Ready to share on social media + YouTube
"""

import requests
import os
from pathlib import Path

# Create Downloads folder
downloads_dir = Path.home() / "Downloads" / "MyServices_Videos"
downloads_dir.mkdir(parents=True, exist_ok=True)

# Videos to download
videos = {
    "demo_video.mp4": "https://smartcrm-3cle.onrender.com/demo_video.mp4",
    "demo_video_hebrew.mp4": "https://smartcrm-3cle.onrender.com/demo_video_hebrew.mp4",
}

print("📥 Downloading MyServices Demo Videos...\n")

for filename, url in videos.items():
    filepath = downloads_dir / filename
    
    print(f"⏳ Downloading: {filename}")
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size:
                        percent = (downloaded / total_size) * 100
                        print(f"  {percent:.1f}% ", end='\r')
        
        size_mb = filepath.stat().st_size / (1024 * 1024)
        print(f"✅ {filename} ({size_mb:.1f} MB) saved!")
        
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")

print(f"\n📁 All videos saved to: {downloads_dir}")
print("\n🚀 Ready to upload to YouTube!")
