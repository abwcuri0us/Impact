'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Premium 3D AI Robot Avatar — Holographic Assistant
   Enhanced SVG + CSS 3D transforms + Mouse-tracking perspective
   States: 'idle' | 'greeting' | 'talking' | 'thinking'
   ═══════════════════════════════════════════════════════════════ */

interface AIRobotAvatarProps {
  state?: 'idle' | 'greeting' | 'talking' | 'thinking';
  size?: number;
  onGreetingDone?: () => void;
  onInteract?: () => void;
}

/* ── JSON Animation Configuration ── */
const ANIMATION_CONFIG = {
  float: { amplitude: 8, duration: 4, easing: 'ease-in-out' },
  bounce: { amplitude: 12, duration: 0.5, repeats: 4 },
  blink: { interval: 5000, duration: 200 },
  antenna: { sway: 8, duration: 3 },
  particles: { count: 16, floatRange: 45 },
  hologram: { shimmerSpeed: 4, opacity: 0.08 },
  voiceWave: { bars: 5, maxHeight: 14, speed: 0.25 },
  glow: { pulseSpeed: 2.5, opacityRange: [0.3, 0.8] },
};

export default function AIRobotAvatar({
  state = 'idle',
  size = 200,
  onGreetingDone,
  onInteract,
}: AIRobotAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showVoiceWave, setShowVoiceWave] = useState(false);

  useEffect(() => {
    if (state === 'greeting' && onGreetingDone) {
      timerRef.current = setTimeout(onGreetingDone, 6000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, onGreetingDone]);

  useEffect(() => {
    setShowVoiceWave(state === 'talking' || state === 'greeting');
  }, [state]);

  /* ── 3D Mouse Tracking ── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setTilt({ x: Math.max(-15, Math.min(15, y)), y: Math.max(-15, Math.min(15, x)) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const isTalking = state === 'talking' || state === 'greeting';
  const isThinking = state === 'thinking';

  // Generate floating particles
  const particles = useMemo(() => {
    return Array.from({ length: ANIMATION_CONFIG.particles.count }, (_, i) => ({
      id: i,
      cx: 30 + Math.sin(i * 1.7) * 70 + 70,
      cy: 25 + Math.cos(i * 2.3) * 80 + 80,
      r: 1 + Math.random() * 2.5,
      delay: i * 0.25,
      dur: 2.5 + Math.random() * 3,
      color: ['#A78BFA', '#C4B5FD', '#818CF8', '#67E8F9', '#F0ABFC'][i % 5],
    }));
  }, []);

  // Voice wave bars
  const voiceBars = useMemo(() => {
    return Array.from({ length: ANIMATION_CONFIG.voiceWave.bars }, (_, i) => ({
      id: i,
      x: 82 + i * 9,
      delay: i * 0.08,
      height: 4 + Math.random() * ANIMATION_CONFIG.voiceWave.maxHeight,
    }));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      onClick={onInteract}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        fontSize: 0,
        perspective: '800px',
      }}
    >
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          viewBox="0 0 200 240"
          width={size}
          height={size * 1.2}
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 24px rgba(99,102,241,0.3))' }}
        >
          <defs>
            {/* ── Gradients ── */}
            <linearGradient id="bodyGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="30%" stopColor="#6366F1" />
              <stop offset="70%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
            <linearGradient id="bodyHighlight3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="screenGrad3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="armGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="neckGrad3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="antennaGrad3D" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#C4B5FD" />
            </linearGradient>
            <linearGradient id="chestGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>

            {/* ── Radial gradients ── */}
            <radialGradient id="eyeGlow3D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#67E8F9" stopOpacity="1" />
              <stop offset="30%" stopColor="#22D3EE" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="chestGlow3D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="antennaBulb3D" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#F5D0FE" />
              <stop offset="30%" stopColor="#E879F9" />
              <stop offset="60%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#A21CAF" />
            </radialGradient>
            <radialGradient id="cheekGlow3D" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="bodyShadow3D" cx="50%" cy="100%" r="70%">
              <stop offset="0%" stopColor="#312E81" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
            </radialGradient>

            {/* ── Filters ── */}
            <filter id="softGlow3D" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow3D" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow3D" x="-20%" y="-10%" width="140%" height="150%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#312E81" floodOpacity="0.4" />
            </filter>
            <filter id="innerShadow3D">
              <feComponentTransfer in="SourceAlpha">
                <feFuncA type="table" tableValues="1 0" />
              </feComponentTransfer>
              <feGaussianBlur stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feFlood floodColor="#020617" floodOpacity="0.6" result="color" />
              <feComposite in2="offsetblur" operator="in" />
              <feComposite in2="SourceAlpha" operator="in" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode />
              </feMerge>
            </filter>
            <filter id="hologramFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise">
                <animate attributeName="seed" from="1" to="100" dur="10s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
            </filter>

            {/* ── Clip paths ── */}
            <clipPath id="screenClip3D">
              <rect x="72" y="68" width="56" height="42" rx="14" />
            </clipPath>
          </defs>

          {/* ═══════════════════════════════════════════════════
              FLOATING PARTICLES
              ═══════════════════════════════════════════════════ */}
          {particles.map((p) => (
            <circle
              key={p.id}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={p.color}
              opacity="0"
              style={{
                animation: `particleFloat3D ${p.dur}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}

          {/* ═══════════════════════════════════════════════════
              HOLOGRAPHIC GROUND RINGS
              ═══════════════════════════════════════════════════ */}
          <ellipse
            cx="100" cy="210" rx="55" ry="8"
            fill="none" stroke="#6366F1" strokeWidth="1.5" opacity="0.25"
            style={{ animation: 'ringPulse3D 3s ease-in-out infinite' }}
          />
          <ellipse
            cx="100" cy="210" rx="40" ry="5"
            fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.15"
            style={{ animation: 'ringPulse3D 3s ease-in-out infinite 1s' }}
          />
          <ellipse
            cx="100" cy="210" rx="25" ry="3"
            fill="none" stroke="#A78BFA" strokeWidth="0.5" opacity="0.1"
            style={{ animation: 'ringPulse3D 3s ease-in-out infinite 2s' }}
          />

          {/* ═══════════════════════════════════════════════════
              MAIN FLOATING GROUP
              ═══════════════════════════════════════════════════ */}
          <g
            style={{
              transformOrigin: '100px 120px',
              animation: state === 'greeting'
                ? 'robotBounce3D 0.5s ease-in-out 4, robotFloat3D 4s ease-in-out infinite'
                : 'robotFloat3D 4s ease-in-out infinite',
            }}
          >
            {/* ─── ANTENNA ─── */}
            <g style={{ transformOrigin: '100px 52px', animation: 'antennaSway3D 3s ease-in-out infinite' }}>
              <line x1="100" y1="52" x2="100" y2="28" stroke="url(#antennaGrad3D)" strokeWidth="3.5" strokeLinecap="round" />
              {/* Antenna glow ring */}
              <circle cx="100" cy="24" r="10" fill="#E879F9" opacity="0.15"
                style={{ animation: 'antennaPulse3D 2s ease-in-out infinite' }} />
              <circle cx="100" cy="24" r="7" fill="url(#antennaBulb3D)" filter="url(#softGlow3D)"
                style={{ animation: 'antennaPulse3D 2s ease-in-out infinite' }} />
              <circle cx="98" cy="21" r="2.5" fill="white" opacity="0.6" />
              <circle cx="96" cy="23" r="1" fill="white" opacity="0.3" />
            </g>

            {/* ─── SIDE PANELS (ears with LED strips) ─── */}
            {/* Left ear */}
            <g style={{ transformOrigin: '62px 84px', animation: 'earBounce3D 5s ease-in-out infinite' }}>
              <rect x="46" y="74" width="16" height="30" rx="6" fill="url(#armGrad3D)" stroke="#818CF8" strokeWidth="0.5" />
              <rect x="49" y="79" width="10" height="3" rx="1.5" fill="#A78BFA" opacity="0.6" style={{ animation: 'ledPulse3D 2s ease-in-out infinite' }} />
              <rect x="49" y="85" width="10" height="3" rx="1.5" fill="#A78BFA" opacity="0.4" style={{ animation: 'ledPulse3D 2s ease-in-out infinite 0.5s' }} />
              <rect x="49" y="91" width="10" height="3" rx="1.5" fill="#A78BFA" opacity="0.2" style={{ animation: 'ledPulse3D 2s ease-in-out infinite 1s' }} />
            </g>
            {/* Right ear */}
            <g style={{ transformOrigin: '138px 84px', animation: 'earBounce3D 5s ease-in-out infinite 2.5s' }}>
              <rect x="138" y="74" width="16" height="30" rx="6" fill="url(#armGrad3D)" stroke="#818CF8" strokeWidth="0.5" />
              <rect x="141" y="79" width="10" height="3" rx="1.5" fill="#A78BFA" opacity="0.6" style={{ animation: 'ledPulse3D 2s ease-in-out infinite 0.3s' }} />
              <rect x="141" y="85" width="10" height="3" rx="1.5" fill="#A78BFA" opacity="0.4" style={{ animation: 'ledPulse3D 2s ease-in-out infinite 0.8s' }} />
              <rect x="141" y="91" width="10" height="3" rx="1.5" fill="#A78BFA" opacity="0.2" style={{ animation: 'ledPulse3D 2s ease-in-out infinite 1.3s' }} />
            </g>

            {/* ─── HEAD ─── */}
            <rect
              x="58" y="46" width="84" height="86" rx="32"
              fill="url(#bodyGrad3D)"
              stroke="#818CF8"
              strokeWidth="1.5"
              filter="url(#shadow3D)"
            />
            {/* Head top 3D highlight */}
            <rect x="76" y="50" width="48" height="16" rx="8" fill="url(#bodyHighlight3D)" />
            {/* Head side shadow for 3D depth */}
            <rect x="58" y="80" width="8" height="40" rx="4" fill="#312E81" opacity="0.15" />

            {/* ─── FACE SCREEN ─── */}
            <rect x="72" y="68" width="56" height="42" rx="14" fill="url(#screenGrad3D)" filter="url(#innerShadow3D)" />

            {/* Screen scanline effect */}
            <g clipPath="url(#screenClip3D)" opacity="0.04">
              {[68, 72, 76, 80, 84, 88, 92, 96, 100, 104, 108].map((y) => (
                <line key={y} x1="72" y1={y} x2="128" y2={y} stroke="white" strokeWidth="0.5" />
              ))}
            </g>

            {/* ─── EYES ─── */}
            {isThinking ? (
              <g>
                {/* Thinking eyes — pulsing dots */}
                <circle cx="86" cy="82" r="4" fill="#67E8F9" opacity="0.6"
                  style={{ animation: 'thinkPulse3D 1.2s ease-in-out infinite' }} filter="url(#softGlow3D)" />
                <circle cx="114" cy="82" r="4" fill="#67E8F9" opacity="0.6"
                  style={{ animation: 'thinkPulse3D 1.2s ease-in-out infinite 0.3s' }} filter="url(#softGlow3D)" />
                {/* Thinking dots */}
                <circle cx="92" cy="72" r="2" fill="#C4B5FD"
                  style={{ animation: 'thinkPulse3D 1.2s ease-in-out infinite 0.5s' }} />
                <circle cx="100" cy="68" r="2" fill="#E879F9"
                  style={{ animation: 'thinkPulse3D 1.2s ease-in-out infinite 0.8s' }} />
                <circle cx="108" cy="72" r="2" fill="#C4B5FD"
                  style={{ animation: 'thinkPulse3D 1.2s ease-in-out infinite 1.1s' }} />
              </g>
            ) : (
              <>
                {/* Left eye */}
                <g filter="url(#softGlow3D)">
                  <circle cx="86" cy="83" r="14" fill="url(#eyeGlow3D)" opacity="0.25" />
                  <ellipse cx="86" cy="83" rx="11" ry={isTalking ? 9.5 : 11} fill="#0E7490"
                    style={{ animation: 'eyeBlink3D 5s ease-in-out infinite' }} />
                  <circle cx="86" cy="83" r="7" fill="#22D3EE" />
                  <circle cx="88" cy="81" r="4.5" fill="#0891B2" />
                  <circle cx="89" cy="80" r="3" fill="#164E63" />
                  {/* Highlights */}
                  <circle cx="91" cy="78" r="2.5" fill="white" opacity="0.9" />
                  <circle cx="83" cy="86" r="1.2" fill="white" opacity="0.3" />
                </g>
                {/* Right eye */}
                <g filter="url(#softGlow3D)">
                  <circle cx="114" cy="83" r="14" fill="url(#eyeGlow3D)" opacity="0.25" />
                  <ellipse cx="114" cy="83" rx="11" ry={isTalking ? 9.5 : 11} fill="#0E7490"
                    style={{ animation: 'eyeBlink3D 5s ease-in-out infinite 0.15s' }} />
                  <circle cx="114" cy="83" r="7" fill="#22D3EE" />
                  <circle cx="116" cy="81" r="4.5" fill="#0891B2" />
                  <circle cx="117" cy="80" r="3" fill="#164E63" />
                  {/* Highlights */}
                  <circle cx="119" cy="78" r="2.5" fill="white" opacity="0.9" />
                  <circle cx="111" cy="86" r="1.2" fill="white" opacity="0.3" />
                </g>
              </>
            )}

            {/* ─── MOUTH ─── */}
            <g>
              {isTalking ? (
                <>
                  <ellipse cx="100" cy="100" rx="10" ry="5.5" fill="#0F172A"
                    style={{ animation: 'mouthTalk3D 0.25s ease-in-out infinite' }} />
                  <ellipse cx="100" cy="100" rx="7" ry="3.5" fill="#6366F1" opacity="0.3" />
                  {/* Voice wave visualization */}
                  {showVoiceWave && (
                    <g style={{ animation: 'voiceFade3D 0.3s ease-in-out infinite alternate' }}>
                      {voiceBars.map((bar) => (
                        <rect key={bar.id}
                          x={bar.x} y={105}
                          width="3" rx="1.5"
                          fill="#22D3EE" opacity="0.5"
                          style={{
                            animation: `voiceBar3D 0.4s ease-in-out ${bar.delay}s infinite alternate`,
                          }}
                        />
                      ))}
                    </g>
                  )}
                </>
              ) : isThinking ? (
                <>
                  <ellipse cx="100" cy="99" rx="4" ry="4" fill="#0F172A" />
                  <ellipse cx="100" cy="99" rx="2.5" ry="2.5" fill="#6366F1" opacity="0.2" />
                </>
              ) : (
                <path
                  d="M 89 98 Q 100 106 111 98"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              )}
            </g>

            {/* ─── CHEEKS ─── */}
            <circle cx="71" cy="93" r="7" fill="url(#cheekGlow3D)"
              style={{ animation: 'cheekGlow3D 3.5s ease-in-out infinite' }} />
            <circle cx="129" cy="93" r="7" fill="url(#cheekGlow3D)"
              style={{ animation: 'cheekGlow3D 3.5s ease-in-out infinite 1.5s' }} />

            {/* ─── NECK ─── */}
            <rect x="90" y="130" width="20" height="10" rx="4" fill="url(#neckGrad3D)" />
            <rect x="92" y="132" width="16" height="2" rx="1" fill="#818CF8" opacity="0.25" />
            <rect x="92" y="136" width="16" height="2" rx="1" fill="#818CF8" opacity="0.15" />

            {/* ─── BODY ─── */}
            <rect
              x="66" y="138" width="68" height="54" rx="20"
              fill="url(#bodyGrad3D)"
              stroke="#818CF8"
              strokeWidth="1.5"
              filter="url(#shadow3D)"
            />
            {/* Body highlight */}
            <rect x="78" y="142" width="44" height="10" rx="5" fill="url(#bodyHighlight3D)" opacity="0.7" />
            {/* Body side shadow */}
            <rect x="66" y="155" width="8" height="30" rx="4" fill="#312E81" opacity="0.12" />
            <rect x="126" y="155" width="8" height="30" rx="4" fill="#312E81" opacity="0.08" />

            {/* ─── CHEST LIGHT ─── */}
            <circle cx="100" cy="162" r="10" fill="#0F172A" stroke="#1E293B" strokeWidth="1.5" />
            <circle cx="100" cy="162" r="6"
              fill={isTalking ? '#34D399' : isThinking ? '#FBBF24' : '#22D3EE'}
              filter="url(#softGlow3D)"
              style={{ animation: 'chestPulse3D 2.5s ease-in-out infinite' }}
            />
            <circle cx="97" cy="159" r="2" fill="white" opacity="0.6" />
            <circle cx="100" cy="162" r="12" fill="url(#chestGlow3D)" opacity="0.35"
              style={{ animation: 'chestGlowPulse3D 2.5s ease-in-out infinite' }} />

            {/* ─── BODY CIRCUIT DETAILS ─── */}
            <line x1="78" y1="150" x2="78" y2="178" stroke="#818CF8" strokeWidth="0.5" opacity="0.15" />
            <line x1="122" y1="150" x2="122" y2="178" stroke="#818CF8" strokeWidth="0.5" opacity="0.15" />
            <circle cx="78" cy="168" r="2" fill="#818CF8" opacity="0.25" style={{ animation: 'ledPulse3D 3s ease-in-out infinite' }} />
            <circle cx="122" cy="164" r="2" fill="#818CF8" opacity="0.25" style={{ animation: 'ledPulse3D 3s ease-in-out infinite 1.5s' }} />
            <circle cx="78" cy="178" r="1.5" fill="#818CF8" opacity="0.15" />
            <circle cx="122" cy="178" r="1.5" fill="#818CF8" opacity="0.15" />

            {/* ─── ARMS ─── */}
            {/* Left arm */}
            <g style={{ transformOrigin: '66px 150px', animation: isTalking ? 'armSwingL3D 0.4s ease-in-out infinite' : 'armIdle3D 5s ease-in-out infinite' }}>
              <rect x="38" y="146" width="30" height="16" rx="8" fill="url(#armGrad3D)" stroke="#818CF8" strokeWidth="0.5" />
              <circle cx="38" cy="154" r="9" fill="#6366F1" stroke="#818CF8" strokeWidth="0.5" />
              <circle cx="36" cy="152" r="2.5" fill="#A78BFA" opacity="0.35" />
              <rect x="28" y="147" width="5" height="4" rx="2" fill="#6366F1" stroke="#818CF8" strokeWidth="0.3" />
              <rect x="27" y="153" width="5" height="4" rx="2" fill="#6366F1" stroke="#818CF8" strokeWidth="0.3" />
              <rect x="29" y="159" width="5" height="4" rx="2" fill="#6366F1" stroke="#818CF8" strokeWidth="0.3" />
            </g>
            {/* Right arm */}
            <g style={{ transformOrigin: '134px 150px', animation: isTalking ? 'armSwingR3D 0.4s ease-in-out infinite 0.08s' : 'armIdle3D 5s ease-in-out infinite 2.5s' }}>
              <rect x="132" y="146" width="30" height="16" rx="8" fill="url(#armGrad3D)" stroke="#818CF8" strokeWidth="0.5" />
              <circle cx="162" cy="154" r="9" fill="#6366F1" stroke="#818CF8" strokeWidth="0.5" />
              <circle cx="160" cy="152" r="2.5" fill="#A78BFA" opacity="0.35" />
              <rect x="167" y="147" width="5" height="4" rx="2" fill="#6366F1" stroke="#818CF8" strokeWidth="0.3" />
              <rect x="168" y="153" width="5" height="4" rx="2" fill="#6366F1" stroke="#818CF8" strokeWidth="0.3" />
              <rect x="166" y="159" width="5" height="4" rx="2" fill="#6366F1" stroke="#818CF8" strokeWidth="0.3" />
            </g>

            {/* ─── SPEECH BUBBLES (when talking) ─── */}
            {isTalking && (
              <g style={{ animation: 'speechPop3D 0.6s ease-in-out infinite' }}>
                <circle cx="168" cy="58" r="4.5" fill="#818CF8" opacity="0.5" />
                <circle cx="178" cy="48" r="6" fill="#A78BFA" opacity="0.4" />
                <circle cx="185" cy="35" r="8" fill="#C4B5FD" opacity="0.3" />
              </g>
            )}

            {/* ─── HOLOGRAPHIC SHIMMER EFFECT ─── */}
            <rect x="58" y="46" width="84" height="86" rx="32" fill="white" opacity="0"
              style={{ animation: 'hologramShimmer3D 4s ease-in-out infinite' }}
            />
          </g>

          {/* ─── GROUND SHADOW ─── */}
          <ellipse cx="100" cy="215" rx="40" ry="6" fill="#312E81" opacity="0.2"
            style={{ animation: 'groundShadow3D 4s ease-in-out infinite' }}
          />
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════════
          KEYFRAME ANIMATIONS
          ═══════════════════════════════════════════════════ */}
      <style jsx>{`
        /* ── Float & Bounce ── */
        @keyframes robotFloat3D {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes robotBounce3D {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(8deg) translateY(-6px); }
          75% { transform: rotate(-8deg) translateY(-6px); }
        }

        /* ── Antenna ── */
        @keyframes antennaSway3D {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(7deg); }
          70% { transform: rotate(-7deg); }
        }
        @keyframes antennaPulse3D {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* ── Eyes ── */
        @keyframes eyeBlink3D {
          0%, 42%, 48%, 100% { transform: scaleY(1); }
          45% { transform: scaleY(0.06); }
        }
        @keyframes thinkPulse3D {
          0%, 100% { opacity: 0.15; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.3); }
        }

        /* ── Mouth ── */
        @keyframes mouthTalk3D {
          0%   { ry: 5.5; rx: 10; }
          20%  { ry: 8; rx: 7; }
          40%  { ry: 4.5; rx: 11; }
          60%  { ry: 9; rx: 8; }
          80%  { ry: 3.5; rx: 12; }
          100% { ry: 5.5; rx: 10; }
        }

        /* ── Voice bars ── */
        @keyframes voiceBar3D {
          0% { height: 2px; opacity: 0.3; }
          100% { height: 14px; opacity: 0.7; }
        }
        @keyframes voiceFade3D {
          0% { opacity: 0.4; }
          100% { opacity: 0.8; }
        }

        /* ── Cheeks ── */
        @keyframes cheekGlow3D {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.55; }
        }

        /* ── Chest ── */
        @keyframes chestPulse3D {
          0%, 100% { opacity: 0.6; r: 6; }
          50% { opacity: 1; r: 7; }
        }
        @keyframes chestGlowPulse3D {
          0%, 100% { opacity: 0.15; r: 12; }
          50% { opacity: 0.45; r: 15; }
        }

        /* ── Arms ── */
        @keyframes armIdle3D {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2.5deg); }
        }
        @keyframes armSwingL3D {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        @keyframes armSwingR3D {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }

        /* ── Ears ── */
        @keyframes earBounce3D {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }

        /* ── LED pulses ── */
        @keyframes ledPulse3D {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.7; }
        }

        /* ── Speech bubbles ── */
        @keyframes speechPop3D {
          0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateY(-6px) scale(1.2); }
        }

        /* ── Holographic shimmer ── */
        @keyframes hologramShimmer3D {
          0%, 100% { opacity: 0; transform: translateX(-84px); }
          40% { opacity: 0.08; }
          60% { opacity: 0.08; }
          100% { opacity: 0; transform: translateX(84px); }
        }

        /* ── Particles ── */
        @keyframes particleFloat3D {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          15%  { opacity: 0.6; transform: translateY(-10px) scale(1); }
          80%  { opacity: 0.25; transform: translateY(-35px) scale(0.7); }
          100% { opacity: 0; transform: translateY(-50px) scale(0); }
        }

        /* ── Ground shadow ── */
        @keyframes groundShadow3D {
          0%, 100% { opacity: 0.2; rx: 40; }
          50% { opacity: 0.08; rx: 35; }
        }

        /* ── Holographic rings ── */
        @keyframes ringPulse3D {
          0%, 100% { opacity: 0.15; rx: 55; ry: 8; }
          50% { opacity: 0.35; rx: 60; ry: 10; }
        }
      `}</style>
    </div>
  );
}
