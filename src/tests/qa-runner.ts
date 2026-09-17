import { getDb } from '../lib/db';
import { seedDatabase } from '../lib/seed';
import { getChildLocationIds } from '../lib/location';
import { isPasswordStrong } from '../lib/auth';

export async function runQaTestSuite() {
  console.log('--- STARTING QA AUTOMATED TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  // Test 1: Seed & Database Initialization
  try {
    await seedDatabase();
    const db = await getDb();
    const expCount = (await db.get('SELECT COUNT(*) as count FROM experiences'))?.count || 0;
    if (expCount === 7) {
      console.log('✓ TEST 01 PASS: Exactly 7 experiences seeded into DB.');
      passed++;
    } else {
      console.error(`✕ TEST 01 FAIL: Found ${expCount} experiences instead of 7.`);
      failed++;
    }
  } catch (e) {
    console.error('✕ TEST 01 FAIL with error:', e);
    failed++;
  }

  // Test 2: Location Tree Hierarchy Resolution
  try {
    const childIds = await getChildLocationIds('loc-karnataka');
    if (childIds.includes('loc-kodagu') && childIds.includes('loc-madikeri')) {
      console.log('✓ TEST 02 PASS: Hierarchical location query resolved Karnataka -> Kodagu -> Madikeri.');
      passed++;
    } else {
      console.error('✕ TEST 02 FAIL: Location hierarchy query did not return child nodes.');
      failed++;
    }
  } catch (e) {
    console.error('✕ TEST 02 FAIL with error:', e);
    failed++;
  }

  // Test 3: Password Complexity Validator
  try {
    const isWeakValid = isPasswordStrong('weakpass');
    const isStrongValid = isPasswordStrong('Traveler@2026');
    if (!isWeakValid && isStrongValid) {
      console.log('✓ TEST 03 PASS: Password complexity validator passed positive & negative tests.');
      passed++;
    } else {
      console.error('✕ TEST 03 FAIL: Password complexity validator failed.');
      failed++;
    }
  } catch (e) {
    console.error('✕ TEST 03 FAIL with error:', e);
    failed++;
  }

  // Test 4: Prohibited Experience Verification
  try {
    const db = await getDb();
    const foodExp = await db.get('SELECT * FROM experiences WHERE slug = "food" OR name = "Food"');
    const romanticExp = await db.get('SELECT * FROM experiences WHERE slug = "romantic" OR name = "Romantic"');
    if (!foodExp && !romanticExp) {
      console.log('✓ TEST 04 PASS: Prohibited experiences (Food, Romantic) strictly excluded from DB.');
      passed++;
    } else {
      console.error('✕ TEST 04 FAIL: Prohibited experiences found in database!');
      failed++;
    }
  } catch (e) {
    console.error('✕ TEST 04 FAIL with error:', e);
    failed++;
  }

  console.log(`--- TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  return { passed, failed };
}

runQaTestSuite();
