import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (!email) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setMessage('Password reset link sent to your email!');
      setIsResetting(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-20">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">
              {isResetting ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isResetting 
                ? 'Enter your email to receive a reset link' 
                : 'Sign in to access your account and orders'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-start gap-3 text-green-600 text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={isResetting ? handleForgotPassword : handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {!isResetting && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                  <button 
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isResetting ? 'Send Reset Link' : 'Sign In'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              {isResetting ? (
                <button 
                  onClick={() => setIsResetting(false)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Back to Login
                </button>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                    Create Account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
