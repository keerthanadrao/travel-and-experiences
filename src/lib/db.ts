import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'travel_experiences.db');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await dbInstance.exec('PRAGMA foreign_keys = ON;');
  await initTables(dbInstance);

  return dbInstance;
}

async function initTables(db: Database) {
  // Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT,
      profile_picture_url TEXT,
      role TEXT CHECK(role IN ('USER', 'ADMIN')) NOT NULL DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Locations Table (9-Tier Adjacency Tree)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      level TEXT CHECK(level IN ('WORLD', 'CONTINENT', 'COUNTRY', 'STATE', 'DISTRICT', 'CITY', 'LOCALITY')) NOT NULL,
      parent_id TEXT REFERENCES locations(id) ON DELETE RESTRICT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Destinations Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
      description TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Experiences Table (Fixed 7 Approved)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );
  `);

  // Tags Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL
    );
  `);

  // Journeys Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journeys (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE RESTRICT,
      location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
      title TEXT NOT NULL,
      subheading TEXT NOT NULL,
      brief TEXT NOT NULL,
      body_rich_text TEXT NOT NULL,
      status TEXT CHECK(status IN ('DRAFT', 'PUBLISHED', 'DELETED')) NOT NULL DEFAULT 'DRAFT',
      views_count INTEGER DEFAULT 0 NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME
    );
  `);

  // Journey Experiences Junction Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journey_experiences (
      journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      experience_id TEXT NOT NULL REFERENCES experiences(id) ON DELETE RESTRICT,
      PRIMARY KEY (journey_id, experience_id)
    );
  `);

  // Journey Tags Junction Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journey_tags (
      journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE RESTRICT,
      PRIMARY KEY (journey_id, tag_id)
    );
  `);

  // Media Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      type TEXT CHECK(type IN ('IMAGE', 'VIDEO')) NOT NULL,
      is_cover INTEGER DEFAULT 0 NOT NULL,
      order_index INTEGER DEFAULT 0 NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Journey Likes Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journey_likes (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, journey_id)
    );
  `);

  // Saved Journeys Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_journeys (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      journey_id TEXT NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, journey_id)
    );
  `);

  // OTP Tokens Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otp_tokens (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      attempts INTEGER DEFAULT 0 NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Indexes
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_locations_parent ON locations(parent_id);
    CREATE INDEX IF NOT EXISTS idx_destinations_location ON destinations(location_id);
    CREATE INDEX IF NOT EXISTS idx_journeys_location ON journeys(location_id);
    CREATE INDEX IF NOT EXISTS idx_journeys_destination ON journeys(destination_id);
    CREATE INDEX IF NOT EXISTS idx_journeys_status ON journeys(status);
    CREATE INDEX IF NOT EXISTS idx_media_journey ON media(journey_id);
  `);
}
