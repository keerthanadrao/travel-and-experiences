import React from 'react';
import Header from '@/components/Header';
import JourneyCard from '@/components/JourneyCard';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './saved.module.css';

export const revalidate = 0;

export default async function SavedJourneysPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const db = await getDb();

  const savedJourneys = await db.all(
    `SELECT j.id, j.title, j.subheading, j.brief, j.views_count,
            u.name as author_name,
            l.name as location_name,
            (SELECT url FROM media WHERE journey_id = j.id ORDER BY is_cover DESC, order_index ASC LIMIT 1) as cover_image_url,
            (SELECT COUNT(*) FROM journey_likes WHERE journey_id = j.id) as likes_count
     FROM saved_journeys sj
     JOIN journeys j ON sj.journey_id = j.id
     JOIN users u ON j.author_id = u.id
     JOIN locations l ON j.location_id = l.id
     WHERE sj.user_id = ? AND j.status = 'PUBLISHED'
     ORDER BY sj.created_at DESC`,
    [user.userId]
  );

  return (
    <main>
      <Header user={user} />
      <div className={`container ${styles.wrapper}`}>
        <h1 className={styles.title}>🔖 Saved Journeys Scrapbook</h1>
        <p className={styles.subtitle}>Your private bookmarked collection of travel stories for route planning</p>

        {savedJourneys.length > 0 ? (
          <div className={styles.grid}>
            {savedJourneys.map((j) => (
              <JourneyCard
                key={j.id}
                id={j.id}
                title={j.title}
                subheading={j.subheading}
                location={j.location_name}
                coverImage={j.cover_image_url}
                authorName={j.author_name}
                likesCount={j.likes_count || 0}
                viewsCount={j.views_count || 0}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyBox}>
            <h2>Your scrapbook is empty</h2>
            <p>Click 🔖 Save on any travel story to bookmark it here for later reference.</p>
          </div>
        )}
      </div>
    </main>
  );
}
