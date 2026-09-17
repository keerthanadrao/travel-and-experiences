import React from 'react';
import Header from '@/components/Header';
import JourneyCard from '@/components/JourneyCard';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import styles from './profile.module.css';

export const revalidate = 0;

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const currentUser = await getCurrentUser();
  const db = await getDb();

  const profileUser = await db.get(
    'SELECT id, name, username, bio, profile_picture_url, role, created_at FROM users WHERE username = ?',
    [params.username]
  );

  if (!profileUser) {
    notFound();
  }

  // Real aggregate statistics calculated from DB tables
  const journeysCount = (await db.get('SELECT COUNT(*) as count FROM journeys WHERE author_id = ? AND status = "PUBLISHED"', [profileUser.id]))?.count || 0;
  const totalViews = (await db.get('SELECT SUM(views_count) as total FROM journeys WHERE author_id = ? AND status = "PUBLISHED"', [profileUser.id]))?.total || 0;
  const totalLikes = (await db.get('SELECT COUNT(*) as total FROM journey_likes jl JOIN journeys j ON jl.journey_id = j.id WHERE j.author_id = ?', [profileUser.id]))?.total || 0;
  const savedCount = (await db.get('SELECT COUNT(*) as count FROM saved_journeys WHERE user_id = ?', [profileUser.id]))?.count || 0;

  const userJourneys = await db.all(
    `SELECT j.id, j.title, j.subheading, j.brief, j.views_count,
            u.name as author_name,
            l.name as location_name,
            (SELECT url FROM media WHERE journey_id = j.id ORDER BY is_cover DESC, order_index ASC LIMIT 1) as cover_image_url,
            (SELECT COUNT(*) FROM journey_likes WHERE journey_id = j.id) as likes_count
     FROM journeys j
     JOIN users u ON j.author_id = u.id
     JOIN locations l ON j.location_id = l.id
     WHERE j.author_id = ? AND j.status = 'PUBLISHED'
     ORDER BY j.created_at DESC`,
    [profileUser.id]
  );

  const userPhotos = await db.all(
    `SELECT m.url FROM media m JOIN journeys j ON m.journey_id = j.id WHERE j.author_id = ? AND j.status = 'PUBLISHED'`,
    [profileUser.id]
  );

  return (
    <main>
      <Header user={currentUser} />

      <div className={`container ${styles.profileContainer}`}>
        {/* PROFILE HEADER */}
        <div className={styles.profileHeader}>
          <img
            src={profileUser.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={profileUser.name}
            className={styles.avatar}
          />

          <div className={styles.profileMeta}>
            <h1 className={styles.name}>{profileUser.name}</h1>
            <p className={styles.handle}>@{profileUser.username} {profileUser.role === 'ADMIN' && <span className={styles.adminBadge}>ADMIN</span>}</p>
            <p className={styles.bio}>{profileUser.bio || 'Travel storyteller exploring nature and open roads.'}</p>
          </div>
        </div>

        {/* REAL STATISTICS BAR */}
        <div className={styles.statsBar}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{journeysCount}</span>
            <span className={styles.statLabel}>My Journeys</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{totalLikes}</span>
            <span className={styles.statLabel}>Total Upvotes</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{totalViews}</span>
            <span className={styles.statLabel}>Total Views</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{savedCount}</span>
            <span className={styles.statLabel}>Saved Stories</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{userPhotos.length}</span>
            <span className={styles.statLabel}>Photos Uploaded</span>
          </div>
        </div>

        {/* PUBLISHED STORIES GRID */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Published Journeys</h2>
          {userJourneys.length > 0 ? (
            <div className={styles.grid}>
              {userJourneys.map((j) => (
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
            <p className={styles.emptyText}>No published journeys yet.</p>
          )}
        </section>

        {/* PHOTO MOSAIC */}
        {userPhotos.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>My Photography</h2>
            <div className={styles.photoMosaic}>
              {userPhotos.map((p: any, idx: number) => (
                <div key={idx} className={styles.photoCard}>
                  <img src={p.url} alt={`User photo ${idx}`} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
