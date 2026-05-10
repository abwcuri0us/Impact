// Simple in-memory rate limiter for login attempts
// Tracks failed login attempts by IP address

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const store = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

// Auto-cleanup old entries
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (entry.lockedUntil && entry.lockedUntil < now) {
      // Lockout expired, remove
      store.delete(key);
    } else if (entry.firstAttemptAt + WINDOW_MS < now && !entry.lockedUntil) {
      // Window expired with no lockout, remove
      store.delete(key);
    }
  }
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
  retryAfterSeconds: number | null;
} {
  cleanup();

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterSeconds: null };
  }

  // Check if currently locked out
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
      retryAfterSeconds,
    };
  }

  // Lockout expired, reset
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    store.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterSeconds: null };
  }

  // Check if window expired
  if (entry.firstAttemptAt + WINDOW_MS < now) {
    store.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockedUntil: null, retryAfterSeconds: null };
  }

  // Within window, check attempts
  const remaining = MAX_ATTEMPTS - entry.attempts;
  if (remaining <= 0) {
    // Lock the IP
    entry.lockedUntil = now + LOCKOUT_MS;
    const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: entry.lockedUntil,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remainingAttempts: remaining,
    lockedUntil: null,
    retryAfterSeconds: null,
  };
}

export function recordFailedAttempt(ip: string): {
  remainingAttempts: number;
  isNowLocked: boolean;
  retryAfterSeconds: number | null;
} {
  cleanup();

  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { attempts: 0, firstAttemptAt: now, lockedUntil: null };
    store.set(ip, entry);
  }

  // Reset if window expired
  if (entry.firstAttemptAt + WINDOW_MS < now) {
    entry.attempts = 0;
    entry.firstAttemptAt = now;
    entry.lockedUntil = null;
  }

  entry.attempts++;
  const remaining = MAX_ATTEMPTS - entry.attempts;

  if (remaining <= 0) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return {
      remainingAttempts: 0,
      isNowLocked: true,
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  return { remainingAttempts: remaining, isNowLocked: false, retryAfterSeconds: null };
}

export function resetRateLimit(ip: string): void {
  store.delete(ip);
}
