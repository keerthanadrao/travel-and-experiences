import React from 'react';
import Header from '@/components/Header';
import CreateJourneyForm from './CreateJourneyForm';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import styles from './create.module.css';

export const revalidate = 0;

export default async function CreateJourneyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const db = await getDb();
  const destinations = await db.all('SELECT id, name FROM destinations');
  const experiences = await db.all('SELECT id, name FROM experiences');
  const locations = await db.all('SELECT id, name, level FROM locations WHERE level IN ("CITY", "DISTRICT", "STATE")');

  return (
    <main>
      <Header user={user} />
      <div className={`container ${styles.createWrapper}`}>
        <h1 className={styles.title}>Create a Travel Journey</h1>
        <p className={styles.subtitle}>Document your solo bike routes, nature discoveries, and authentic stories</p>

        <CreateJourneyForm
          destinations={destinations}
          experiences={experiences}
          locations={locations}
        />
      </div>
    </main>
  );
}
