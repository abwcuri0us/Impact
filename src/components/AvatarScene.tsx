'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════ */
/*   TYPES */
/* ═══════════════════════════════════════════════════════════════ */
export type AvatarState = 'loading' | 'greeting' | 'idle' | 'talking';

interface AvatarSceneProps {
  state?: AvatarState;
  onGreetingDone?: () => void;
  onInteract?: () => void;
}

/* ═══════════════════════════════════════════════════════════════ */
/*   FLOATING PARTICLES (CSS-based sparkle effects)
     ═══════════════════════════════════════════════════════════════ */
function Sparkles() {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FF69B4' : '#A78BFA',
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: '50%' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animation: `sparkleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*   ANIMATED EYE COMPONENT
     ═══════════════════════════════════════════════════════════════ */
function AnimatedEye({ side, isTalking, isGreeting }: { side: 'left' | 'right'; isTalking: boolean; isGreeting: boolean }) {
  const [blink, setBlink] = useState(false);

  // Random blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 2500 + Math.random() * 2500);
    return () => clearInterval(interval);
  }, []);

  // Happy squint during greeting
  const scaleY = blink ? 0.1 : isGreeting ? 0.7 : 1;

  return (
    <g>
      {/* Eye white */}
      <motion.ellipse
        cx={side === 'left' ? -18 : 18}
        cy={-4}
        rx={14}
        ry={scaleY * 16}
        fill="white"
        style={{ originX: side === 'left' ? '18px' : '18px', originY: '-4px' }}
        animate={{ ry: scaleY * 16 }}
        transition={{ duration: 0.15 }}
      />
      {/* Iris */}
      <motion.ellipse
        cx={side === 'left' ? -16 : 16}
        cy={-2}
        rx={9}
        ry={Math.max(1, scaleY * 10)}
        fill="#6366F1"
        style={{ originX: side === 'left' ? '16px' : '16px', originY: '-2px' }}
        animate={{ ry: Math.max(1, scaleY * 10) }}
        transition={{ duration: 0.15 }}
      />
      {/* Inner iris gradient */}
      <motion.ellipse
        cx={side === 'left' ? -16 : 16}
        cy={-2}
        rx={6}
        ry={Math.max(1, scaleY * 7)}
        fill="#818CF8"
        style={{ originX: side === 'left' ? '16px' : '16px', originY: '-2px' }}
        animate={{ ry: Math.max(1, scaleY * 7) }}
        transition={{ duration: 0.15 }}
      />
      {/* Pupil */}
      <motion.ellipse
        cx={side === 'left' ? -15 : 15}
        cy={-1}
        rx={4}
        ry={Math.max(0.5, scaleY * 4.5)}
        fill="#1E1B4B"
        style={{ originX: side === 'left' ? '15px' : '15px', originY: '-1px' }}
        animate={{ ry: Math.max(0.5, scaleY * 4.5) }}
        transition={{ duration: 0.15 }}
      />
      {!blink && (
        <>
          {/* Big highlight */}
          <circle cx={side === 'left' ? -20 : 12} cy={-8} r={3.5} fill="white" opacity={0.95} />
          {/* Small highlight */}
          <circle cx={side === 'left' ? -12 : 20} cy={1} r={2} fill="white" opacity={0.7} />
        </>
      )}
      {/* Eyelashes */}
      {!blink && (
        <motion.path
          d={`M ${side === 'left' ? -34 : 2} -18 Q ${side === 'left' ? -18 : 18} -28 ${side === 'left' ? -2 : 34} -18`}
          stroke="#4C1D95"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: isGreeting ? 0.5 : 1 }}
        />
      )}
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*   ANIMATED MOUTH COMPONENT
     ═══════════════════════════════════════════════════════════════ */
function AnimatedMouth({ state }: { state: AvatarState }) {
  if (state === 'talking') {
    return (
      <motion.g
        animate={{
          d: [
            'M -10 14 Q 0 18 10 14 Q 0 22 -10 14',   // small O
            'M -8 14 Q 0 24 8 14 Q 0 26 -8 14',        // big O
            'M -12 14 Q 0 16 12 14 Q 0 20 -12 14',     // smile wide
          ],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <motion.ellipse
          cx="0" cy="16" rx="9" ry="5"
          fill="#E11D48"
          animate={{
            ry: [4, 7, 3, 6, 4],
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Tongue hint */}
        <ellipse cx="0" cy="19" rx="5" ry="2.5" fill="#FB7185" opacity={0.6} />
      </motion.g>
    );
  }

  if (state === 'greeting') {
    return (
      <motion.g>
        <motion.path
          d="M -10 14 Q 0 22 10 14"
          stroke="#E11D48"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{
            d: [
              'M -10 14 Q 0 22 10 14',
              'M -8 14 Q 0 26 8 14',
              'M -10 14 Q 0 22 10 14',
            ],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.g>
    );
  }

  // Idle — gentle smile
  return (
    <motion.path
      d="M -10 14 Q 0 19 10 14"
      stroke="#E11D48"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      animate={{
        d: [
          'M -10 14 Q 0 19 10 14',
          'M -9 14 Q 0 17 9 14',
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*   WAVING HAND COMPONENT
     ═══════════════════════════════════════════════════════════════ */
function WavingHand({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <motion.g
      initial={{ x: 40, y: -10, rotate: 0 }}
      animate={{
        rotate: [0, -20, 15, -15, 10, -10, 0],
      }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
    >
      {/* Arm */}
      <line x1="0" y1="0" x2="28" y2="-30" stroke="#FDDCB5" strokeWidth="8" strokeLinecap="round" />
      {/* Palm */}
      <circle cx="30" cy="-32" r="9" fill="#FDDCB5" />
      {/* Fingers */}
      <motion.g animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}>
        <line x1="28" y1="-38" x2="26" y2="-50" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="32" y1="-39" x2="32" y2="-52" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="36" y1="-37" x2="38" y2="-49" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="38" y1="-33" x2="42" y2="-44" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
        {/* Thumb */}
        <line x1="24" y1="-30" x2="18" y2="-36" stroke="#FDDCB5" strokeWidth="3.5" strokeLinecap="round" />
      </motion.g>
    </motion.g>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*   MAIN AVATAR FACE SVG
     ═══════════════════════════════════════════════════════════════ */
function AvatarFace({ state }: { state: AvatarState }) {
  const isTalking = state === 'talking';
  const isGreeting = state === 'greeting';

  return (
    <motion.svg
      viewBox="-60 -60 120 120"
      className="w-full h-full drop-shadow-lg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Skin gradient — light ivory with warm-pink undertones */}
        <radialGradient id="skinGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFF1E6" />
          <stop offset="50%" stopColor="#FDE8D8" />
          <stop offset="100%" stopColor="#F8D0C0" />
        </radialGradient>
        {/* Cheek blush gradient */}
        <radialGradient id="blushGrad">
          <stop offset="0%" stopColor="#FFB0C0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFB0C0" stopOpacity="0" />
        </radialGradient>
        {/* Hair gradient */}
        <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        {/* Crown gradient */}
        <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Shadow filter */}
        <filter id="faceShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1" />
        </filter>
      </defs>

      <motion.g
        filter="url(#faceShadow)"
        animate={state === 'greeting' ? {
          y: [0, -4, 0],
          rotate: [0, -3, 3, 0],
        } : state === 'idle' ? {
          y: [0, -1.5, 0],
        } : {}}
        transition={{
          duration: state === 'greeting' ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* ══ BACK HAIR ══ */}
        <ellipse cx="0" cy="-8" rx="42" ry="44" fill="url(#hairGrad)" />
        {/* Hair sides flowing down */}
        <ellipse cx="-30" cy="12" rx="14" ry="30" fill="#F59E0B" opacity={0.9} />
        <ellipse cx="30" cy="12" rx="14" ry="30" fill="#F59E0B" opacity={0.9} />
        {/* Hair shine */}
        <ellipse cx="-8" cy="-28" rx="12" ry="6" fill="#FDE68A" opacity={0.4} transform="rotate(-15 -8 -28)" />

        {/* ══ FACE ══ */}
        <motion.ellipse
          cx="0" cy="0" rx="34" ry="38"
          fill="url(#skinGrad)"
          animate={isTalking ? {
            rx: [34, 33, 34],
          } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        />

        {/* ══ BANGS ══ */}
        <path d="M -28 -20 Q -18 -42 0 -38 Q 18 -42 28 -20 Q 18 -30 8 -26 Q 0 -32 -8 -26 Q -18 -30 -28 -20 Z" fill="url(#hairGrad)" />

        {/* ══ EYEBROWS ══ */}
        <motion.path
          d="M -26 -14 Q -18 -20 -10 -14"
          stroke="#B45309"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={isGreeting ? { d: 'M -26 -16 Q -18 -22 -10 -16' } : isTalking ? { d: ['M -26 -14 Q -18 -20 -10 -14', 'M -26 -12 Q -18 -18 -10 -12'] } : {}}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d="M 10 -14 Q 18 -20 26 -14"
          stroke="#B45309"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={isGreeting ? { d: 'M 10 -16 Q 18 -22 26 -16' } : isTalking ? { d: ['M 10 -14 Q 18 -20 26 -14', 'M 10 -12 Q 18 -18 26 -12'] } : {}}
          transition={{ duration: 0.3 }}
        />

        {/* ══ EYES ══ */}
        <AnimatedEye side="left" isTalking={isTalking} isGreeting={isGreeting} />
        <AnimatedEye side="right" isTalking={isTalking} isGreeting={isGreeting} />

        {/* ══ NOSE ══ */}
        <motion.ellipse
          cx="0" cy="6" rx="3" ry="2.5"
          fill="#F0C0AD"
          animate={isTalking ? { ry: [2.5, 3, 2.5] } : {}}
          transition={{ duration: 0.4, repeat: Infinity }}
        />

        {/* ══ MOUTH ══ */}
        <AnimatedMouth state={state} />

        {/* ══ CHEEK BLUSH ══ */}
        <motion.ellipse
          cx="-26" cy="8" rx="10" ry="7"
          fill="url(#blushGrad)"
          animate={{ opacity: isGreeting ? 0.8 : [0.4, 0.6, 0.4] }}
          transition={{ duration: isGreeting ? 0.3 : 2, repeat: isGreeting ? 0 : Infinity }}
        />
        <motion.ellipse
          cx="26" cy="8" rx="10" ry="7"
          fill="url(#blushGrad)"
          animate={{ opacity: isGreeting ? 0.8 : [0.4, 0.6, 0.4] }}
          transition={{ duration: isGreeting ? 0.3 : 2, repeat: isGreeting ? 0 : Infinity, delay: 0.5 }}
        />

        {/* ══ WAVING HAND ══ */}
        <WavingHand show={isGreeting} />
      </motion.g>

      {/* ══ CROWN (floating above head, always visible) ══ */}
      <motion.g
        animate={{
          y: [0, -2, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        filter="url(#softGlow)"
      >
        {/* Crown base */}
        <path
          d="M -16 -44 L -20 -56 L -10 -48 L 0 -60 L 10 -48 L 20 -56 L 16 -44 Z"
          fill="url(#crownGrad)"
          stroke="#D97706"
          strokeWidth="1"
        />
        {/* Crown gems */}
        <circle cx="0" cy="-50" r="2.5" fill="#EF4444" />
        <circle cx="-10" cy="-47" r="2" fill="#3B82F6" />
        <circle cx="10" cy="-47" r="2" fill="#3B82F6" />
        <circle cx="-18" cy="-49" r="1.5" fill="#A855F7" />
        <circle cx="18" cy="-49" r="1.5" fill="#A855F7" />
        {/* Crown band */}
        <rect x="-17" y="-45" width="34" height="4" rx="1" fill="#F59E0B" />
        <circle cx="-8" cy="-43" r="1.5" fill="#FBBF24" />
        <circle cx="0" cy="-43" r="1.5" fill="#FBBF24" />
        <circle cx="8" cy="-43" r="1.5" fill="#FBBF24" />
      </motion.g>
    </motion.svg>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*   AVATAR SCENE WRAPPER
     ═══════════════════════════════════════════════════════════════ */
export default function AvatarScene({
  state: externalState,
  onGreetingDone,
  onInteract,
}: AvatarSceneProps) {
  const [internalState, setInternalState] = useState<AvatarState>('loading');
  const [mounted, setMounted] = useState(false);

  const state = externalState || internalState;

  // Auto state machine when no external state
  useEffect(() => {
    if (externalState) return;
    const t1 = setTimeout(() => setMounted(true), 200);
    const t2 = setTimeout(() => setInternalState('greeting'), 800);
    const t3 = setTimeout(() => {
      setInternalState('idle');
      onGreetingDone?.();
    }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [externalState, onGreetingDone]);

  // Mount immediately when external state provided
  useEffect(() => {
    if (externalState) setMounted(true);
  }, [externalState]);

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={onInteract} style={{ minHeight: '100px' }}>
      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: 1; transform: translateY(-5px) scale(1); }
          80% { opacity: 0.6; transform: translateY(-15px) scale(0.8); }
          100% { transform: translateY(-25px) scale(0); opacity: 0; }
        }
        @keyframes auraGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3), 0 0 40px rgba(236, 72, 153, 0.15); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(236, 72, 153, 0.25); }
        }
        @keyframes borderSpin {
          from { --angle: 0deg; }
          to { --angle: 360deg; }
        }
      `}</style>

      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full h-full relative"
          >
            {/* Background glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(251, 191, 36, 0.15) 0%, rgba(168, 85, 247, 0.1) 40%, rgba(236, 72, 153, 0.08) 70%, transparent 100%)',
              }}
              animate={{
                opacity: state === 'greeting' ? [0.8, 1, 0.8] : state === 'talking' ? [0.6, 0.9, 0.6] : [0.5, 0.7, 0.5],
              }}
              transition={{ duration: state === 'greeting' ? 1.5 : state === 'talking' ? 0.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Animated gradient border ring */}
            <div
              className="absolute -inset-1 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #F59E0B, #EC4899, #8B5CF6, #3B82F6, #F59E0B)',
                animation: 'borderSpin 6s linear infinite',
                padding: '2px',
              }}
            >
              <div className="w-full h-full rounded-full bg-transparent" />
            </div>

            {/* Avatar face */}
            <div className="w-full h-full rounded-full overflow-hidden relative" style={{ animation: 'auraGlow 3s ease-in-out infinite' }}>
              <AvatarFace state={state} />
              <Sparkles />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading placeholder */}
      {!mounted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-14 h-14 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)',
              filter: 'blur(4px)',
            }}
          />
        </div>
      )}
    </div>
  );
}
