import { getDb } from './db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDb();

  // 1. Seed Fixed 7 Approved Experiences
  const approvedExperiences = [
    { id: 'exp-heritage', name: 'Heritage', slug: 'heritage' },
    { id: 'exp-nature', name: 'Nature', slug: 'nature' },
    { id: 'exp-road-trip', name: 'Road Trip', slug: 'road-trip' },
    { id: 'exp-adventure', name: 'Adventure', slug: 'adventure' },
    { id: 'exp-beach', name: 'Beach', slug: 'beach' },
    { id: 'exp-wellness', name: 'Wellness', slug: 'wellness' },
    { id: 'exp-hidden-places', name: 'Hidden Places', slug: 'hidden-places' }
  ];

  for (const exp of approvedExperiences) {
    await db.run(
      `INSERT OR IGNORE INTO experiences (id, name, slug) VALUES (?, ?, ?)`,
      [exp.id, exp.name, exp.slug]
    );
  }

  // 2. Seed Single Admin User & Sample Story Authors
  const adminPasswordHash = await bcrypt.hash('Admin@2026', 10);
  const userPasswordHash = await bcrypt.hash('Traveler@2026', 10);

  const adminUser = {
    id: 'user-admin',
    name: 'Platform Moderator',
    username: 'admin',
    email: 'admin@travelandexperiences.com',
    password_hash: adminPasswordHash,
    bio: 'Official Travel & Experiences Platform Moderator & Curator.',
    profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    role: 'ADMIN'
  };

  const sampleAuthor = {
    id: 'user-rider-sam',
    name: 'Samarth K',
    username: 'solo_rider_sam',
    email: 'samarth@traveler.com',
    password_hash: userPasswordHash,
    bio: 'Solo motorcycle traveler exploring misty Western Ghats, heritage ruins, and coastal roads across India.',
    profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    role: 'USER'
  };

  await db.run(
    `INSERT OR IGNORE INTO users (id, name, username, email, password_hash, bio, profile_picture_url, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [adminUser.id, adminUser.name, adminUser.username, adminUser.email, adminUser.password_hash, adminUser.bio, adminUser.profile_picture_url, adminUser.role]
  );

  await db.run(
    `INSERT OR IGNORE INTO users (id, name, username, email, password_hash, bio, profile_picture_url, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sampleAuthor.id, sampleAuthor.name, sampleAuthor.username, sampleAuthor.email, sampleAuthor.password_hash, sampleAuthor.bio, sampleAuthor.profile_picture_url, sampleAuthor.role]
  );

  // 3. Seed Geographical Location Tree (India -> Karnataka / Himachal / Goa -> Districts -> Cities)
  const locWorld = { id: 'loc-world', name: 'World', slug: 'world', level: 'WORLD', parent_id: null };
  const locAsia = { id: 'loc-asia', name: 'Asia', slug: 'asia', level: 'CONTINENT', parent_id: 'loc-world' };
  const locIndia = { id: 'loc-india', name: 'India', slug: 'india', level: 'COUNTRY', parent_id: 'loc-asia' };
  
  // States
  const locKarnataka = { id: 'loc-karnataka', name: 'Karnataka', slug: 'karnataka', level: 'STATE', parent_id: 'loc-india' };
  const locHimachal = { id: 'loc-himachal', name: 'Himachal Pradesh', slug: 'himachal-pradesh', level: 'STATE', parent_id: 'loc-india' };
  const locGoaState = { id: 'loc-goa', name: 'Goa', slug: 'goa', level: 'STATE', parent_id: 'loc-india' };

  // Districts
  const locKodagu = { id: 'loc-kodagu', name: 'Kodagu', slug: 'kodagu', level: 'DISTRICT', parent_id: 'loc-karnataka' };
  const locBellary = { id: 'loc-bellary', name: 'Bellary', slug: 'bellary', level: 'DISTRICT', parent_id: 'loc-karnataka' };

  // Cities / Towns
  const locMadikeri = { id: 'loc-madikeri', name: 'Madikeri', slug: 'madikeri', level: 'CITY', parent_id: 'loc-kodagu' };
  const locHampi = { id: 'loc-hampi-city', name: 'Hampi', slug: 'hampi', level: 'CITY', parent_id: 'loc-bellary' };
  const locManali = { id: 'loc-manali-city', name: 'Manali', slug: 'manali', level: 'CITY', parent_id: 'loc-himachal' };

  const locationsList = [locWorld, locAsia, locIndia, locKarnataka, locHimachal, locGoaState, locKodagu, locBellary, locMadikeri, locHampi, locManali];

  for (const loc of locationsList) {
    await db.run(
      `INSERT OR IGNORE INTO locations (id, name, slug, level, parent_id) VALUES (?, ?, ?, ?, ?)`,
      [loc.id, loc.name, loc.slug, loc.level, loc.parent_id]
    );
  }

  // 4. Seed Destinations
  const destCoorg = {
    id: 'dest-coorg',
    name: 'Coorg (Kodagu)',
    slug: 'coorg',
    location_id: 'loc-madikeri',
    description: 'Known as the Scotland of India, Coorg is famous for coffee plantations, misty hills, cascades, and scenic motorcycle trails.',
    cover_image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80'
  };

  const destHampi = {
    id: 'dest-hampi',
    name: 'Hampi Ruins',
    slug: 'hampi',
    location_id: 'loc-hampi-city',
    description: 'A UNESCO World Heritage site featuring ancient Vijayanagara boulder monuments, grand monolithic temples, and quiet riverside trails.',
    cover_image_url: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80'
  };

  const destManali = {
    id: 'dest-manali',
    name: 'Manali & Solang Valley',
    slug: 'manali',
    location_id: 'loc-manali-city',
    description: 'High-altitude Himalayan valley featuring pine forests, snowy passes, roaring rivers, and iconic mountain bike routes.',
    cover_image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80'
  };

  const destinationsList = [destCoorg, destHampi, destManali];
  for (const d of destinationsList) {
    await db.run(
      `INSERT OR IGNORE INTO destinations (id, name, slug, location_id, description, cover_image_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [d.id, d.name, d.slug, d.location_id, d.description, d.cover_image_url]
    );
  }

  // 5. Seed Real Travel Journeys
  const journeyCoorg = {
    id: 'journey-monsoon-coorg',
    author_id: 'user-rider-sam',
    destination_id: 'dest-coorg',
    location_id: 'loc-madikeri',
    title: 'Monsoon Solo Ride to Abbey Falls and Coffee Slopes',
    subheading: 'Navigating misty mountain bends and roaring cascades through Madikeri on two wheels.',
    brief: 'Riding through Kodagu during peak monsoon reveals lush coffee estates, winding single-lane tarmac, and thunderous cascades at Abbey Falls.',
    body_rich_text: `<p>The rain started just as my Royal Enfield crossed the Madikeri town border. The air turned crisp, filled with the aroma of damp earth and fresh coffee blossoms. Riding solo through the Kodagu district in monsoon requires patience, but every turn opens up mist-shrouded valley panoramas.</p><p>Abbey Falls was in its full roaring glory. The footbridge offered a front-row view of the roaring torrents surging down the granite rockface. Afterward, I rode up to Raja’s Seat to watch the sunset paint the Western Ghats in deep emerald and indigo hues.</p>`,
    status: 'PUBLISHED',
    views_count: 1420
  };

  const journeyHampi = {
    id: 'journey-boulder-hampi',
    author_id: 'user-rider-sam',
    destination_id: 'dest-hampi',
    location_id: 'loc-hampi-city',
    title: 'Sunrise Boulders and Sacred Trails of Hampi',
    subheading: 'Exploring 14th-century Vijayanagara ruins and quiet riverside paths by motorcycle.',
    brief: 'Hampi’s surreal boulder-strewn landscapes and ancient Virupaksha temple sunrise offer an unforgettable heritage exploration.',
    body_rich_text: `<p>Waking up at 5:00 AM in Hampi means beating the afternoon heat and catching the dawn light reflecting over the Tungabhadra river. I kicked off my ride towards Matanga Hill. The monolithic stone architecture of the Vijayanagara empire stands silent against the morning sky.</p><p>Riding past the Stone Chariot at Vittala Temple and exploring the elephant stables felt like traveling back 600 years in time. The boulder trails behind Sanapur lake provided the perfect off-road terrain for solo adventure exploration.</p>`,
    status: 'PUBLISHED',
    views_count: 2890
  };

  const journeysList = [journeyCoorg, journeyHampi];
  for (const j of journeysList) {
    await db.run(
      `INSERT OR IGNORE INTO journeys (id, author_id, destination_id, location_id, title, subheading, brief, body_rich_text, status, views_count, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [j.id, j.author_id, j.destination_id, j.location_id, j.title, j.subheading, j.brief, j.body_rich_text, j.status, j.views_count]
    );
  }

  // 6. Map Experiences to Journeys
  await db.run(`INSERT OR IGNORE INTO journey_experiences (journey_id, experience_id) VALUES (?, ?)`, ['journey-monsoon-coorg', 'exp-nature']);
  await db.run(`INSERT OR IGNORE INTO journey_experiences (journey_id, experience_id) VALUES (?, ?)`, ['journey-monsoon-coorg', 'exp-road-trip']);
  await db.run(`INSERT OR IGNORE INTO journey_experiences (journey_id, experience_id) VALUES (?, ?)`, ['journey-boulder-hampi', 'exp-heritage']);
  await db.run(`INSERT OR IGNORE INTO journey_experiences (journey_id, experience_id) VALUES (?, ?)`, ['journey-boulder-hampi', 'exp-hidden-places']);

  // 7. Seed Exclusive Media
  const mediaList = [
    { id: 'media-c1', journey_id: 'journey-monsoon-coorg', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE', is_cover: 1, order_index: 0 },
    { id: 'media-c2', journey_id: 'journey-monsoon-coorg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE', is_cover: 0, order_index: 1 },
    { id: 'media-h1', journey_id: 'journey-boulder-hampi', url: 'https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE', is_cover: 1, order_index: 0 },
    { id: 'media-h2', journey_id: 'journey-boulder-hampi', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80', type: 'IMAGE', is_cover: 0, order_index: 1 }
  ];

  for (const m of mediaList) {
    await db.run(
      `INSERT OR IGNORE INTO media (id, journey_id, url, type, is_cover, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
      [m.id, m.journey_id, m.url, m.type, m.is_cover, m.order_index]
    );
  }

  // 8. Seed Initial Upvotes & Saves
  await db.run(`INSERT OR IGNORE INTO journey_likes (user_id, journey_id) VALUES (?, ?)`, ['user-rider-sam', 'journey-boulder-hampi']);
  await db.run(`INSERT OR IGNORE INTO saved_journeys (user_id, journey_id) VALUES (?, ?)`, ['user-rider-sam', 'journey-monsoon-coorg']);
}
