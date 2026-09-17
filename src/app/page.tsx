import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import JourneyCard from '@/components/JourneyCard';
import { getDb } from '@/lib/db';
import { seedDatabase } from '@/lib/seed';
import { getCurrentUser } from '@/lib/auth';
import styles from './Home.module.css';

export const revalidate = 0;

export default async function HomePage() {
  await seedDatabase();
  const user = await getCurrentUser();
  const db = await getDb();

  const publishedJourneys = await db.all(`
    SELECT j.id, j.title, j.subheading, j.brief, j.views_count,
           u.name as author_name,
           d.slug as destination_slug,
           l.name as location_name,
           (SELECT url FROM media WHERE journey_id = j.id ORDER BY is_cover DESC, order_index ASC LIMIT 1) as cover_image_url,
           (SELECT COUNT(*) FROM journey_likes WHERE journey_id = j.id) as likes_count
    FROM journeys j
    JOIN users u ON j.author_id = u.id
    JOIN destinations d ON j.destination_id = d.id
    JOIN locations l ON j.location_id = l.id
    WHERE j.status = 'PUBLISHED'
    ORDER BY j.created_at DESC
  `);

  const destinations = await db.all(`SELECT * FROM destinations LIMIT 6`);

  const experiences = [
    { name: 'Heritage', slug: 'heritage', icon: '🏛️' },
    { name: 'Nature', slug: 'nature', icon: '🌿' },
    { name: 'Road Trip', slug: 'road-trip', icon: '🏍️' },
    { name: 'Adventure', slug: 'adventure', icon: '🏔️' },
    { name: 'Beach', slug: 'beach', icon: '🏖️' },
    { name: 'Wellness', slug: 'wellness', icon: '🧘' },
    { name: 'Hidden Places', slug: 'hidden-places', icon: '💎' }
  ];

  return (
    <main>
      <Header user={user} />

      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Where Journeys Become Stories</h1>
          <p className={styles.heroSubtitle}>
            Discover quiet mountain bends, ancient stone ruins, and authentic travel narratives written by solo explorers.
          </p>

          <form action="/search" method="GET" className={styles.heroSearchForm}>
            <input
              type="text"
              name="q"
              placeholder="Search destinations, journeys (e.g. Coorg, Hampi)..."
              className={styles.heroInput}
            />
            <button type="submit" className={styles.heroSearchBtn}>Discover</button>
          </form>
        </div>
      </section>

      {/* 2. EXPLORE BY EXPERIENCE */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Explore by Experience</h2>
        <p className={styles.sectionSubtitle}>Filter trips by approved travel styles</p>

        <div className={styles.experienceGrid}>
          {experiences.map((exp) => (
            <Link key={exp.slug} href={`/search?exp=${exp.slug}`} className={styles.experienceCard}>
              <span className={styles.expIcon}>{exp.icon}</span>
              <span className={styles.expName}>{exp.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. DISCOVER PLACES */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Discover Places</h2>
        <p className={styles.sectionSubtitle}>Explore curated Indian travel destinations</p>

        <div className={styles.destinationsGrid}>
          {destinations.map((dest) => (
            <div key={dest.id} className={styles.destinationCard}>
              <img src={dest.cover_image_url} alt={dest.name} className={styles.destImg} />
              <div className={styles.destOverlay}>
                <h3 className={styles.destName}>{dest.name}</h3>
                <p className={styles.destDesc}>{dest.description}</p>
                <Link href={`/destinations/${dest.slug}`} className={styles.destBtn}>
                  Take Me There →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED / LATEST JOURNEYS */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Featured Journeys</h2>
        <p className={styles.sectionSubtitle}>Real travel stories written by our community</p>

        <div className={styles.journeysGrid}>
          {publishedJourneys.map((j) => (
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
      </section>

      {/* 5. PHOTO JOURNEYS MOSAIC */}
      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Photo Journeys</h2>
        <p className={styles.sectionSubtitle}>Visual moments captured on the road</p>

        <div className={styles.photoGrid}>
          <div className={styles.photoItem}>
            <img src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" alt="Coorg Mist" />
            <span className={styles.photoLabel}>Misty Madikeri Bends</span>
          </div>
          <div className={styles.photoItem}>
            <img src="https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=600&q=80" alt="Hampi Ruins" />
            <span className={styles.photoLabel}>Hampi Sunrise Trails</span>
          </div>
          <div className={styles.photoItem}>
            <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80" alt="Manali Pass" />
            <span className={styles.photoLabel}>High Himalayan Passes</span>
          </div>
        </div>
      </section>

      {/* 6. MINIMAL FOOTER */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerBrand}>
            <h3>Travel & Experiences</h3>
            <p>Where Journeys Become Stories</p>
          </div>
          <p className={styles.copyright}>© 2026 Travel & Experiences. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
