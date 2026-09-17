'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header({ user }: { user: any }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandTitle}>Travel & Experiences</span>
          <span className={styles.tagline}>Where Journeys Become Stories</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search destinations, journeys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>🔍</button>
        </form>

        <nav className={styles.navLinks}>
          <Link href="/destinations" className={styles.navLink}>Destinations</Link>
          <Link href="/search?exp=hidden-places" className={styles.navLink}>Hidden Places</Link>
          
          {user ? (
            <div className={styles.userProfileWrapper}>
              <Link href="/create-journey" className={styles.createBtn}>+ Create Journey</Link>
              <button onClick={() => setIsDrawerOpen(!isDrawerOpen)} className={styles.drawerToggleBtn}>
                ☰
              </button>
            </div>
          ) : (
            <div className={styles.authNavBtns}>
              <Link href="/auth/login" className={styles.loginBtn}>Sign In</Link>
              <Link href="/auth/signup" className={styles.signupBtn}>Sign Up</Link>
            </div>
          )}
        </nav>
      </div>

      {/* Slide-out Portal Drawer Navigation (☰) */}
      {isDrawerOpen && user && (
        <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>User Menu</h3>
              <button onClick={() => setIsDrawerOpen(false)} className={styles.closeBtn}>✕</button>
            </div>

            <div className={styles.userInfoBlock}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userHandle}>@{user.username} {user.role === 'ADMIN' && <span className={styles.adminBadge}>ADMIN</span>}</p>
            </div>

            <ul className={styles.drawerMenu}>
              <li><Link href={`/profile/${user.username}`} onClick={() => setIsDrawerOpen(false)}>My Profile</Link></li>
              <li><Link href="/dashboard/journeys" onClick={() => setIsDrawerOpen(false)}>My Journeys</Link></li>
              <li><Link href="/dashboard/saved" onClick={() => setIsDrawerOpen(false)}>Saved Journeys</Link></li>
              <li><Link href="/dashboard/liked" onClick={() => setIsDrawerOpen(false)}>Liked Journeys</Link></li>
              <li><Link href="/dashboard/photos" onClick={() => setIsDrawerOpen(false)}>My Photos</Link></li>
              <li><Link href="/dashboard/notifications" onClick={() => setIsDrawerOpen(false)}>Notifications</Link></li>
              <li><Link href="/dashboard/settings" onClick={() => setIsDrawerOpen(false)}>Settings</Link></li>
              {user.role === 'ADMIN' && (
                <li><Link href="/admin" className={styles.adminMenuLink} onClick={() => setIsDrawerOpen(false)}>🛡️ Admin Moderation</Link></li>
              )}
              <li className={styles.logoutItem}>
                <button onClick={() => window.location.href = '/api/auth/logout'} className={styles.logoutBtn}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
