import React from 'react';
import Header from '@/components/Header';
import JourneyCard from '@/components/JourneyCard';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import styles from './search.module.css';

export const revalidate = 0;

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; exp?: string }
}) {
  const queryStr = searchParams.q || '';
  const experienceSlug = searchParams.exp || '';
  const user = await getCurrentUser();
  const db = await getDb();

  // Call search API internally or direct query
  let matchingJourneys: any[] = [];

  if (queryStr || experienceSlug) {
    let sql = `
      SELECT DISTINCT j.id, j.title, j.subheading, j.brief, j.views_count,
             u.name as author_name,
             d.slug as destination_slug,
             l.name as location_name,
             (SELECT url FROM media WHERE journey_id = j.id ORDER BY is_cover DESC, order_index ASC LIMIT 1) as cover_image_url,
             (SELECT COUNT(*) FROM journey_likes WHERE journey_id = j.id) as likes_count
      FROM journeys j
      JOIN users u ON j.author_id = u.id
      JOIN destinations d ON j.destination_id = d.id
      JOIN locations l ON j.location_id = l.id
      LEFT JOIN journey_experiences je ON j.id = je.journey_id
      LEFT JOIN experiences e ON je.experience_id = e.id
      LEFT JOIN journey_tags jt ON j.id = jt.journey_id
      LEFT JOIN tags t ON jt.tag_id = t.id
      WHERE j.status = 'PUBLISHED'
    `;

    const params: any[] = [];
    if (queryStr) {
      sql += ` AND (l.name LIKE ? OR d.name LIKE ? OR j.title LIKE ? OR t.name LIKE ?)`;
      params.push(`%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`, `%${queryStr}%`);
    }
    if (experienceSlug) {
      sql += ` AND e.slug = ?`;
      params.push(experienceSlug);
    }

    matchingJourneys = await db.all(sql, params);
  }

  return (
    <main>
      <Header user={user} />
      <div className={`container ${styles.searchContainer}`}>
        <h1 className={styles.title}>Location-Aware Search & Discovery</h1>
        
        <div className={styles.filterSummary}>
          {queryStr && <span className={styles.tagPill}>Location / Keyword: "{queryStr}"</span>}
          {experienceSlug && <span className={styles.tagPill}>Experience: {experienceSlug}</span>}
        </div>

        <p className={styles.resultCount}>Found {matchingJourneys.length} matching journey stories</p>

        {matchingJourneys.length > 0 ? (
          <div className={styles.grid}>
            {matchingJourneys.map((j) => (
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
                destinationSlug={j.destination_slug}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No exact travel stories found</h2>
            <p>Try searching broader parent states like "Karnataka" or filter by experiences below:</p>
            <div className={styles.expPills}>
              <a href="/search?exp=nature">🌿 Nature</a>
              <a href="/search?exp=road-trip">🏍️ Road Trip</a>
              <a href="/search?exp=heritage">🏛️ Heritage</a>
              <a href="/search?exp=hidden-places">💎 Hidden Places</a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
