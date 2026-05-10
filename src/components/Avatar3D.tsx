'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────── Pure CSS 3D Robot Mascot ───────── */
export default function Avatar3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showSpeech, setShowSpeech] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rx = Math.max(-1, Math.min(1, (e.clientX - cx) / 400));
    const ry = Math.max(-1, Math.min(1, (e.clientY - cy) / 400));
    setMousePos({ x: rx, y: ry });
    setTilt({ x: ry * 10, y: -rx * 10 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 300);
    const t2 = setTimeout(() => setShowSpeech(true), 1600);
    const t3 = setTimeout(() => setShowSpeech(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const ex = mousePos.x * 4;
  const ey = mousePos.y * 3;

  return (
    <div ref={containerRef} className="relative flex flex-col items-center select-none">
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18, mass: 0.9 }}
            className="relative"
          >
            {/* ── Outer Glow ── */}
            <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />

            {/* ── 3D Perspective Container ── */}
            <div
              className="relative transition-transform duration-300 ease-out"
              style={{
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* ── Antenna ── */}
              <div className="relative z-10 flex justify-center mb-[-8px]">
                <div className="w-1.5 h-6 bg-gradient-to-b from-amber-300 to-violet-400 rounded-full" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-3 w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-yellow-400/50"
                />
              </div>

              {/* ── Robot Head ── */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-[2.5rem] bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 shadow-2xl shadow-purple-600/40 overflow-visible">
                {/* Head shine / highlight */}
                <div className="absolute top-3 left-4 w-[40%] h-[25%] bg-white/20 rounded-full blur-md" />
                {/* Bottom shadow for depth */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/15 to-transparent rounded-b-[2.5rem]" />

                {/* ── Left Eye ── */}
                <div className="absolute top-[28%] left-[14%] w-[30%] h-[28%] rounded-[1.2rem] bg-white shadow-inner overflow-hidden">
                  <div className="absolute inset-[3px] rounded-[0.9rem] bg-gradient-to-br from-sky-100 to-white" />
                  <motion.div
                    className="absolute w-[48%] h-[48%] rounded-full bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 shadow-inner"
                    style={{
                      top: '50%',
                      left: '50%',
                      x: `calc(-50% + ${ex}px)`,
                      y: `calc(-50% + ${ey}px)`,
                      transition: 'x 0.12s ease-out, y 0.12s ease-out',
                    }}
                  >
                    <div className="absolute top-[12%] left-[18%] w-[38%] h-[38%] rounded-full bg-white/90" />
                    <div className="absolute bottom-[15%] right-[15%] w-[18%] h-[18%] rounded-full bg-white/40" />
                  </motion.div>
                </div>

                {/* ── Right Eye ── */}
                <div className="absolute top-[28%] right-[14%] w-[30%] h-[28%] rounded-[1.2rem] bg-white shadow-inner overflow-hidden">
                  <div className="absolute inset-[3px] rounded-[0.9rem] bg-gradient-to-br from-sky-100 to-white" />
                  <motion.div
                    className="absolute w-[48%] h-[48%] rounded-full bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 shadow-inner"
                    style={{
                      top: '50%',
                      left: '50%',
                      x: `calc(-50% + ${ex}px)`,
                      y: `calc(-50% + ${ey}px)`,
                      transition: 'x 0.12s ease-out, y 0.12s ease-out',
                    }}
                  >
                    <div className="absolute top-[12%] left-[18%] w-[38%] h-[38%] rounded-full bg-white/90" />
                    <div className="absolute bottom-[15%] right-[15%] w-[18%] h-[18%] rounded-full bg-white/40" />
                  </motion.div>
                </div>

                {/* ── Cute Eyebrows ── */}
                <div className="absolute top-[22%] left-[18%] w-[24%] h-[5%] rounded-t-full bg-violet-700/40" />
                <div className="absolute top-[22%] right-[18%] w-[24%] h-[5%] rounded-t-full bg-violet-700/40" />

                {/* ── Cheek Blush ── */}
                <div className="absolute top-[52%] left-[6%] w-[16%] h-[10%] rounded-full bg-pink-400/30 blur-sm" />
                <div className="absolute top-[52%] right-[6%] w-[16%] h-[10%] rounded-full bg-pink-400/30 blur-sm" />

                {/* ── Nose (tiny) ── */}
                <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[6%] h-[5%] rounded-full bg-violet-600/30" />

                {/* ── Mouth / Smile ── */}
                <div className="absolute top-[62%] left-1/2 -translate-x-1/2 w-[24%] h-[10%]">
                  <div className="w-full h-full rounded-b-full bg-gradient-to-b from-rose-300 to-rose-400/60 shadow-inner" />
                </div>

                {/* ── Ear Panels ── */}
                <div className="absolute top-[35%] -left-2 w-3 h-10 bg-gradient-to-b from-violet-400 to-purple-600 rounded-l-lg shadow-md" />
                <div className="absolute top-[35%] -right-2 w-3 h-10 bg-gradient-to-b from-violet-400 to-purple-600 rounded-r-lg shadow-md" />

                {/* ── Waving Hand (Right) ── */}
                <div className="absolute -right-6 sm:-right-8 top-[25%] z-20">
                  <div className="animate-wave" style={{ transformOrigin: 'bottom left' }}>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-300 via-purple-300 to-fuchsia-300 shadow-lg border-2 border-white/30 flex items-center justify-center">
                      <span className="text-xl sm:text-2xl">✋</span>
                    </div>
                    {/* Arm */}
                    <div className="absolute bottom-[-14px] left-0 w-2.5 h-5 bg-gradient-to-b from-purple-300 to-violet-400 rounded-b-md" />
                  </div>
                </div>

                {/* ── Left Hand (static wave pose) ── */}
                <div className="absolute -left-6 sm:-left-8 top-[30%] z-20">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-300 via-purple-300 to-fuchsia-300 shadow-lg border-2 border-white/30 flex items-center justify-center">
                    <span className="text-lg sm:text-xl">🤚</span>
                  </div>
                  <div className="w-2.5 h-4 bg-gradient-to-b from-purple-300 to-violet-400 rounded-b-md" />
                </div>
              </div>

              {/* ── Robot Body ── */}
              <div className="relative mx-auto w-[70%] h-10 sm:h-12 bg-gradient-to-b from-purple-500 via-violet-500 to-purple-600 rounded-b-2xl shadow-lg -mt-1 overflow-hidden">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[50%] h-[40%] bg-gradient-to-b from-amber-300 to-yellow-400 rounded-lg shadow-inner flex items-center justify-center">
                  <span className="text-[8px] sm:text-[9px] font-bold text-amber-900 tracking-wider">AI</span>
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>

            {/* ── Name Tag ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-3 text-center"
            >
              <p className="text-white font-bold text-sm sm:text-base md:text-lg drop-shadow-lg">
                Pranali AI
                <span className="text-yellow-300 font-normal ml-1 text-xs sm:text-sm">(प्रणाली)</span>
              </p>
              <p className="text-white/50 text-[10px] sm:text-xs mt-0.5">Your AI Learning Assistant</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speech Bubble ── */}
      <AnimatePresence>
        {showSpeech && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="mt-5 relative max-w-[260px] sm:max-w-[300px]"
          >
            <div className="relative bg-white rounded-2xl px-4 py-3 shadow-xl border border-purple-200/60">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-purple-200/60" />
              <p className="text-sm sm:text-base font-bold text-purple-700 text-center leading-snug">
                Hello! 👋 Welcome to{' '}
                <span className="text-red-500" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>Impact Computers</span>
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Ask me anything about our courses!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
