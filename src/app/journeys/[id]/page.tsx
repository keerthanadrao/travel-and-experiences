import React from 'react';
import Header from '@/components/Header';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import EngagementToolbar from './EngagementToolbar';
import styles from './journey.module.css';

export const revalidate = 0;

export default async function JourneyDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const db = await getDb();

  // Increment views
  await db.run('UPDATE journeys SET views_count = views_count + 1 WHERE id = ?', [params.id]);

  const journey = await db.get(
    `SELECT j.*, u.name as author_name, u.username as author_username,
            d.name as destination_name, d.slug as destination_slug,
            l.name as location_name
     FROM journeys j
     JOIN users u ON j.author_id = u.id
     JOIN destinations d ON j.destination_id = d.id
     JOIN locations l ON j.location_id = l.id
     WHERE j.id = ? AND j.status != 'DELETED'`,
    [params.id]
  );

  if (!journey) {
    notFound();
  }

  const media = await db.all('SELECT * FROM media WHERE journey_id = ? ORDER BY order_index ASC', [journey.id]);
  const coverImage = media.find(m => m.is_cover) || media[0];
  const galleryImages = media.filter(m => m.id !== coverImage?.id);

  const experiences = await db.all(
    `SELECT e.name FROM experiences e JOIN journey_experiences je ON e.id = je.experience_id WHERE je.journey_id = ?`,
    [journey.id]
  );

  const likesCount = (await db.get('SELECT COUNT(*) as count FROM journey_likes WHERE journey_id = ?', [journey.id]))?.count || 0;
  
  let isLiked = false;
  let isSaved = false;

  if (user) {
    const likeObj = await db.get('SELECT 1 FROM journey_likes WHERE user_id = ? AND journey_id = ?', [user.userId, journey.id]);
    isLiked = !!likeObj;

    const saveObj = await db.get('SELECT 1 FROM saved_journeys WHERE user_id = ? AND journey_id = ?', [user.userId, journey.id]);
    isSaved = !!saveObj;
  }

  return (
    <main className={styles.mainWrapper}>
      <Header user={user} />

      <article className="container">
        {/* EDITORIAL HERO COVER */}
        <div className={styles.heroCover}>
          {coverImage && <img src={coverImage.url} alt={journey.title} className={styles.coverImg} />}
        </div>

        {/* METADATA & HEADINGS */}
        <header className={styles.editorialHeader}>
          <div className={styles.categoryPills}>
            <span className={styles.locationBadge}>📍 {journey.location_name}</span>
            {experiences.map(e => (
              <span key={e.name} className={styles.expBadge}>{e.name}</span>
            ))}
          </div>

          <h1 className={styles.title}>{journey.title}</h1>
          <p className={styles.subheading}>{journey.subheading}</p>

          <div className={styles.authorBar}>
            <div>
              <span className={styles.byAuthor}>By {journey.author_name} (@{journey.author_username})</span>
              <span className={styles.publishDate}> • {new Date(journey.created_at).toLocaleDateString()}</span>
            </div>
            <div className={styles.viewsCount}>👁 {journey.views_count} Views</div>
          </div>
        </header>

        {/* ENGAGEMENT TOOLBAR (Upvote ♡/♥, Save 🔖, Share ↗, Take Me There) */}
        <EngagementToolbar
          journeyId={journey.id}
          initialLikesCount={likesCount}
          initialIsLiked={isLiked}
          initialIsSaved={isSaved}
          destinationSlug={journey.destination_slug}
          isAuthenticated={!!user}
        />

        {/* RICH STORY BODY CONTENT */}
        <section className={styles.storyContent} dangerouslySetInnerHTML={{ __html: journey.body_rich_text }} />

        {/* GALLERY MEDIA */}
        {galleryImages.length > 0 && (
          <section className={styles.mediaGallerySection}>
            <h3 className={styles.galleryTitle}>Journey Gallery</h3>
            <div className={styles.galleryGrid}>
              {galleryImages.map(m => (
                <div key={m.id} className={styles.galleryCard}>
                  <img src={m.url} alt="Story photo" />
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
