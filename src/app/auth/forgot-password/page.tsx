'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './auth.module.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setMessage(data.message);
      setStep(2);
      startCooldownTimer(data.resendCooldown || 60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      setMessage('Password updated successfully! Redirecting to Sign In...');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const startCooldownTimer = (seconds: number) => {
    setCooldown(seconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <h1 className={styles.brandTitle}>Travel & Experiences</h1>
        <p className={styles.tagline}>Where Journeys Become Stories</p>
        <h2 className={styles.heading}>Password Recovery</h2>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {message && <div className={styles.successAlert}>{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className={styles.fieldGroup}>
              <label>Enter Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Sending Code...' : 'Send OTP Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className={styles.fieldGroup}>
              <label>6-Digit OTP Code (Sent via NodeMailer)</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>New Password (&gt;=8 chars, 1 Upper, 1 Num, 1 Special)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'Verifying & Resetting...' : 'Reset Password'}
            </button>

            {cooldown > 0 ? (
              <p className={styles.cooldownText}>Resend OTP available in {cooldown}s</p>
            ) : (
              <button type="button" onClick={handleRequestOtp} className={styles.resendBtn}>
                Resend OTP
              </button>
            )}
          </form>
        )}

        <div className={styles.footerLink}>
          Back to <Link href="/auth/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
