'use client';

/**
 * Extracts a YouTube video ID from various URL formats.
 *
 * Supported formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://m.youtube.com/watch?v=VIDEO_ID
 *   https://youtube.com/watch?v=VIDEO_ID
 *   https://www.youtube.com/v/VIDEO_ID
 *   https://www.youtube.com/live/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  let match: RegExpExecArray | null;

  // Standard watch URL: ?v=VIDEO_ID
  match = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(url);
  if (match) return match[1];

  // youtu.be short URL
  match = /youtu\.be\/([a-zA-Z0-9_-]{11})/.exec(url);
  if (match) return match[1];

  // youtube.com/embed/VIDEO_ID
  match = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.exec(url);
  if (match) return match[1];

  // youtube.com/shorts/VIDEO_ID
  match = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/.exec(url);
  if (match) return match[1];

  // youtube.com/v/VIDEO_ID (legacy embed)
  match = /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/.exec(url);
  if (match) return match[1];

  // youtube.com/live/VIDEO_ID
  match = /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/.exec(url);
  if (match) return match[1];

  // Bare 11-character ID (edge case)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

/**
 * Returns a YouTube thumbnail URL for the given video ID.
 *
 * Quality options:
 *   'default'  → 120×90
 *   'medium'   → 320×180
 *   'high'     → 480×360
 *   'maxres'   → 1280×720 (may not exist for all videos)
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high',
): string | null {
  if (!videoId || typeof videoId !== 'string') return null;

  const qualityMap: Record<string, string> = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault',
  };

  const suffix = qualityMap[quality] ?? 'hqdefault';
  return `https://img.youtube.com/vi/${videoId}/${suffix}.jpg`;
}

/**
 * Resolves the effective source information for a single video entry.
 * Returns the video's YouTube ID (if applicable), direct URL, and thumbnail.
 */
export function resolveVideoSource(video: {
  youtubeUrl?: string;
  videoUrl?: string;
  videoId?: string;
  thumbnail?: string;
}) {
  // Prefer an explicitly provided videoId first
  let ytId: string | null = video.videoId ?? null;

  // Then try to extract from youtubeUrl
  if (!ytId && video.youtubeUrl) {
    ytId = extractYouTubeId(video.youtubeUrl);
  }

  const isYouTube = ytId !== null;
  const directUrl = video.videoUrl ?? null;

  // Thumbnail priority: explicit prop > YouTube auto > null
  const thumb =
    video.thumbnail ??
    (ytId ? getYouTubeThumbnail(ytId, 'high') : null) ??
    null;

  return {
    isYouTube,
    youtubeId: ytId,
    directUrl,
    thumbnail: thumb,
  };
}

/**
 * Formats seconds into mm:ss or hh:mm:ss display string.
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Playback speed options available in the player. */
export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];
