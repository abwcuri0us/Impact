'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  PlayCircle,
  Loader2,
  AlertCircle,
  X,
  PictureInPicture2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  extractYouTubeId,
  getYouTubeThumbnail,
  resolveVideoSource,
  formatTime,
  PLAYBACK_RATES,
  type PlaybackRate,
} from '@/hooks/useVideoPlayer';

/* ─────────────────────────── Types ─────────────────────────── */

export interface VideoItem {
  id: string;
  title?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  videoId?: string;
  thumbnail?: string;
}

export interface VideoPlayerProps {
  videos: VideoItem[];
  startIndex?: number;
  onClose?: () => void;
  showPlaylist?: boolean;
}

/* ─────────────────────────── YouTube postMessage helpers ──── */

/** Call a method on the YouTube IFrame API via postMessage. */
function ytPostMessage(
  iframe: HTMLIFrameElement | null,
  action: string,
  value?: unknown,
) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage(
    JSON.stringify({ event: 'command', func: action, args: value !== undefined ? [value] : [] }),
    '*',
  );
}

/* ─────────────────────────── Component ─────────────────────── */

export default function VideoPlayer({
  videos,
  startIndex = 0,
  onClose,
}: VideoPlayerProps) {
  /* ── index ── */
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  /* ── derived data ── */
  const safeVideos = useMemo(() => (Array.isArray(videos) && videos.length > 0 ? videos : []), [videos]);
  const currentVideo = safeVideos[currentIndex] ?? null;
  const source = currentVideo ? resolveVideoSource(currentVideo) : null;
  const hasMultiple = safeVideos.length > 1;

  /* ── shared state ── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  /* ── YouTube-specific state ── */
  const [ytReady, setYtReady] = useState(false);

  /* ── refs ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ytStateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─────────── helpers ─────────── */

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  /* ─────────── VIDEO CHANGE ─────────── */

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setHasError(false);
    setYtReady(false);
    setShowControls(true);
  }, [currentIndex]);

  /* ─────────── YOUTUBE IFRAME SETUP ─────────── */

  useEffect(() => {
    if (!source?.isYouTube || !iframeRef.current) return;

    const getPercent = () => {
      ytPostMessage(iframeRef.current, 'getCurrentTime', null);
      ytPostMessage(iframeRef.current, 'getDuration', null);
    };

    const readyTimeout = setTimeout(() => {
      setYtReady(true);
      setIsLoading(false);
      ytStateIntervalRef.current = setInterval(getPercent, 250);
    }, 1500);

    return () => {
      clearTimeout(readyTimeout);
      if (ytStateIntervalRef.current) clearInterval(ytStateIntervalRef.current);
    };
  }, [source?.isYouTube, currentIndex]);

  useEffect(() => {
    if (!source?.isYouTube) return;

    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data?.info) return;

        if (data.info.currentTime !== undefined) setCurrentTime(data.info.currentTime);
        if (data.info.duration !== undefined && data.info.duration > 0) setDuration(data.info.duration);

        if (data.info.playerState === 0) {
          setIsPlaying(false);
          if (hasMultiple) {
            setCurrentIndex((i) => (i + 1) % safeVideos.length);
          }
        }
        if (data.info.playerState === 1) {
          setIsPlaying(true);
          setIsLoading(false);
        }
        if (data.info.playerState === 3) setIsLoading(true);
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [source?.isYouTube, hasMultiple, safeVideos.length]);

  /* ─────────── CONTROLS AUTO-HIDE ─────────── */

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [isPlaying, resetControlsTimer]);

  /* ─────────── KEYBOARD SHORTCUTS ─────────── */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          if (e.shiftKey) playPrev();
          else seekRelative(-10);
          break;
        case 'arrowright':
          e.preventDefault();
          if (e.shiftKey) playNext();
          else seekRelative(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.05);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.05);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'n':
          e.preventDefault();
          playNext();
          break;
        case 'p':
          e.preventDefault();
          playPrev();
          break;
        case 'escape':
          e.preventDefault();
          handleClose();
          break;
      }
      resetControlsTimer();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, source, isPlaying, isMuted, volume]);

  /* ─────────── FULLSCREEN OBSERVER ─────────── */

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  /* ─────────── PLAYBACK CONTROLS ─────────── */

  const togglePlay = useCallback(() => {
    if (source?.isYouTube && ytReady) {
      if (isPlaying) {
        ytPostMessage(iframeRef.current, 'pauseVideo');
      } else {
        ytPostMessage(iframeRef.current, 'playVideo');
      }
      return;
    }

    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play().catch(() => setHasError(true));
    } else {
      v.pause();
    }
  }, [source, ytReady, isPlaying]);

  const seekRelative = useCallback((delta: number) => {
    if (source?.isYouTube && ytReady) {
      ytPostMessage(iframeRef.current, 'seekTo', Math.max(0, currentTime + delta));
      return;
    }
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
  }, [source, ytReady, currentTime]);

  const seekTo = useCallback((time: number) => {
    if (source?.isYouTube && ytReady) {
      ytPostMessage(iframeRef.current, 'seekTo', time);
      return;
    }
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, time));
  }, [source, ytReady]);

  const changeVolume = useCallback((delta: number) => {
    const next = Math.max(0, Math.min(1, volume + delta));
    setVolume(next);
    if (next === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }

    if (source?.isYouTube && ytReady) {
      ytPostMessage(iframeRef.current, 'setVolume', Math.round(next * 100));
      if (next === 0) {
        ytPostMessage(iframeRef.current, 'mute');
      } else {
        ytPostMessage(iframeRef.current, 'unMute');
      }
      return;
    }

    const v = videoRef.current;
    if (v) v.volume = next;
  }, [source, ytReady, volume]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (source?.isYouTube && ytReady) {
      if (nextMuted) {
        ytPostMessage(iframeRef.current, 'mute');
      } else {
        ytPostMessage(iframeRef.current, 'unMute');
      }
      return;
    }

    const v = videoRef.current;
    if (v) v.muted = nextMuted;
  }, [source, ytReady, isMuted]);

  const changePlaybackRate = useCallback((rate: PlaybackRate) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);

    if (source?.isYouTube && ytReady) {
      ytPostMessage(iframeRef.current, 'setPlaybackRate', rate);
      return;
    }

    const v = videoRef.current;
    if (v) v.playbackRate = rate;
  }, [source, ytReady]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      // Fullscreen might be blocked
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const v = videoRef.current;
    if (!v || typeof document.pictureInPictureEnabled === 'undefined') return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {
      // PiP might be blocked
    }
  }, []);

  const playNext = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((i) => (i + 1) % safeVideos.length);
  }, [hasMultiple, safeVideos.length]);

  const playPrev = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((i) => (i - 1 + safeVideos.length) % safeVideos.length);
  }, [hasMultiple, safeVideos.length]);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose?.();
  }, [onClose]);

  /* ─────────── HTML5 VIDEO EVENTS ─────────── */

  const handleVideoLoadStart = () => setIsLoading(true);
  const handleVideoCanPlay = () => setIsLoading(false);
  const handleVideoError = () => { setIsLoading(false); setHasError(true); };
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };
  const handleVideoDurationChange = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };
  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);
  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (hasMultiple) playNext();
  };
  const handleVideoProgress = () => resetControlsTimer();

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    seekTo(t);
    setCurrentTime(t);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);

    if (source?.isYouTube && ytReady) {
      ytPostMessage(iframeRef.current, 'setVolume', Math.round(v * 100));
      if (v === 0) ytPostMessage(iframeRef.current, 'mute');
      else ytPostMessage(iframeRef.current, 'unMute');
      return;
    }
    if (videoRef.current) videoRef.current.volume = v;
  };

  /* ─────────── SEEK BAR HOVER PREVIEW ─────────── */
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [seekBarHoverX, setSeekBarHoverX] = useState(0);

  const handleSeekBarMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(pct * duration);
    setSeekBarHoverX(x);
  };

  const handleSeekBarMouseLeave = () => {
    setHoverTime(null);
  };

  /* ─────────── DERIVED UI ─────────── */

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  /* ─────────── RENDER ─────────── */

  if (!currentVideo || !source) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/60">
          <AlertCircle className="w-12 h-12" />
          <p className="text-sm">No video available</p>
          {onClose && (
            <button onClick={handleClose} className="mt-4 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors">
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  const youtubeEmbedUrl = source.youtubeId
    ? `https://www.youtube.com/embed/${source.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
    : '';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-black flex flex-col select-none"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
    >
      {/* ═══════ TOP BAR ═══════ */}
      <div
        className={`flex items-center justify-between px-3 sm:px-4 py-2 bg-black/50 flex-shrink-0 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Left: Counter + Title */}
        <div className="flex items-center gap-2 min-w-0">
          {hasMultiple && (
            <span className="text-white/70 text-xs font-medium shrink-0">
              {currentIndex + 1} / {safeVideos.length}
            </span>
          )}
          {currentVideo.title && (
            <h3 className="text-white/90 text-sm font-medium truncate max-w-[200px] sm:max-w-[500px]">
              {currentVideo.title}
            </h3>
          )}
        </div>

        {/* Right: Close */}
        {onClose && (
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ═══════ VIDEO AREA (with Prev/Next) ═══════ */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* ── Previous Video Button ── */}
        {hasMultiple && (
          <button
            onClick={playPrev}
            className={`absolute left-2 sm:left-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            title="Previous Video (P or Shift+Left)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* ── Video Container ── */}
        <div className="relative w-full h-full flex items-center justify-center" onClick={togglePlay}>
          {/* YouTube iframe */}
          {source.isYouTube && (
            <iframe
              ref={iframeRef}
              key={`yt-${source.youtubeId}-${currentIndex}`}
              src={youtubeEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={currentVideo.title ?? 'YouTube video'}
            />
          )}

          {/* HTML5 video */}
          {!source.isYouTube && source.directUrl && (
            <video
              ref={videoRef}
              key={`html5-${currentIndex}`}
              src={source.directUrl}
              className="w-full h-full object-contain bg-black"
              playsInline
              preload="metadata"
              onLoadStart={handleVideoLoadStart}
              onCanPlay={handleVideoCanPlay}
              onError={handleVideoError}
              onTimeUpdate={handleVideoTimeUpdate}
              onDurationChange={handleVideoDurationChange}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
              onProgress={handleVideoProgress}
              onDoubleClick={toggleFullscreen}
            />
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {/* Error overlay */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
              <div className="flex flex-col items-center gap-3 text-white/80">
                <AlertCircle className="w-16 h-16 text-red-400" />
                <p className="text-base font-medium">Failed to load video</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setHasError(false); setIsLoading(true); if (videoRef.current) videoRef.current.load(); }}
                  className="px-5 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Big play button (when paused, HTML5 only) */}
          {!source.isYouTube && !isPlaying && !isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                <Play className="w-10 h-10 sm:w-12 sm:h-12 ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* ── Next Video Button ── */}
        {hasMultiple && (
          <button
            onClick={playNext}
            className={`absolute right-2 sm:right-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
            title="Next Video (N or Shift+Right)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* ═══════ BOTTOM CONTROLS BAR ═══════ */}
      <div
        className={`flex-shrink-0 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none -top-8" />

        <div className="relative px-3 pb-3 pt-8 sm:px-4 sm:pb-4 sm:pt-10">
          {/* ── Seek bar ── */}
          <div className="relative mb-2 group/seek">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeekBarChange}
              onMouseMove={handleSeekBarMouseMove}
              onMouseLeave={handleSeekBarMouseLeave}
              onClick={(e) => e.stopPropagation()}
              className="w-full h-1.5 appearance-none cursor-pointer rounded-full bg-white/30
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:opacity-0
                [&::-webkit-slider-thumb]:group-hover/seek:opacity-100
                [&::-webkit-slider-thumb]:transition-opacity
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-lg
                [&::-moz-range-thumb]:opacity-0
                [&::-moz-range-thumb]:group-hover/seek:opacity-100
                [&::-moz-range-thumb]:transition-opacity"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`,
              }}
              aria-label="Seek"
            />
            {/* Hover time preview tooltip */}
            {hoverTime !== null && duration > 0 && (
              <div
                className="absolute -top-8 pointer-events-none text-[11px] text-white bg-black/80 rounded px-1.5 py-0.5 whitespace-nowrap"
                style={{ left: `${Math.max(0, Math.min(seekBarHoverX, 100))}px`, transform: 'translateX(-50%)' }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* ── Bottom controls row ── */}
          <div className="flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Play / Pause */}
            <button onClick={togglePlay} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Skip back 10s */}
            <button onClick={() => seekRelative(-10)} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label="Rewind 10 seconds">
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Skip forward 10s */}
            <button onClick={() => seekRelative(10)} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label="Forward 10 seconds">
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                <VolumeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-24 transition-all duration-200 h-1 appearance-none cursor-pointer rounded-full bg-white/30
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:border-0"
                style={{
                  background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`,
                }}
                aria-label="Volume"
              />
            </div>

            {/* Time display */}
            <span className="text-[11px] sm:text-xs text-white/80 font-mono ml-1 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((v) => !v)}
                className="px-2 py-1 text-[11px] sm:text-xs text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded transition-colors font-medium"
                aria-label="Playback speed"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 bg-zinc-900/95 backdrop-blur rounded-lg shadow-xl border border-white/10 min-w-[80px] z-50">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/10 transition-colors ${
                        playbackRate === rate ? 'text-purple-400 font-bold' : 'text-white/80'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Previous video */}
            {hasMultiple && (
              <button onClick={playPrev} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label="Previous video" title="Previous Video (P)">
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {/* Next video */}
            {hasMultiple && (
              <button onClick={playNext} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label="Next video" title="Next Video (N)">
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* PiP (HTML5 only) */}
            {!source.isYouTube && typeof document !== 'undefined' && 'pictureInPictureEnabled' in document && (
              <button onClick={togglePiP} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label="Picture in Picture">
                <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 text-white hover:text-white/80 transition-colors" aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
