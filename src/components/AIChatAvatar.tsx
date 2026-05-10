'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MessageCircle, X, Send, Sparkles, Minimize2, Mic, MicOff, Volume2, VolumeX, Bot } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC IMPORT — AIRobotAvatar must be client-only (no SSR)
   ═══════════════════════════════════════════════════════════════ */
const AIRobotAvatar = dynamic(() => import('@/components/AIRobotAvatar'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse opacity-60 flex items-center justify-center">
        <Bot className="w-8 h-8 text-white" />
      </div>
    </div>
  ),
});

/* ═══════════════════════════════════════════════════════════════
   STRIP MARKDOWN FORMATTING — Clean AI text for plain display
   ═══════════════════════════════════════════════════════════════ */
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove underline markers
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove headings markers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```.*/g, '').trim())
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const WELCOME_MESSAGES = [
  "Hi there! Welcome to Impact Computers! 🤖",
  "I'm Pranali AI, your personal learning assistant.",
  "Ask me about courses, fees, timings, or anything!",
];

const QUICK_ACTIONS = [
  { label: 'Courses', message: 'What courses do you offer?' },
  { label: 'Fees', message: 'What are the course fees?' },
  { label: 'MS-CIT', message: 'Tell me about MS-CIT course' },
  { label: 'Contact', message: 'How can I contact you?' },
];

const QUICK_RESPONSES: Record<string, string> = {
  'What courses do you offer?':
    "We offer 13+ courses including MS-CIT, Advanced Tally Prime, Advanced Excel, CAO, CMS, Python, C/C++, DTP, and more! Which one interests you? 🤖",
  'What are the course fees?':
    "Our fees are very affordable! MS-CIT, Tally, CAO, and most courses have flexible installment options. Visit any branch or call 9768100649 for detailed fees. 💰",
  'Tell me about MS-CIT course':
    "MS-CIT (Maharashtra State Certificate in Information Technology) is our most popular government-certified course! It covers MS Office, Internet, email, and digital literacy. Duration: 2-3 months. Certification by MKCL. Great for jobs! 🎓",
  'How can I contact you?':
    "You can reach us at:\n📞 9768100649 / 8454044041\n📍 4 branches in Koparkhairne & Ghansoli\n🌐 Visit us anytime Mon-Sat, 7AM-10PM!\nOr fill our enquiry form for callback! 🤖",
};

const GREETING_SPEECH_TEXT = "Hello! Welcome to Impact Computers! How can I help you today?";

/* ═══════════════════════════════════════════════════════════════
   VOICE HELPERS
   ═══════════════════════════════════════════════════════════════ */
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { SpeechRecognition?: () => SpeechRecognitionInstance; webkitSpeechRecognition?: () => SpeechRecognitionInstance }).SpeechRecognition
    || (window as unknown as { SpeechRecognition?: () => SpeechRecognitionInstance; webkitSpeechRecognition?: () => SpeechRecognitionInstance }).webkitSpeechRecognition
    || null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function AIChatAvatar() {
  /* ── State ── */
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [avatarPhase, setAvatarPhase] = useState<'loading' | 'greeting' | 'chat' | 'idle' | 'hidden'>('loading');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  const sessionIdRef = useRef<string>('');

  /* ── Generate session ID ── */
  useEffect(() => {
    let sid = localStorage.getItem('pranali_chat_session_id');
    if (!sid) {
      sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('pranali_chat_session_id', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  /* ── Load chat history from Supabase ── */
  useEffect(() => {
    const loadHistory = async () => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      try {
        const res = await fetch(`/api/chat/history?sessionId=${encodeURIComponent(sid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m: { role: string; content: string }) => ({
              role: m.role === 'assistant' ? 'ai' : m.role,
              text: m.content,
            })));
          }
        }
      } catch {
        // Chat history loading failed silently — chat still works
      }
    };
    loadHistory();
  }, []);

  /* ── Save chat history to Supabase ── */
  const saveHistory = useCallback(async (msgs: { role: string; text: string }[]) => {
    const sid = sessionIdRef.current;
    if (!sid || msgs.length === 0) return;
    try {
      await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          messages: msgs.map(m => ({
            role: m.role === 'ai' ? 'assistant' : m.role,
            content: m.text,
          })),
        }),
      });
    } catch {
      // Save failed silently
    }
  }, []);

  /* ── Refs ── */
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ═══════════════════════════════════════════════════════════════
     VOICE SETUP
     ═══════════════════════════════════════════════════════════════ */

  // Load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) setVoices(available);
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Get preferred female voice — improved cross-platform detection
  const getPreferredVoice = useCallback((lang?: string) => {
    if (voices.length === 0) return null;
    const targetLang = lang || 'en';

    // Known female voice name patterns across platforms
    const knownFemaleNames = [
      'Google UK English Female',
      'Samantha', 'Victoria', 'Karen', 'Moira', 'Fiona', 'Tessa',
      'Allison', 'Susan', 'Zira', 'Hazel', 'Linda', 'Catherine',
      'Microsoft Zira',
    ];

    // Hindi female voice names
    const hindiFemaleNames = ['Google हिन्दी', 'Lekha', 'Swara'];

    const femaleVoiceFinders = [
      // 1. Exact match on known female voice names (English)
      ...knownFemaleNames.map(name => () => voices.find(v => v.name.includes(name) && v.lang.startsWith('en'))),

      // 2. Any voice with explicit "female" in the name (English)
      () => voices.find(v => v.name.toLowerCase().includes('female') && v.lang.startsWith('en')),

      // 3. Any voice with "woman" in the name (English)
      () => voices.find(v => v.name.toLowerCase().includes('woman') && v.lang.startsWith('en')),

      // 4. en-US voice that is NOT male
      () => voices.find(v => v.lang.startsWith('en-US') && !v.name.toLowerCase().includes('male')),

      // 5. Any English voice that is NOT male
      () => voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('male')),

      // 6. Any English voice as fallback
      () => voices.find(v => v.lang.startsWith('en')),

      // 7. Hindi: exact match on known female Hindi voices
      ...hindiFemaleNames.map(name => () => voices.find(v => v.name.includes(name) && v.lang.startsWith('hi'))),

      // 8. Hindi: any female-named voice
      () => voices.find(v => v.lang.startsWith('hi') && v.name.toLowerCase().includes('female')),

      // 9. Hindi: any hi-IN voice that is NOT male
      () => voices.find(v => v.lang.startsWith('hi') && !v.name.toLowerCase().includes('male')),

      // 10. Hindi: any hi-IN voice
      () => voices.find(v => v.lang.startsWith('hi')),

      // 11. Marathi: any mr-IN voice
      () => voices.find(v => v.lang.startsWith('mr')),

      // 12. Any other female voice
      () => voices.find(v => v.name.toLowerCase().includes('female')),

      // 13. First available voice
      () => voices[0],
    ];

    for (const finder of femaleVoiceFinders) {
      const voice = finder();
      if (voice) return voice;
    }
    return voices[0];
  }, [voices]);

  // Detect language from text (Devanagari = Hindi/Marathi)
  const detectLang = useCallback((text: string): string => {
    const devanagari = /[\u0900-\u097F]/;
    return devanagari.test(text) ? 'hi-IN' : 'en-IN';
  }, []);

  // Get voice for a specific language
  const getVoiceForLang = useCallback((lang: string) => {
    if (voices.length === 0) return null;
    const langPrefix = lang.split('-')[0]; // 'hi', 'mr', 'en'

    // 1. Exact language match — prefer female voice
    const femaleNames = ['Google', 'Samantha', 'Lekha', 'Swara', 'Zira', 'Allison', 'Karen', 'Moira'];
    const langVoices = voices.filter(v => v.lang.startsWith(langPrefix));

    // Prefer female-sounding voice for the language
    for (const name of femaleNames) {
      const found = langVoices.find(v => v.name.includes(name));
      if (found) return found;
    }
    // Any voice that doesn't sound male
    const nonMale = langVoices.find(v => !v.name.toLowerCase().includes('male'));
    if (nonMale) return nonMale;
    // Any voice for the language
    if (langVoices.length > 0) return langVoices[0];

    // Fallback to English if no matching voice
    return getPreferredVoice();
  }, [voices, getPreferredVoice]);

  // Speak a message aloud
  const speakText = useCallback((text: string, msgIndex?: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Strip markdown before speaking
    const cleanText = stripMarkdown(text);
    const lang = detectLang(cleanText);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    const voice = getVoiceForLang(lang);
    utterance.rate = 0.9;
    utterance.pitch = 1.35;
    if (voice) utterance.voice = voice;
    utterance.addEventListener('start', () => {
      console.log(`[Pranali AI] Speaking (${lang}) with voice: ${voice?.name || 'default'}`);
    });
    utterance.volume = 1.0;
    if (msgIndex !== undefined) {
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      setSpeakingIdx(msgIndex);
    }
    window.speechSynthesis.speak(utterance);
  }, [detectLang, getVoiceForLang]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeakingIdx(null);
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     SPEECH RECOGNITION (Microphone)
     ═══════════════════════════════════════════════════════════════ */
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  /* ═══════════════════════════════════════════════════════════════
     AUTO GREETING + SPEECH
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    const t1 = setTimeout(() => setAvatarPhase('greeting'), 300);
    const t2 = setTimeout(() => setShowGreeting(true), 1200);
    const t3 = setTimeout(() => setShowGreeting(false), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Greeting speech when voices are loaded
  useEffect(() => {
    if (voices.length > 0 && !hasGreeted && avatarPhase === 'greeting') {
      setHasGreeted(true);
      const utterance = new SpeechSynthesisUtterance(GREETING_SPEECH_TEXT);
      utterance.lang = 'en-IN';
      const voice = getPreferredVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.pitch = 1.35;
      utterance.volume = 1.0;
      window.speechSynthesis?.speak(utterance);
    }
  }, [voices, hasGreeted, avatarPhase, getPreferredVoice]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ═══════════════════════════════════════════════════════════════
     CHAT ACTIONS
     ═══════════════════════════════════════════════════════════════ */
  const openChat = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsOpen(true);
    setIsMinimized(false);
    setAvatarPhase('chat');
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const closeChat = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsOpen(false);
    setIsMinimized(false);
    setAvatarPhase('idle');
    setSpeakingIdx(null);
  }, []);

  const handleInteract = useCallback(() => {
    if (avatarPhase === 'greeting') openChat();
  }, [avatarPhase, openChat]);

  const handleGreetingDone = useCallback(() => {
    if (avatarPhase === 'greeting') {
      setAvatarPhase('idle');
    }
  }, [avatarPhase]);

  // Typewriter helper
  const typewriterEffect = useCallback((text: string) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);
    let idx = 0;
    typewriterRef.current = setInterval(() => {
      idx += 2;
      if (idx >= text.length) {
        idx = text.length;
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        typewriterRef.current = null;
        setIsTyping(false);
        // Save to Supabase after typewriter finishes
        setMessages(prev => {
          saveHistory(prev);
          return prev;
        });
      }
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'ai' as const, text: text.slice(0, idx) };
        return updated;
      });
    }, 16);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setAvatarPhase('chat');

    try {
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages.slice(-8) }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      const aiText = data.message || data.response || "I'd love to help! Please ask me about our courses, timings, or fees.";

      // Strip markdown formatting for clean plain text display
      const cleanText = stripMarkdown(aiText);
      typewriterEffect(cleanText);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Sorry, I'm having a moment! 😅 Please try again or call us at 9768100649.",
      }]);
    }
  }, [input, isTyping, messages, typewriterEffect]);

  const handleQuickAction = useCallback((action: { label: string; message: string }) => {
    if (isTyping) return;
    setMessages(prev => [...prev, { role: 'user', text: action.message }]);
    setAvatarPhase('chat');
    const responseText = QUICK_RESPONSES[action.message] || "I'd love to help with that! Please visit our Courses page or call us for detailed info. 🤖";
    setTimeout(() => typewriterEffect(responseText), 400);
  }, [isTyping, typewriterEffect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleSpeakerClick = useCallback((text: string, index: number) => {
    if (speakingIdx === index) {
      stopSpeaking();
    } else {
      speakText(text, index);
    }
  }, [speakingIdx, stopSpeaking, speakText]);

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ═══════ FLOATING AVATAR BUTTON ═══════ */}
      <AnimatePresence>
        {!isOpen && avatarPhase !== 'hidden' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.3, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed bottom-6 left-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="relative cursor-pointer group"
              onClick={openChat}
            >
              {/* Robot Avatar — no background frame */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 relative">
                <AIRobotAvatar
                  state={avatarPhase === 'greeting' ? 'greeting' : avatarPhase === 'chat' ? 'idle' : 'idle'}
                  onGreetingDone={handleGreetingDone}
                  onInteract={handleInteract}
                />
              </div>
            </motion.div>

            {/* Speech bubble during greeting */}
            <AnimatePresence>
              {showGreeting && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85, x: -10 }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="absolute bottom-4 left-48 sm:left-56 md:left-64 lg:left-68 max-w-[280px]"
                >
                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 shadow-2xl border border-blue-100 dark:border-blue-800/50">
                    <div className="absolute bottom-2 left-0 -translate-x-1/2 w-3 h-3 bg-white dark:bg-gray-900 rotate-45 border-b border-l border-blue-100 dark:border-blue-800/50" />
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">🤖</span>
                      <div>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300 leading-snug">
                          Hello! 👋 Welcome to{' '}
                          <span className="text-red-500" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                            Impact Computers
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Click me to ask about courses!
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* "Click me" indicator */}
            {!showGreeting && avatarPhase === 'idle' && (
              <motion.div
                animate={{ y: [0, -5, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 shadow-lg rounded-full px-3 py-1 flex items-center gap-1 border border-blue-200 dark:border-blue-800"
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                  Ask me anything!
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ CHAT WINDOW ═══════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{
              opacity: isMinimized ? 0.6 : 1,
              scale: isMinimized ? 0.12 : 1,
              y: 0,
              x: isMinimized ? 320 : 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-6 z-[60]"
          >
            {!isMinimized ? (
              <div className="w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-120px)] rounded-3xl shadow-2xl shadow-purple-900/20 border border-purple-100 dark:border-purple-900/50 flex flex-col overflow-hidden bg-white/92 dark:bg-[#0f0a1a]/95 backdrop-blur-xl">
              
                {/* ── Header ── */}
                <div className="relative flex-shrink-0">
                  <div className="h-28 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 relative overflow-hidden">
                    {/* Mini robot avatar in header */}
                    <div className="absolute top-3 right-3 w-14 h-14 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-gradient-to-b from-slate-900/60 to-indigo-900/30">
                      <AIRobotAvatar state={isTyping ? 'talking' : 'idle'} onInteract={() => {}} />
                    </div>
                    <div className="absolute bottom-3 left-4 text-white">
                      <h3 className="font-bold text-base flex items-center gap-1.5">
                        Pranali AI
                        <span className="text-yellow-300 text-xs font-normal">(प्रणाली)</span>
                      </h3>
                      <p className="text-white/70 text-[11px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Online — Your Learning Assistant
                      </p>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/5" />
                    <div className="absolute bottom-[-30px] left-[-15px] w-24 h-24 rounded-full bg-white/5" />
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-5" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                  </div>

                  {/* Header buttons */}
                  <div className="absolute top-2 left-3 flex gap-1.5">
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      title="Minimize"
                    >
                      <Minimize2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-20 flex gap-1.5">
                    <button
                      onClick={stopSpeaking}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      title="Stop speaking"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-3 flex gap-1.5">
                    <button
                      onClick={closeChat}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/50 flex items-center justify-center transition-colors"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* ── Messages Area ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#818cf8 transparent' }}>
                  {/* Welcome messages */}
                  {messages.length === 0 && (
                    <div className="space-y-2">
                      {WELCOME_MESSAGES.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.2 }}
                          className="flex gap-2"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="bg-purple-50/80 dark:bg-purple-900/30 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%]">
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{msg}</p>
                          </div>
                        </motion.div>
                      ))}

                      {/* Quick actions */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-wrap gap-2 mt-3"
                      >
                        {QUICK_ACTIONS.map((action) => (
                          <button
                            key={action.label}
                            onClick={() => handleQuickAction(action)}
                            disabled={isTyping}
                            className="px-3 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors border border-purple-200/80 dark:border-purple-700/50 disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        ))}
                      </motion.div>
                    </div>
                  )}

                  {/* Chat messages */}
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'ai' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={`rounded-2xl px-3.5 py-2.5 max-w-[80%] relative group/msg ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-sm'
                          : 'bg-purple-50/80 dark:bg-purple-900/30 rounded-tl-sm'
                      }`}>
                        <p className={`text-sm leading-relaxed whitespace-pre-line ${
                          msg.role === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {msg.text || (
                            <span className="inline-flex gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                          )}
                        </p>
                        {/* Speaker button on AI messages */}
                        {msg.role === 'ai' && msg.text && (
                          <button
                            onClick={() => handleSpeakerClick(msg.text, i)}
                            className="absolute -bottom-1 right-1 translate-y-full w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-md border border-indigo-200 dark:border-indigo-700 flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-opacity hover:scale-110"
                            title={speakingIdx === i ? 'Stop' : 'Read aloud'}
                          >
                            {speakingIdx === i ? (
                              <VolumeX className="w-3 h-3 text-red-500" />
                            ) : (
                              <Volume2 className="w-3 h-3 text-indigo-500" />
                            )}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-purple-50/80 dark:bg-purple-900/30 rounded-2xl rounded-tl-sm px-4 py-3">
                        <span className="inline-flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* ── Input Area ── */}
                <div className="flex-shrink-0 p-3 border-t border-purple-100/50 dark:border-purple-900/30 bg-white/90 dark:bg-[#0f0a1a]/90 backdrop-blur-md">
                
                  <div className="flex items-center gap-2">
                    {/* Microphone button */}
                    <button
                      onClick={toggleListening}
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        isListening
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Text input */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me anything..."
                      disabled={isTyping}
                      className="flex-1 bg-white/80 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-full px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-50"
                    />

                    {/* Send button */}
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Listening indicator */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 mt-1.5 justify-center"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="text-[10px] text-red-500 font-medium">Listening...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-[10px] text-gray-400 dark:text-gray-400 text-center mt-1">
                    Pranali AI — Powered by Impact Computers
                  </p>
                </div>
              </div>
            ) : (
              /* Minimized button */
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMinimized(false)}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl flex items-center justify-center relative"
              >
                <Bot className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-900" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
}
