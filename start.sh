#!/bin/bash
set -e

# Install ffmpeg static binary if not available
if ! command -v ffmpeg &> /dev/null; then
    echo "Downloading ffmpeg static binary..."
    mkdir -p /tmp/ffmpeg-bin
    curl -sL "https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz" -o /tmp/ffmpeg.tar.xz
    tar xf /tmp/ffmpeg.tar.xz -C /tmp/ffmpeg-bin --strip-components=1
    cp /tmp/ffmpeg-bin/ffmpeg /tmp/ffmpeg-bin/ffprobe /usr/local/bin/ 2>/dev/null || \
    cp /tmp/ffmpeg-bin/ffmpeg /tmp/ffmpeg-bin/ffprobe "$HOME/.local/bin/" 2>/dev/null || \
    { mkdir -p /app/bin && cp /tmp/ffmpeg-bin/ffmpeg /tmp/ffmpeg-bin/ffprobe /app/bin/; export PATH="/app/bin:$PATH"; }
    rm -rf /tmp/ffmpeg.tar.xz /tmp/ffmpeg-bin
    echo "ffmpeg ready: $(which ffmpeg 2>/dev/null || echo '/app/bin/ffmpeg')"
fi

# Ensure ffmpeg is in PATH
export PATH="/app/bin:/usr/local/bin:$PATH"

# Start the app
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000
