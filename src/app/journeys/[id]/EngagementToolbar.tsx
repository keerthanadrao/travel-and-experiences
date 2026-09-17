'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './journey.module.css';

interface ToolbarProps {
  journeyId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  initialIsSaved: boolean;
  destinationSlug: string;
  isAuthenticated: boolean;
}

export default function EngagementToolbar({
  journeyId,
  initialLikesCount,
  initialIsLiked,
  initialIsSaved,
  destinationSlug,
  isAuthenticated
}: ToolbarProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [toastMsg, setToastMsg] = useState('');

  const handleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);

    try {
      await fetch(`/api/journeys/${journeyId}/like`, { method: 'POST' });
    } catch (e) {
      setIsLiked(prevLiked);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      await fetch(`/api/journeys/${journeyId}/save`, { method: 'POST' });
      showToast(prevSaved ? 'Removed from Saved Journeys' : 'Added to Saved Journeys');
    } catch (e) {
      setIsSaved(prevSaved);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Journey link copied to clipboard! ↗');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftActions}>
        <button onClick={handleLike} className={`${styles.toolBtn} ${isLiked ? styles.liked : ''}`}>
          {isLiked ? '♥' : '♡'} {likesCount}
        </button>

        <button onClick={handleSave} className={`${styles.toolBtn} ${isSaved ? styles.saved : ''}`}>
          🔖 {isSaved ? 'Saved' : 'Save'}
        </button>

        <button onClick={handleShare} className={styles.toolBtn}>
          ↗ Share
        </button>
      </div>

      <Link href={`/destinations/${destinationSlug}`} className={styles.takeMeThereBtn}>
        Take Me There →
      </Link>

      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}
