import { test, expect } from '@playwright/test';

test.describe('Travel & Experiences Automated E2E QA Test Suite', () => {
  
  test('TC-01: Home Page visual identity & 7 experience pills', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page.locator('h1')).toContainText('Where Journeys Become Stories');
    
    // Verify 7 approved experiences
    const experiences = ['Heritage', 'Nature', 'Road Trip', 'Adventure', 'Beach', 'Wellness', 'Hidden Places'];
    for (const exp of experiences) {
      await expect(page.locator(`text=${exp}`)).toBeVisible();
    }

    // Verify prohibited experiences are absent
    await expect(page.locator('text=Food')).not.toBeVisible();
    await expect(page.locator('text=Romantic')).not.toBeVisible();
  });

  test('TC-02: Location-Aware Dual Search (Coorg + Nature)', async ({ page }) => {
    await page.goto('http://localhost:3000/search?q=Coorg&exp=nature');
    await expect(page.locator('h1')).toContainText('Location-Aware Search & Discovery');
    await expect(page.locator('text=Monsoon Solo Ride to Abbey Falls')).toBeVisible();
  });

  test('TC-03: Destination Page & Horizontal 1-Photo Snap Gallery', async ({ page }) => {
    await page.goto('http://localhost:3000/destinations/hampi');
    await expect(page.locator('h1')).toContainText('Hampi Ruins');
    await expect(page.locator('text=Photos From This Place')).toBeVisible();
    await expect(page.locator('text=1 /')).toBeVisible();
  });

  test('TC-04: Journey Reader View & "Take Me There" CTA Button', async ({ page }) => {
    await page.goto('http://localhost:3000/journeys/journey-monsoon-coorg');
    await expect(page.locator('h1')).toContainText('Monsoon Solo Ride to Abbey Falls');
    await expect(page.locator('text=Take Me There →')).toBeVisible();
    
    // Verify excluded CTA buttons are absent
    await expect(page.locator('text=Read Journey')).not.toBeVisible();
    await expect(page.locator('text=View Photos')).not.toBeVisible();
    await expect(page.locator('text=Download Story')).not.toBeVisible();
  });

  test('TC-05: Authentication & Password Complexity Validation (Negative Test)', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup');
    await page.fill('input[type="text"]:nth-child(1)', 'Test User');
    await page.fill('input[type="text"]:nth-child(2)', 'testuser');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]:nth-child(1)', 'weakpass');
    await page.fill('input[type="password"]:nth-child(2)', 'weakpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password must contain at least 8 characters')).toBeVisible();
  });

  test('TC-06: NodeMailer OTP Password Recovery Flow', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/forgot-password');
    await page.fill('input[type="email"]', 'admin@travelandexperiences.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=6-Digit OTP Code')).toBeVisible();
  });

  test('TC-07: Single-Admin Protected Route Guard (Negative Test)', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    // Unauthenticated user should be redirected to login
    await expect(page).toHaveURL(/.*auth\/login/);
  });

});
