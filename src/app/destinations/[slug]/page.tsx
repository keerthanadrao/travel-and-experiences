import React from 'react';
import Header from '@/components/Header';
import JourneyCard from '@/components/JourneyCard';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import styles from './destination.module.css';

export const revalidate = 0;

export default async function DestinationPage({ params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  const db = await getDb();

  const dest = await db.get(
    `SELECT d.*, l.name as location_name FROM destinations d JOIN locations l ON d.location_id = l.id WHERE d.slug = ?`,
    [params.slug]
  );

  if (!dest) {
    notFound();
  }

  // Exclusive photos belonging ONLY to this destination's published journeys
  const photos = await db.all(
    `SELECT m.url FROM media m JOIN journeys j ON m.journey_id = j.id WHERE j.destination_id = ? AND j.status = 'PUBLISHED' ORDER BY m.is_cover DESC`,
    [dest.id]
  );

  const relatedJourneys = await db.all(
    `SELECT j.id, j.title, j.subheading, j.brief, j.views_count,
            u.name as author_name,
            l.name as location_name,
            (SELECT url FROM media WHERE journey_id = j.id ORDER BY is_cover DESC, order_index ASC LIMIT 1) as cover_image_url,
            (SELECT COUNT(*) FROM journey_likes WHERE journey_id = j.id) as likes_count
     FROM journeys j
     JOIN users u ON j.author_id = u.id
     JOIN locations l ON j.location_id = l.id
     WHERE j.destination_id = ? AND j.status = 'PUBLISHED'`,
    [dest.id]
  );

  return (
    <main>
      <Header user={user} />
      
      {/* DESTINATION HERO */}
      <div className={styles.hero} style={{ backgroundImage: `url(${dest.cover_image_url})` }}>
        <div className={styles.overlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.locationBadge}>📍 {dest.location_name}</span>
          <h1 className={styles.title}>{dest.name}</h1>
          <p className={styles.description}>{dest.description}</p>
        </div>
      </div>

      {/* HORIZONTAL PHOTO SNAP GALLERY */}
      <section className={`container ${styles.gallerySection}`}>
        <h2 className={styles.sectionTitle}>Photos From This Place</h2>
        <p className={styles.sectionSubtitle}>Exclusive photography captured at {dest.name}</p>

        {photos.length > 0 ? (
          <div className={styles.horizontalSnapGallery}>
            {photos.map((p: any, idx: number) => (
              <div key={idx} className={styles.gallerySlide}>
                <img src={p.url} alt={`${dest.name} photo ${idx + 1}`} className={styles.slideImg} />
                <span className={styles.photoCounter}>{idx + 1} / {photos.length}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noPhotos}>Single destination cover photo available.</p>
        )}
      </section>

      {/* RELATED JOURNEYS */}
      <section className={`container ${styles.journeysSection}`}>
        <h2 className={styles.sectionTitle}>Travel Stories in {dest.name}</h2>
        <div className={styles.grid}>
          {relatedJourneys.map((j) => (
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
      </section>
    </main>
  );
}
