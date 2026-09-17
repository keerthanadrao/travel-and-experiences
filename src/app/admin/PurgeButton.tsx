'use client';

import React, { useState } from 'react';
import styles from './admin.module.css';

export default function PurgeButton({ journeyId, title }: { journeyId: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handlePurge = async () => {
    const confirmText = `Are you sure you want to execute a CASCADING PURGE of journey "${title}"?\n\nThis will permanently delete the story, media files, upvotes, bookmarks, and purge it cleanly from search, home, destination pages, and profiles.`;
    if (!confirm(confirmText)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journeyId })
      });

      if (!res.ok) {
        throw new Error('Purge request failed');
      }

      setDeleted(true);
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  };

  if (deleted) {
    return <span className={styles.purgedText}>✓ Purged</span>;
  }

  return (
    <button onClick={handlePurge} disabled={loading} className={styles.purgeBtn}>
      {loading ? 'Purging...' : '🗑 Cascading Purge'}
    </button>
  );
}
