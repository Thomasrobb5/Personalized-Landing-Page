/* ==========================================================================
   Premium Glassmorphic Dashboard Functionality (app.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Widgets and Interactive Elements
  initGreeting();
  initClock();
  initSearchFilter();
  initKeyboardShortcuts();
  initNotepad();
  initThemePicker();
  initCardMouseGlow();
  initDockFisheye();
});

/**
 * 1. Dynamic Greeting
 * Updates greeting banner text based on local hour of the day.
 */
function initGreeting() {
  const greetingEl = document.getElementById('greeting');
  if (!greetingEl) return;

  const hour = new Date().getHours();
  let greetingText = 'Welcome back';

  if (hour >= 5 && hour < 12) {
    greetingText = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greetingText = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    greetingText = 'Good evening';
  } else {
    greetingText = 'Good night';
  }

  greetingEl.textContent = `${greetingText}, Thomas`;
}

/**
 * 2. Digital Clock Widget
 * Updates the display time and date on a 1-second interval.
 */
function initClock() {
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const dateEl = document.getElementById('clock-date');

  if (!hoursEl || !minutesEl || !secondsEl || !dateEl) return;

  function updateClock() {
    const now = new Date();
    
    // Time Formatting
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;

    // Date Formatting (e.g. Wednesday, June 3, 2026)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString(undefined, options);
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * 3. Search Bar Filter
 * Filters app cards by title or description dynamically.
 */
function initSearchFilter() {
  const searchInput = document.getElementById('search-input');
  const cards = document.querySelectorAll('.app-card');
  const noResults = document.getElementById('no-results');

  if (!searchInput || cards.length === 0) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector('.app-title').textContent.toLowerCase();
      const desc = card.querySelector('.app-description').textContent.toLowerCase();

      if (title.includes(query) || desc.includes(query)) {
        card.style.display = 'flex';
        // Add subtle animation delay for cards returning
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 50);
        visibleCount++;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        // Set display none after opacity animation completes
        card.style.display = 'none';
      }
    });

    // Check empty state
    if (visibleCount === 0) {
      noResults.style.display = 'flex';
    } else {
      noResults.style.display = 'none';
    }
  });
}

/**
 * 4. LocalStorage Notepad
 * Implements a notes textarea which saves automatically on input, with a debounced indicator.
 */
function initNotepad() {
  const notepad = document.getElementById('notepad-textarea');
  const status = document.getElementById('notepad-status');
  const STORAGE_KEY = 'launchpad_personal_notes';

  if (!notepad || !status) return;

  // Load notes
  const savedNotes = localStorage.getItem(STORAGE_KEY);
  if (savedNotes !== null) {
    notepad.value = savedNotes;
  }

  let saveDebounceTimeout;

  notepad.addEventListener('input', () => {
    // Show saving status spinner
    status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    status.style.opacity = '1';

    clearTimeout(saveDebounceTimeout);

    // Save with 500ms debounce
    saveDebounceTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, notepad.value);
      status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Saved';
      
      // Gradually fade out status
      setTimeout(() => {
        status.style.opacity = '0.7';
      }, 1500);
    }, 500);
  });
}

/**
 * 5. Theme Picker Widget
 * Saves active theme selection in localStorage and adds classes to body.
 */
function initThemePicker() {
  const themeBtns = document.querySelectorAll('.theme-btn');
  const body = document.body;
  const STORAGE_KEY = 'launchpad_active_theme';

  if (themeBtns.length === 0) return;

  // Load theme preference
  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'theme-midnight-nebula';
  body.className = savedTheme;

  // Highlight active theme button
  themeBtns.forEach(btn => {
    const themeName = btn.getAttribute('data-theme');
    if (themeName === savedTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    // Toggle click listeners
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      body.className = themeName;
      localStorage.setItem(STORAGE_KEY, themeName);
    });
  });
}

/**
 * 6. Mouse Glow Hover effect
 * Track cursor placement inside cards to position radial gradient reflection coordinate variables.
 */
function initCardMouseGlow() {
  const cards = document.querySelectorAll('.app-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/**
 * 7. macOS Fisheye Dock Physics Animation
 * Scales elements up depending on mouse distance, and pulls adjacent elements closer dynamically.
 */
function initDockFisheye() {
  const dock = document.querySelector('.dock');
  const dockItems = document.querySelectorAll('.dock-item');

  if (!dock || dockItems.length === 0) return;

  // Disable fisheye physics on touch devices (where hover is invalid and breaks scroll)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  dock.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const dockRect = dock.getBoundingClientRect();
    
    // Only execute if mouse is vertically close to the dock
    if (e.clientY < dockRect.top - 60 || e.clientY > dockRect.bottom + 20) {
      resetDockItems();
      return;
    }

    dockItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left + (itemRect.width / 2);
      
      const distance = Math.abs(mouseX - itemCenterX);
      const range = 180; // Distance in pixels that initiates scaling
      
      const maxScale = 1.5;
      const minScale = 1.0;
      
      let scale = minScale;

      if (distance < range) {
        // Smooth sine curve scaling
        const factor = (range - distance) / range;
        scale = minScale + (maxScale - minScale) * Math.sin(factor * Math.PI / 2);
      }
      
      item.style.transform = `scale(${scale})`;
      
      // Add adjacent margins dynamically to prevent overlap and simulate elastic shelf movement
      const padding = (scale - 1) * 16;
      item.style.marginLeft = `${padding}px`;
      item.style.marginRight = `${padding}px`;
    });
  });

  dock.addEventListener('mouseleave', resetDockItems);

  function resetDockItems() {
    dockItems.forEach(item => {
      item.style.transform = '';
      item.style.marginLeft = '';
      item.style.marginRight = '';
    });
  }
}

/**
 * 8. Keyboard Shortcuts & Arrow Key Navigation
 * Focuses search bar with '/' or 'Ctrl+K' and allows arrow keys to select/launch apps.
 */
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  // Global keyboard listener
  window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isEditing = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable;

    // Focus search on '/' when not typing in form controls
    if (e.key === '/' && !isEditing) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Focus search on Ctrl+K / Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Handle arrow navigation and Enter key selection inside the search input
  searchInput.addEventListener('keydown', (e) => {
    const visibleCards = Array.from(document.querySelectorAll('.app-card')).filter(card => card.style.display !== 'none');
    if (visibleCards.length === 0) return;

    let activeIndex = visibleCards.findIndex(card => card.classList.contains('keyboard-active'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex !== -1) {
        visibleCards[activeIndex].classList.remove('keyboard-active');
      }
      activeIndex = (activeIndex + 1) % visibleCards.length;
      visibleCards[activeIndex].classList.add('keyboard-active');
      visibleCards[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex !== -1) {
        visibleCards[activeIndex].classList.remove('keyboard-active');
      }
      activeIndex = (activeIndex - 1 + visibleCards.length) % visibleCards.length;
      visibleCards[activeIndex].classList.add('keyboard-active');
      visibleCards[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (activeIndex !== -1) {
        e.preventDefault();
        // Trigger click event on the link
        visibleCards[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      searchInput.blur();
    }
  });

  // Clear keyboard highlights on search typing or blur
  searchInput.addEventListener('input', () => {
    document.querySelectorAll('.app-card').forEach(card => card.classList.remove('keyboard-active'));
  });
  
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.querySelectorAll('.app-card').forEach(card => card.classList.remove('keyboard-active'));
    }, 250);
  });
}
