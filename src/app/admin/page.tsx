import React from 'react';
import Header from '@/components/Header';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PurgeButton from './PurgeButton';
import styles from './admin.module.css';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const db = await getDb();
  const allJourneys = await db.all(
    `SELECT j.id, j.title, j.status, j.created_at,
            u.name as author_name, u.username as author_username,
            d.name as destination_name
     FROM journeys j
     JOIN users u ON j.author_id = u.id
     JOIN destinations d ON j.destination_id = d.id
     ORDER BY j.created_at DESC`
  );

  const usersCount = (await db.get('SELECT COUNT(*) as count FROM users'))?.count || 0;
  const journeysCount = (await db.get('SELECT COUNT(*) as count FROM journeys'))?.count || 0;

  return (
    <main>
      <Header user={user} />
      <div className={`container ${styles.adminWrapper}`}>
        <h1 className={styles.title}>🛡️ Admin Content Moderation Console</h1>
        <p className={styles.subtitle}>Protected moderation control for single platform administrator</p>

        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.num}>{usersCount}</span>
            <span className={styles.label}>Total Users</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.num}>{journeysCount}</span>
            <span className={styles.label}>Total Journeys</span>
          </div>
        </div>

        <section className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>All Platform Travel Journeys</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Journey Title</th>
                  <th>Author</th>
                  <th>Destination</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allJourneys.map((j) => (
                  <tr key={j.id}>
                    <td className={styles.titleCol}>{j.title}</td>
                    <td>{j.author_name} (@{j.author_username})</td>
                    <td>{j.destination_name}</td>
                    <td><span className={styles.statusBadge}>{j.status}</span></td>
                    <td>
                      <PurgeButton journeyId={j.id} title={j.title} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
