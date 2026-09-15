import { state, CANONICAL_EXPERIENCES } from './state.js';

// Helper Utilities
export function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function openModal(htmlContent) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = htmlContent;
  overlay.classList.add('active');
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

// Global UI Event Listeners Initialization
export function initUIListeners(renderCallback) {
  // Modal Close Button
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Overlay Backdrop Click
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  // Brand Home Link
  const homeLink = document.getElementById('brand-home-link');
  if (homeLink) {
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      state.currentView = 'home';
      state.searchQuery = '';
      state.activeFilterExp = null;
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.value = '';
      renderCallback();
    });
  }

  // Global Search Input
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      state.currentView = 'home';
      renderCallback();
    });
  }

  // Auth Button (Sign In / Sign Out)
  const authBtn = document.getElementById('btn-auth');
  if (authBtn) {
    authBtn.addEventListener('click', () => {
      if (state.currentUser) {
        state.logoutUser();
        showToast('Successfully logged out.');
        renderCallback();
      } else {
        renderAuthModal(renderCallback);
      }
    });
  }

  // Write Story Button
  const writeBtn = document.getElementById('btn-create-story');
  if (writeBtn) {
    writeBtn.addEventListener('click', () => {
      if (!state.currentUser) {
        renderAuthModal(renderCallback);
        return;
      }
      renderStoryCreatorModal(renderCallback);
    });
  }

  // Profile Button
  const profileBtn = document.getElementById('btn-profile');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      state.currentView = 'profile';
      renderCallback();
    });
  }

  // Footer Links
  document.querySelectorAll('.footer-exp-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const exp = e.target.getAttribute('data-exp');
      state.activeFilterExp = exp;
      state.currentView = 'home';
      renderCallback();
    });
  });

  document.querySelectorAll('.footer-loc-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const locName = e.target.getAttribute('data-loc');
      const loc = state.locations.find(l => l.name.toLowerCase() === locName.toLowerCase());
      if (loc) {
        state.activeLocationId = loc.id;
        state.currentView = 'destination';
        renderCallback();
      }
    });
  });
}

// AUTH MODAL RENDERER
export function renderAuthModal(renderCallback) {
  const modalHTML = `
    <h2 style="font-family: var(--font-serif-hero); font-size: 1.8rem; margin-bottom: 0.5rem; text-align: center;">Welcome to Travel & Experiences</h2>
    <p style="text-align: center; color: var(--color-muted-text); font-size: 0.9rem; margin-bottom: 1.5rem;">Join a community of travelers and storytellers</p>
    
    <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid var(--color-soft-border); margin-bottom: 1.5rem;">
      <button id="tab-login" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid var(--color-terracotta); background: none; font-weight: 700;">Login</button>
      <button id="tab-signup" class="btn" style="flex: 1; border-radius: 0; border-bottom: 2px solid transparent; background: none; color: var(--color-muted-text);">Register</button>
    </div>

    <!-- Login Form -->
    <form id="form-login">
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" id="login-email" class="form-control" placeholder="explorer@travel.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" id="login-password" class="form-control" placeholder="••••••••" required>
      </div>
      <div style="text-align: right; margin-bottom: 1.25rem;">
        <a href="#" id="link-forgot-password" style="font-size: 0.85rem; color: var(--color-terracotta); text-decoration: none; font-weight: 600;">Forgot Password?</a>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
    </form>

    <!-- Register Form (Hidden by default) -->
    <form id="form-signup" style="display: none;">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" id="signup-name" class="form-control" placeholder="Aarav Sharma" required>
      </div>
      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input type="email" id="signup-email" class="form-control" placeholder="explorer@travel.com" required>
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input type="password" id="signup-password" class="form-control" placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special" required>
        <small style="font-size: 0.75rem; color: var(--color-muted-text); display: block; margin-top: 0.25rem;">Must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.</small>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Create Account</button>
    </form>

    <!-- Social Authentication Divider -->
    <div style="display: flex; align-items: center; margin: 1.5rem 0; gap: 0.75rem;">
      <div style="flex: 1; height: 1px; background: var(--color-soft-border);"></div>
      <span style="font-size: 0.75rem; color: var(--color-muted-text); text-transform: uppercase; letter-spacing: 0.05em;">Or continue with</span>
      <div style="flex: 1; height: 1px; background: var(--color-soft-border);"></div>
    </div>

    <!-- Social Auth Buttons -->
    <div style="display: flex; gap: 0.75rem;">
      <button class="btn btn-secondary social-btn" data-provider="Google" style="flex: 1; font-size: 0.85rem;">🌐 Google</button>
      <button class="btn btn-secondary social-btn" data-provider="GitHub" style="flex: 1; font-size: 0.85rem;">💻 GitHub</button>
      <button class="btn btn-secondary social-btn" data-provider="LinkedIn" style="flex: 1; font-size: 0.85rem;">💼 LinkedIn</button>
    </div>
  `;

  openModal(modalHTML);

  // Auth Modal Event Handlers
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const forgotLink = document.getElementById('link-forgot-password');

  tabLogin.addEventListener('click', () => {
    tabLogin.style.borderColor = 'var(--color-terracotta)';
    tabLogin.style.color = 'var(--color-forest-charcoal)';
    tabSignup.style.borderColor = 'transparent';
    tabSignup.style.color = 'var(--color-muted-text)';
    formLogin.style.display = 'block';
    formSignup.style.display = 'none';
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.style.borderColor = 'var(--color-terracotta)';
    tabSignup.style.color = 'var(--color-forest-charcoal)';
    tabLogin.style.borderColor = 'transparent';
    tabLogin.style.color = 'var(--color-muted-text)';
    formSignup.style.display = 'block';
    formLogin.style.display = 'none';
  });

  // Forgot Password Trigger
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderForgotPasswordModal(renderCallback);
  });

  // Login Submit
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const user = {
      name: email.split('@')[0],
      email: email,
      role: email.includes('admin') ? 'Admin' : 'Registered User'
    };
    state.loginUser(user);
    closeModal();
    showToast(`Welcome back, ${user.name}!`);
    renderCallback();
  });

  // Signup Submit
  formSignup.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Validate Password Policy: min 8, 1 uppercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }

    const user = {
      name: name,
      email: email,
      role: 'Registered User'
    };
    state.loginUser(user);
    closeModal();
    showToast(`Account created! Welcome, ${user.name}`);
    renderCallback();
  });

  // Social Auth Click Handler
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const provider = e.target.getAttribute('data-provider');
      const user = {
        name: `${provider} Traveler`,
        email: `traveler@${provider.toLowerCase()}.com`,
        role: 'Registered User'
      };
      state.loginUser(user);
      closeModal();
      showToast(`Authenticated via ${provider}!`);
      renderCallback();
    });
  });
}

// FORGOT PASSWORD & OTP ENGINE MODAL
export function renderForgotPasswordModal(renderCallback) {
  const modalHTML = `
    <h2 style="font-family: var(--font-serif-hero); font-size: 1.6rem; margin-bottom: 0.5rem; text-align: center;">Reset Your Password</h2>
    <p style="text-align: center; color: var(--color-muted-text); font-size: 0.85rem; margin-bottom: 1.5rem;">Enter your registered email to receive a 6-digit OTP code</p>

    <!-- Step 1: Request OTP -->
    <div id="otp-step-1">
      <div class="form-group">
        <label class="form-label">Registered Email Address</label>
        <input type="email" id="forgot-email" class="form-control" placeholder="explorer@travel.com" required>
      </div>
      <button id="btn-send-otp" class="btn btn-primary" style="width: 100%;">Send 6-Digit OTP</button>
    </div>

    <!-- Step 2: Verify OTP (Hidden Initially) -->
    <div id="otp-step-2" style="display: none;">
      <div class="form-group">
        <label class="form-label">Enter 6-Digit OTP</label>
        <input type="text" id="input-otp" class="form-control" placeholder="e.g. 849201" maxlength="6" style="letter-spacing: 0.3em; text-align: center; font-size: 1.2rem; font-weight: 700;">
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <span id="otp-timer-text" style="font-size: 0.85rem; color: var(--color-terracotta); font-weight: 700;">⏱️ Code expires in: 60s</span>
        <button id="btn-resend-otp" class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.3rem 0.8rem;" disabled>Resend OTP</button>
      </div>
      <button id="btn-verify-otp" class="btn btn-forest" style="width: 100%;">Verify OTP & Proceed</button>
    </div>

    <!-- Step 3: New Password (Hidden Initially) -->
    <div id="otp-step-3" style="display: none;">
      <div class="form-group">
        <label class="form-label">New Password</label>
        <input type="password" id="new-password" class="form-control" placeholder="••••••••" required>
      </div>
      <div class="form-group">
        <label class="form-label">Confirm New Password</label>
        <input type="password" id="confirm-password" class="form-control" placeholder="••••••••" required>
      </div>
      <button id="btn-reset-password" class="btn btn-primary" style="width: 100%;">Update Password & Login</button>
    </div>
  `;

  openModal(modalHTML);

  const step1 = document.getElementById('otp-step-1');
  const step2 = document.getElementById('otp-step-2');
  const step3 = document.getElementById('otp-step-3');
  const sendBtn = document.getElementById('btn-send-otp');
  const resendBtn = document.getElementById('btn-resend-otp');
  const verifyBtn = document.getElementById('btn-verify-otp');
  const resetBtn = document.getElementById('btn-reset-password');
  const timerText = document.getElementById('otp-timer-text');

  let generatedOTP = null;

  sendBtn.addEventListener('click', () => {
    const email = document.getElementById('forgot-email').value;
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }
    // Simulate OTP generation
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    showToast(`DEMO OTP sent to ${email}: ${generatedOTP}`);

    step1.style.display = 'none';
    step2.style.display = 'block';

    // Start 60s Countdown Timer
    let secondsLeft = 60;
    resendBtn.disabled = true;
    const timerInterval = setInterval(() => {
      secondsLeft -= 1;
      timerText.textContent = `⏱️ Code expires in: ${secondsLeft}s`;
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        timerText.textContent = `⚠️ Code expired`;
        resendBtn.disabled = false;
      }
    }, 1000);

    resendBtn.addEventListener('click', () => {
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      showToast(`NEW DEMO OTP sent: ${generatedOTP}`);
      secondsLeft = 60;
      resendBtn.disabled = true;
    });
  });

  verifyBtn.addEventListener('click', () => {
    const userEntered = document.getElementById('input-otp').value.trim();
    if (userEntered === generatedOTP) {
      showToast('✓ OTP verified successfully!');
      step2.style.display = 'none';
      step3.style.display = 'block';
    } else {
      alert('Invalid OTP. Please check the code and try again.');
    }
  });

  resetBtn.addEventListener('click', () => {
    const pass = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    if (pass !== confirm) {
      alert('Passwords do not match.');
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(pass)) {
      alert('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }

    closeModal();
    showToast('Password updated! You can now log in with your new credentials.');
  });
}

// STORY CREATOR MODAL
export function renderStoryCreatorModal(renderCallback) {
  const modalHTML = `
    <h2 style="font-family: var(--font-serif-hero); font-size: 1.8rem; margin-bottom: 0.5rem;">Write Your Journey Story</h2>
    <p style="color: var(--color-muted-text); font-size: 0.9rem; margin-bottom: 1.5rem;">Share your authentic travel experience, photos, tips, and hidden places.</p>

    <form id="form-create-story" style="max-height: 70vh; overflow-y: auto; padding-right: 0.5rem;">
      <div class="form-group">
        <label class="form-label">Story Title</label>
        <input type="text" id="story-title" class="form-control" placeholder="e.g. Rainy Afternoons in a Coorg Coffee Estate" required>
      </div>

      <div class="form-group">
        <label class="form-label">Subheadline / Short Tagline</label>
        <input type="text" id="story-subheadline" class="form-control" placeholder="e.g. Listening to monsoon rhythms among misty cardamom trails" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Location (Destination / District)</label>
          <input type="text" id="story-location-input" class="form-control" placeholder="Type location (e.g. Madikeri, Goa)..." required>
          <small style="font-size: 0.75rem; color: var(--color-muted-text);">Exits or dynamically creates new location entry.</small>
        </div>

        <div class="form-group">
          <label class="form-label">Visual Card Frame</label>
          <select id="story-card-frame" class="form-control">
            <option value="polaroid">Polaroid Frame</option>
            <option value="postcard">Postcard Frame</option>
            <option value="editorial">Editorial Frame</option>
            <option value="journal">Journal Frame</option>
            <option value="map">Map Frame</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Select Experience Categories (Multi-select)</label>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-height: 120px; overflow-y: auto; padding: 0.5rem; border: 1px solid var(--color-soft-border); border-radius: 4px; background: #fff;">
          ${CANONICAL_EXPERIENCES.map(exp => `
            <label style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.3rem; background: var(--color-warm-ivory); padding: 0.2rem 0.6rem; border-radius: 12px; cursor: pointer;">
              <input type="checkbox" name="story-experiences" value="${exp}"> ${exp}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Cover Image URL</label>
        <input type="url" id="story-cover-url" class="form-control" placeholder="https://images.unsplash.com/photo-..." required>
      </div>

      <div class="form-group">
        <label class="form-label">Rich Editorial Story Content</label>
        <textarea id="story-rich-body" class="form-control" rows="6" placeholder="Write your story using HTML tags like <h2>, <p>, <blockquote>, or formatting..." required></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Hidden Place Tip (Optional callout spot)</label>
        <input type="text" id="story-hidden-spot" class="form-control" placeholder="e.g. Secret quiet viewpoint behind Abbey Falls">
      </div>

      <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Publish Story Instantly →</button>
    </form>
  `;

  openModal(modalHTML);

  const form = document.getElementById('form-create-story');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('story-title').value;
    const subheadline = document.getElementById('story-subheadline').value;
    const locInput = document.getElementById('story-location-input').value.trim();
    const frame = document.getElementById('story-card-frame').value;
    const coverUrl = document.getElementById('story-cover-url').value;
    const richBody = document.getElementById('story-rich-body').value;
    const hiddenSpot = document.getElementById('story-hidden-spot').value.trim();

    // Collect selected experiences
    const selectedExps = Array.from(document.querySelectorAll('input[name="story-experiences"]:checked')).map(cb => cb.value);
    if (selectedExps.length === 0) selectedExps.push('Nature');

    // Dynamic Location Registration if not present
    let loc = state.locations.find(l => l.name.toLowerCase() === locInput.toLowerCase());
    if (!loc) {
      loc = state.addLocation({
        id: `loc-${Date.now()}`,
        name: locInput,
        level: 'Destination',
        parentId: 'loc-1'
      });
    }

    const newStory = {
      id: `story-${Date.now()}`,
      title: title,
      subheadline: subheadline,
      author: { name: state.currentUser ? state.currentUser.name : 'Anonymous Explorer', avatar: 'A' },
      locationId: loc.id,
      locationPath: `India -> ${loc.name}`,
      experiences: selectedExps,
      cardFrame: frame,
      coverMedia: coverUrl,
      readingTime: '4 min read',
      upvotes: 1,
      upvotedByMe: false,
      savedByMe: false,
      richBody: richBody.includes('<p>') ? richBody : `<p>${richBody}</p>`,
      hiddenSpots: hiddenSpot ? [hiddenSpot] : [],
      chapters: [],
      timeline: []
    };

    state.addStory(newStory);
    closeModal();
    showToast('✨ Your Journey Story is now Published and Live!');
    state.currentView = 'home';
    renderCallback();
  });
}
