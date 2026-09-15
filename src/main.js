import { state, CANONICAL_EXPERIENCES } from './state.js';
import { initUIListeners, showToast } from './components.js';

// MAIN RENDER ENGINE
function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  // Update Header Button States
  const createBtn = document.getElementById('btn-create-story');
  const profileBtn = document.getElementById('btn-profile');
  const authBtn = document.getElementById('btn-auth');

  if (state.currentUser) {
    if (createBtn) createBtn.style.display = 'inline-flex';
    if (profileBtn) profileBtn.style.display = 'inline-flex';
    if (authBtn) authBtn.textContent = `Sign Out (${state.currentUser.name})`;
  } else {
    if (createBtn) createBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'none';
    if (authBtn) authBtn.textContent = 'Sign In';
  }

  // View Switching Router
  switch (state.currentView) {
    case 'home':
      renderHomeView(root);
      break;
    case 'story':
      renderStoryView(root);
      break;
    case 'destination':
      renderDestinationView(root);
      break;
    case 'profile':
      renderProfileView(root);
      break;
    case 'admin':
      renderAdminView(root);
      break;
    default:
      renderHomeView(root);
  }
}

// 1. HOMEPAGE VIEW RENDERER
function renderHomeView(container) {
  // Apply Search / Experience Filters
  let filteredStories = state.stories;

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    // Synonym mapping: Coorg -> Kodagu
    const resolvedQ = q === 'coorg' ? 'kodagu' : q;

    filteredStories = state.stories.filter(s => {
      const loc = state.locations.find(l => l.id === s.locationId);
      const locNameMatch = loc && (loc.name.toLowerCase().includes(resolvedQ) || (loc.alias && loc.alias.toLowerCase().includes(resolvedQ)));
      const pathMatch = s.locationPath.toLowerCase().includes(resolvedQ);
      const titleMatch = s.title.toLowerCase().includes(resolvedQ);
      const expMatch = s.experiences.some(e => e.toLowerCase().includes(resolvedQ));
      const bodyMatch = s.richBody.toLowerCase().includes(resolvedQ);

      return locNameMatch || pathMatch || titleMatch || expMatch || bodyMatch;
    });
  } else if (state.activeFilterExp) {
    filteredStories = state.stories.filter(s => s.experiences.includes(state.activeFilterExp));
  }

  container.innerHTML = `
    <!-- Hero Banner -->
    <section class="hero-section">
      <h1 class="hero-title">Where Journeys Become Stories.</h1>
      <p class="hero-subtitle">Discover places, experiences, and authentic stories from people who travelled them.</p>
      <button class="btn btn-primary" id="hero-cta" style="font-size: 1rem; padding: 0.85rem 1.8rem;">Explore Your Journey →</button>
    </section>

    <div class="container">
      <!-- 13 Canonical Experience Pills Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h3 style="font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted-text);">Explore by Experience</h3>
        ${state.activeFilterExp ? `<button id="clear-exp-filter" style="background: none; border: none; font-size: 0.85rem; color: var(--color-terracotta); font-weight: 700; cursor: pointer;">Clear Filter ✕</button>` : ''}
      </div>

      <div class="experience-pills">
        ${CANONICAL_EXPERIENCES.map(exp => `
          <button class="pill ${state.activeFilterExp === exp ? 'active' : ''}" data-exp="${exp}">${exp}</button>
        `).join('')}
      </div>

      <!-- Section Title & Results Count -->
      <div style="margin-top: 2rem; display: flex; align-items: baseline; justify-content: space-between;">
        <div>
          <h2 class="section-title">
            ${state.searchQuery ? `Search Results for "${state.searchQuery}"` : state.activeFilterExp ? `${state.activeFilterExp} Journeys` : 'Trending Journey Stories'}
          </h2>
          <p style="color: var(--color-muted-text); font-size: 0.95rem;">
            ${filteredStories.length} ${filteredStories.length === 1 ? 'story' : 'stories'} discovered
          </p>
        </div>
      </div>

      <!-- Story Cards Grid -->
      ${filteredStories.length === 0 ? `
        <div style="text-align: center; padding: 4rem 1rem; background: var(--color-warm-white); border-radius: var(--radius-md); border: 1px dashed var(--color-soft-border); margin-top: 2rem;">
          <h3 style="font-size: 1.4rem; color: var(--color-forest-charcoal); margin-bottom: 0.5rem;">No exact stories found</h3>
          <p style="color: var(--color-muted-text); margin-bottom: 1.5rem;">Try searching for another place like "Coorg", "Goa", or select an experience category above.</p>
          <button class="btn btn-secondary" id="btn-reset-search">View All Stories</button>
        </div>
      ` : `
        <div class="cards-grid">
          ${filteredStories.map(story => renderStoryCard(story)).join('')}
        </div>
      `}
    </div>
  `;

  // Home Event Listeners
  const heroCta = document.getElementById('hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', () => {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
  }

  const clearExpBtn = document.getElementById('clear-exp-filter');
  if (clearExpBtn) {
    clearExpBtn.addEventListener('click', () => {
      state.activeFilterExp = null;
      renderApp();
    });
  }

  const resetSearchBtn = document.getElementById('btn-reset-search');
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.activeFilterExp = null;
      const input = document.getElementById('global-search-input');
      if (input) input.value = '';
      renderApp();
    });
  }

  // Pill click handlers
  document.querySelectorAll('.experience-pills .pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exp = e.target.getAttribute('data-exp');
      state.activeFilterExp = state.activeFilterExp === exp ? null : exp;
      renderApp();
    });
  });

  // Story Card Event Delegations (Read, Upvote, Save, Share)
  attachCardEvents();
}

// STORY CARD RENDER HELPER (Supporting Polaroid, Postcard, Editorial, Journal, Map Frames)
function renderStoryCard(story) {
  const loc = state.locations.find(l => l.id === story.locationId);
  const locName = loc ? loc.name : 'Destination';

  let frameClass = 'card-frame-polaroid';
  if (story.cardFrame === 'postcard') frameClass = 'card-frame-postcard';
  if (story.cardFrame === 'editorial') frameClass = 'card-frame-editorial';
  if (story.cardFrame === 'journal') frameClass = 'card-frame-journal';
  if (story.cardFrame === 'map') frameClass = 'card-frame-map';

  return `
    <article class="travel-card ${frameClass}">
      ${story.cardFrame === 'postcard' ? `<div class="stamp-badge">Postcard</div>` : ''}
      <div class="card-media-wrapper">
        <img src="${story.coverMedia}" alt="${story.title}" class="card-media" loading="lazy">
        <div class="card-badge">${story.experiences[0] || 'Journey'}</div>
      </div>
      <div class="card-body">
        <div class="card-location">📍 ${locName}</div>
        <h3 class="card-title">${story.title}</h3>
        <p class="card-excerpt">${story.subheadline}</p>

        <div class="card-meta">
          <div class="card-author">
            <div class="author-avatar">${story.author.avatar || 'A'}</div>
            <span>${story.author.name}</span>
          </div>
          <div class="card-actions">
            <button class="btn-icon btn-upvote ${story.upvotedByMe ? 'active' : ''}" data-id="${story.id}" title="Upvote story">
              ${story.upvotedByMe ? '♥' : '♡'} ${story.upvotes}
            </button>
            <button class="btn-icon btn-save ${story.savedByMe ? 'active' : ''}" data-id="${story.id}" title="Save to Scrapbook">
              ${story.savedByMe ? '🔖' : '📑'}
            </button>
            <button class="btn-icon btn-share" data-id="${story.id}" title="Share Story">↗</button>
          </div>
        </div>

        <button class="btn btn-secondary btn-read-story" data-id="${story.id}" style="width: 100%; margin-top: 1rem; font-size: 0.85rem;">Take Me There →</button>
      </div>
    </article>
  `;
}

// ATTACH CARD EVENTS
function attachCardEvents() {
  // Read Story
  document.querySelectorAll('.btn-read-story').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      state.activeStoryId = id;
      state.currentView = 'story';
      renderApp();
    });
  });

  // Upvote
  document.querySelectorAll('.btn-upvote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-upvote').getAttribute('data-id');
      state.toggleUpvote(id);
      renderApp();
    });
  });

  // Save / Bookmark
  document.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-save').getAttribute('data-id');
      state.toggleSave(id);
      showToast(state.savedScrapbook.includes(id) ? 'Saved to your Scrapbook!' : 'Removed from Scrapbook.');
      renderApp();
    });
  });

  // Share Modal & Copy Link
  document.querySelectorAll('.btn-share').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-share').getAttribute('data-id');
      const story = state.stories.find(s => s.id === id);
      if (!story) return;

      const shareURL = window.location.href;
      navigator.clipboard.writeText(shareURL);
      showToast('✓ Link copied to clipboard!');
    });
  });
}

// 2. STORY VIEW RENDERER (Immersive Reader & Offline Downloader)
function renderStoryView(container) {
  const story = state.stories.find(s => s.id === state.activeStoryId);
  if (!story) {
    state.currentView = 'home';
    renderApp();
    return;
  }

  const loc = state.locations.find(l => l.id === story.locationId);

  container.innerHTML = `
    <div class="container" style="max-width: 900px; padding-top: 2rem;">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a href="#" id="bread-home">Home</a> &rsaquo;
        <span>${story.locationPath}</span> &rsaquo;
        <span style="color: var(--color-forest-charcoal); font-weight: 700;">${story.title}</span>
      </nav>

      <!-- Story Cover -->
      <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 2.5rem; box-shadow: var(--shadow-hover);">
        <img src="${story.coverMedia}" alt="${story.title}" style="width: 100%; height: 440px; object-fit: cover;">
        <div style="position: absolute; bottom: 0; inset-x: 0; background: linear-gradient(180deg, transparent 0%, rgba(31,42,36,0.9) 100%); padding: 2.5rem 2rem 1.5rem; color: #fff;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
            ${story.experiences.map(e => `<span style="background: var(--color-terracotta); padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${e}</span>`).join('')}
          </div>
          <h1 style="font-size: clamp(2rem, 4vw, 3.2rem); color: #fff; margin-bottom: 0.5rem; line-height: 1.2;">${story.title}</h1>
          <p style="font-family: var(--font-serif-body); font-size: 1.2rem; opacity: 0.9;">${story.subheadline}</p>
        </div>
      </div>

      <!-- Author Meta & Actions Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-y: 1px solid var(--color-soft-border); padding: 1.25rem 0; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="author-avatar" style="width: 44px; height: 44px; font-size: 1.1rem;">${story.author.avatar || 'A'}</div>
          <div>
            <div style="font-weight: 700; font-size: 1rem;">${story.author.name}</div>
            <div style="font-size: 0.85rem; color: var(--color-muted-text);">Published in ${loc ? loc.name : 'Destination'} &bull; ${story.readingTime}</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-secondary btn-upvote ${story.upvotedByMe ? 'active' : ''}" data-id="${story.id}">
            ${story.upvotedByMe ? '♥ Upvoted' : '♡ Upvote'} (${story.upvotes})
          </button>
          <button class="btn btn-secondary btn-save ${story.savedByMe ? 'active' : ''}" data-id="${story.id}">
            ${story.savedByMe ? '🔖 Saved' : '📑 Save'}
          </button>
          <button class="btn btn-forest" id="btn-download-story">⬇️ Download Offline Package</button>
        </div>
      </div>

      <!-- Optional Chapters Navigation -->
      ${story.chapters && story.chapters.length > 0 ? `
        <div style="background: var(--color-warm-white); border-left: 4px solid var(--color-deep-forest); padding: 1.25rem 1.5rem; border-radius: var(--radius-sm); margin-bottom: 2.5rem; box-shadow: var(--shadow-soft);">
          <h4 style="font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-terracotta); margin-bottom: 0.75rem;">Story Chapters</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
            ${story.chapters.map(c => `<li style="font-size: 0.95rem; font-weight: 600; color: var(--color-forest-charcoal);">📍 ${c.title} — <span style="font-weight: 400; color: var(--color-muted-text);">${c.content}</span></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Main Rich Body Content -->
      <article class="story-body" id="story-content-body">
        ${story.richBody}
      </article>

      <!-- Optional Timeline Render -->
      ${story.timeline && story.timeline.length > 0 ? `
        <div style="margin: 3rem 0; padding: 1.5rem; background: var(--color-warm-white); border-radius: var(--radius-md); border: 1px solid var(--color-soft-border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 1.25rem; color: var(--color-deep-forest);">Day Itinerary & Timeline</h3>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${story.timeline.map(t => `
              <div style="display: flex; gap: 1.5rem; border-left: 2px solid var(--color-terracotta); padding-left: 1rem;">
                <span style="font-weight: 700; color: var(--color-terracotta); min-width: 80px;">${t.time}</span>
                <span style="color: var(--color-forest-charcoal); font-weight: 500;">${t.detail}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Aggregated Hidden Spots Callout -->
      ${story.hiddenSpots && story.hiddenSpots.length > 0 ? `
        <div style="margin-top: 3rem; background: var(--color-forest-charcoal); color: var(--color-warm-ivory); padding: 2rem; border-radius: var(--radius-md);">
          <h3 style="color: var(--color-sunset-gold); font-size: 1.3rem; margin-bottom: 0.5rem;">Beyond the Tourist Map 🗺️</h3>
          <p style="font-size: 0.9rem; color: var(--color-sand-beige); margin-bottom: 1rem;">Hidden places shared in this story:</p>
          <ul style="padding-left: 1.25rem;">
            ${story.hiddenSpots.map(spot => `<li style="margin-bottom: 0.35rem; font-weight: 600;">${spot}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

  // Breadcrumb home click
  const breadHome = document.getElementById('bread-home');
  if (breadHome) {
    breadHome.addEventListener('click', (e) => {
      e.preventDefault();
      state.currentView = 'home';
      renderApp();
    });
  }

  // Offline Download Button Action
  const downloadBtn = document.getElementById('btn-download-story');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const content = `
==================================================
${story.title.toUpperCase()}
${story.subheadline}
Author: ${story.author.name}
Location: ${story.locationPath}
Reading Time: ${story.readingTime}
==================================================

STORY NARRATIVE:
${story.richBody.replace(/<[^>]+>/g, '')}

HIDDEN SPOTS & TIPS:
${story.hiddenSpots.join('\n')}

==================================================
Downloaded from Travel & Experiences Platform
      `;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}_offline_story.txt`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('✓ Story downloaded for offline reading!');
    });
  }

  attachCardEvents();
}

// 3. DESTINATION EXPLORER VIEW RENDERER
function renderDestinationView(container) {
  const loc = state.locations.find(l => l.id === state.activeLocationId);
  if (!loc) {
    state.currentView = 'home';
    renderApp();
    return;
  }

  const linkedStories = state.stories.filter(s => s.locationId === loc.id || s.locationPath.includes(loc.name));

  container.innerHTML = `
    <div class="container" style="padding-top: 2rem;">
      <nav class="breadcrumb">
        <a href="#" id="dest-bread-home">Home</a> &rsaquo;
        <span>Locations</span> &rsaquo;
        <span style="color: var(--color-forest-charcoal); font-weight: 700;">${loc.name}</span>
      </nav>

      <div style="background: var(--color-deep-forest); color: #fff; padding: 3rem 2rem; border-radius: var(--radius-lg); margin-bottom: 3rem;">
        <span style="background: var(--color-terracotta); padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${loc.level}</span>
        <h1 style="font-size: 3rem; color: #fff; margin: 0.5rem 0;">${loc.name}</h1>
        <p style="font-family: var(--font-serif-body); font-size: 1.15rem; color: var(--color-sand-beige);">Explore stories, experiences, and hidden spots in ${loc.name}.</p>
      </div>

      <h2 class="section-title">Journeys in ${loc.name}</h2>
      <div class="cards-grid">
        ${linkedStories.length === 0 ? `<p style="color: var(--color-muted-text);">No stories yet. Be the first to publish a story in ${loc.name}!</p>` : linkedStories.map(s => renderStoryCard(s)).join('')}
      </div>
    </div>
  `;

  const breadHome = document.getElementById('dest-bread-home');
  if (breadHome) {
    breadHome.addEventListener('click', (e) => {
      e.preventDefault();
      state.currentView = 'home';
      renderApp();
    });
  }

  attachCardEvents();
}

// 4. USER PROFILE & DIGITAL SCRAPBOOK VIEW
function renderProfileView(container) {
  if (!state.currentUser) {
    state.currentView = 'home';
    renderApp();
    return;
  }

  const myStories = state.stories.filter(s => s.author.name === state.currentUser.name);
  const savedStories = state.stories.filter(s => state.savedScrapbook.includes(s.id));

  container.innerHTML = `
    <div class="container" style="padding-top: 2rem;">
      <div style="display: flex; align-items: center; gap: 1.5rem; background: var(--color-warm-white); padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--color-soft-border); margin-bottom: 2.5rem;">
        <div class="author-avatar" style="width: 70px; height: 70px; font-size: 1.8rem; background: var(--color-deep-forest); color: #fff;">${state.currentUser.name[0].toUpperCase()}</div>
        <div>
          <h1 style="font-size: 1.8rem; margin-bottom: 0.2rem;">${state.currentUser.name}</h1>
          <p style="color: var(--color-muted-text); font-size: 0.9rem;">${state.currentUser.email} &bull; <span style="color: var(--color-terracotta); font-weight: 700;">${state.currentUser.role}</span></p>
        </div>
      </div>

      <h2 class="section-title" style="margin-bottom: 1.5rem;">My Saved Scrapbook 🔖</h2>
      <div class="cards-grid" style="margin-bottom: 3rem;">
        ${savedStories.length === 0 ? `<p style="color: var(--color-muted-text);">Your scrapbook is empty. Bookmark stories using the 🔖 button while browsing!</p>` : savedStories.map(s => renderStoryCard(s)).join('')}
      </div>

      <h2 class="section-title" style="margin-bottom: 1.5rem;">My Published Journeys ✍️</h2>
      <div class="cards-grid">
        ${myStories.length === 0 ? `<p style="color: var(--color-muted-text);">You haven't written any stories yet. Click "Write Story" in the header to share your journey!</p>` : myStories.map(s => renderStoryCard(s)).join('')}
      </div>
    </div>
  `;

  attachCardEvents();
}

// INITIALIZATION ENTRYPOINT
document.addEventListener('DOMContentLoaded', () => {
  initUIListeners(renderApp);
  renderApp();
});
