import React from 'react';
import Link from 'next/link';
import styles from './JourneyCard.module.css';

interface JourneyCardProps {
  id: string;
  title: string;
  subheading: string;
  location: string;
  experience?: string;
  coverImage?: string;
  authorName: string;
  likesCount: number;
  viewsCount: number;
  destinationSlug?: string;
}

export default function JourneyCard({
  id,
  title,
  subheading,
  location,
  experience,
  coverImage,
  authorName,
  likesCount,
  viewsCount,
  destinationSlug
}: JourneyCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={coverImage || fallbackImage}
          alt={title}
          className={styles.coverImg}
          loading="lazy"
        />
        {experience && (
          <span className={styles.experienceBadge}>{experience}</span>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.locationBadge}>📍 {location}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.subheading}>{subheading}</p>

        <div className={styles.authorRow}>
          <span className={styles.authorName}>By {authorName}</span>
          <div className={styles.stats}>
            <span>♡ {likesCount}</span>
            <span>👁 {viewsCount}</span>
          </div>
        </div>

        <div className={styles.cardActions}>
          <Link href={`/journeys/${id}`} className={styles.takeMeThereBtn}>
            Take Me There →
          </Link>
        </div>
      </div>
    </div>
  );
}
