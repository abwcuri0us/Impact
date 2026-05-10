'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Loader2, ShieldCheck, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setRedirecting(true);
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        // Handle different error types with specific messages
        if (data.code === 'RATE_LIMITED') {
          const minutes = Math.ceil((data.retryAfterSeconds || 0) / 60);
          setError(`Too many failed attempts. Try again in ${minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : `${data.retryAfterSeconds} seconds`}.`);
        } else if (data.code === 'ACCOUNT_LOCKED') {
          setError('This account has been temporarily locked due to too many failed login attempts.');
        } else if (data.code === 'ACCOUNT_DEACTIVATED') {
          setError('This account has been deactivated. Contact your administrator.');
        } else {
          setError(data.error || 'Invalid credentials');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    if (error.includes('deactivated')) return <AlertTriangle className="w-4 h-4" />;
    return <Lock className="w-4 h-4" />;
  };

  const getErrorStyle = () => {
    if (error.includes('deactivated') || error.includes('locked')) {
      return 'bg-amber-500/20 border-amber-500/40';
    }
    if (error.includes('Too many')) {
      return 'bg-red-500/20 border-red-500/40';
    }
    return 'bg-red-500/20 border-red-500/40';
  };

  // Full-page redirect loading animation
  if (redirecting) {
    return (
      <div className="fixed inset-0 gradient-hero flex flex-col items-center justify-center z-[10000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Spinning Logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 bg-white/15 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-2xl mb-8"
          >
            <Image
              src="/logo-impact-new.png"
              alt="Impact Computers"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </motion.div>

          {/* Text */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-xl font-bold text-white mb-2"
          >
            Redirecting to Dashboard...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-white/50 text-sm"
          >
            Authentication successful
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.75, delay: 0.05, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-brand-yellow to-brand-yellow-light rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] gradient-hero flex items-center justify-center p-4 overflow-y-auto">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-purple-dark/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8 md:p-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20 shadow-lg">
              <Image
                src="/logo-impact-new.png"
                alt="Impact Computers"
                width={56}
                height={56}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <ShieldCheck className="w-4 h-4 text-brand-yellow" />
              <span className="text-brand-yellow text-xs font-medium">Secure Access</span>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${getErrorStyle()} border rounded-lg px-4 py-3 mb-6 flex items-center gap-2`}
            >
              <div className="text-red-200 flex-shrink-0">{getErrorIcon()}</div>
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80 text-sm">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-yellow focus:ring-brand-yellow/30"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 text-sm">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-yellow focus:ring-brand-yellow/30"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full h-11 bg-brand-yellow hover:bg-brand-yellow-light text-brand-purple-deep font-bold text-base shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </Button>
          </motion.form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs">
              Authorized access only. All actions are logged.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
