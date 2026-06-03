/* ==========================================================================
   Premium Glassmorphic Dashboard Functionality (app.js)
   ========================================================================== */

// Global State
let userApps = [];
let editingAppIndex = null;
let editModeActive = false;

let workspaceConfig = {
  gridCols: 'auto',
  cardSize: 'balanced',
  cardGap: 'comfortable',
  showClock: true,
  showNotepad: true,
  showWeather: true,
  showResources: true,
  showBookmarks: true,
  weatherCity: 'London',
  weatherState: 'sunny'
};

let userBookmarks = [];

// Storage Keys
const STORAGE_KEY_APPS = 'launchpad_user_apps';
const STORAGE_KEY_CONFIG = 'launchpad_workspace_config';
const STORAGE_KEY_BOOKMARKS = 'launchpad_user_bookmarks';

// Default Applications Array
const DEFAULT_APPS = [
  {
    url: 'https://filmiq.app',
    title: 'TomJRobb',
    desc: 'Cinematic tracker and analytics dashboard',
    color: '#a855f7',
    icon: 'fa-film'
  },
  {
    url: 'https://prismpf.com',
    title: 'Prism Personal Finance',
    desc: 'Personal wealth tracker and budgeting system',
    color: '#10b981',
    icon: 'fa-chart-line'
  },
  {
    url: 'https://orbit-project-tracker.thomasrobb5.workers.dev/',
    title: 'Orbit Project Management',
    desc: 'Collaborative project tracker and workflow manager',
    color: '#06b6d4',
    icon: 'fa-atom'
  },
  {
    url: 'https://diablo4-hof.thomasrobb5.workers.dev/',
    title: 'Diablo 4 Challenge',
    desc: 'Discord community leaderboard and hall of fame',
    color: '#ef4444',
    icon: 'fa-skull'
  },
  {
    url: 'https://lightzstocksystem.pages.dev/',
    title: 'Lightz',
    desc: 'Stock inventory and system management utility',
    color: '#f59e0b',
    icon: 'fa-bolt-lightning'
  },
  {
    url: 'https://blog.tomjrobb.com/',
    title: 'Personal Blog',
    desc: 'Thoughts on engineering, design, and technology',
    color: '#3b82f6',
    icon: 'fa-pen-nib'
  }
];

const DEFAULT_BOOKMARKS = [
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Google', url: 'https://google.com' },
  { name: 'ChatGPT', url: 'https://chat.openai.com' }
];

document.addEventListener('DOMContentLoaded', () => {
  // Load State from LocalStorage
  userApps = loadAppsFromStorage();
  loadWorkspaceConfig();

  // Render Dashboard Components
  renderAppGrid(userApps);
  renderAppDock(userApps);

  // Initialize Widgets and Interactive Elements
  initGreeting();
  initClock();
  initSearchFilter();
  initKeyboardShortcuts();
  initNotepad();
  initThemePicker();
  initCardMouseGlow();
  initEditMode();
  initModalEvents();

  // Initialize Custom Workspace Elements
  applyWorkspaceConfig(workspaceConfig);
  initSettingsModal();
  initResourceMonitor();
  initBookmarks();
});

/**
 * LocalStorage Synchronizers
 */
function loadAppsFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY_APPS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(DEFAULT_APPS));
    return JSON.parse(JSON.stringify(DEFAULT_APPS));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing user apps from localStorage, fallback to defaults.', e);
    return JSON.parse(JSON.stringify(DEFAULT_APPS));
  }
}

function saveAppsToStorage(apps) {
  localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
}

function loadWorkspaceConfig() {
  const data = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(workspaceConfig));
    return workspaceConfig;
  }
  try {
    const loaded = JSON.parse(data);
    workspaceConfig = { ...workspaceConfig, ...loaded };
    return workspaceConfig;
  } catch (e) {
    console.error('Error parsing workspace config', e);
    return workspaceConfig;
  }
}

/**
 * Utility: Convert Hex Color to RGB components (R, G, B)
 * Returns comma-separated values suitable for CSS variables.
 */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    return '168, 85, 247'; // Default violet fallback
  }
  return `${r}, ${g}, ${b}`;
}

/**
 * Utility: Extract a clean domain string for card badges
 */
function getCleanUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace('www.', '');
  } catch (e) {
    try {
      const urlWithProto = new URL('https://' + urlStr);
      return urlWithProto.hostname.replace('www.', '');
    } catch (err) {
      return urlStr;
    }
  }
}

/**
 * Dynamic Renderers
 */
function renderAppGrid(apps) {
  const grid = document.getElementById('app-grid');
  if (!grid) return;

  grid.innerHTML = '';

  apps.forEach((app, index) => {
    // Create card link container
    const card = document.createElement('a');
    card.className = 'app-card';
    card.style.setProperty('--accent-color-rgb', hexToRgb(app.color));
    card.setAttribute('data-title', app.title.toLowerCase());
    card.setAttribute('aria-label', `Open ${app.title}`);

    if (editModeActive) {
      card.href = '#';
      card.addEventListener('click', (e) => {
        e.preventDefault();
      });
    } else {
      card.href = app.url;
      card.target = '_blank';
    }

    // Dynamic mouse reflection gradient container
    const cardGlow = document.createElement('div');
    cardGlow.className = 'card-glow';
    card.appendChild(cardGlow);

    // Card Header: squircle icon & actions
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';

    const iconSquircle = document.createElement('div');
    iconSquircle.className = 'app-icon-squircle';
    iconSquircle.style.background = `linear-gradient(135deg, rgba(${hexToRgb(app.color)}, 0.2), rgba(${hexToRgb(app.color)}, 0.08))`;
    iconSquircle.style.color = app.color;
    iconSquircle.innerHTML = `<i class="fa-solid ${app.icon}"></i>`;
    cardHeader.appendChild(iconSquircle);

    const actionIcon = document.createElement('div');
    actionIcon.className = 'card-action-icon';
    actionIcon.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i>`;
    cardHeader.appendChild(actionIcon);
    card.appendChild(cardHeader);

    // Card Content
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    cardContent.innerHTML = `
      <h3 class="app-title">${app.title}</h3>
      <p class="app-description">${app.desc}</p>
    `;
    card.appendChild(cardContent);

    // Card Footer: URL badge
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';
    cardFooter.innerHTML = `
      <span class="app-accent-badge" style="background: rgba(${hexToRgb(app.color)}, 0.15); color: ${app.color}; border: 1px solid rgba(${hexToRgb(app.color)}, 0.3);">
        <span class="badge-dot" style="background: ${app.color};"></span>
        ${getCleanUrl(app.url)}
      </span>
    `;
    card.appendChild(cardFooter);

    // Edit & Delete Badges (Visible only in Edit Mode)
    const deleteBadge = document.createElement('div');
    deleteBadge.className = 'delete-badge';
    deleteBadge.title = 'Delete App';
    deleteBadge.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    deleteBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm(`Are you sure you want to delete "${app.title}"?`)) {
        userApps.splice(index, 1);
        saveAppsToStorage(userApps);
        renderAppGrid(userApps);
        renderAppDock(userApps);
      }
    });
    card.appendChild(deleteBadge);

    const editBadge = document.createElement('div');
    editBadge.className = 'edit-badge';
    editBadge.title = 'Edit App';
    editBadge.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
    editBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openModalForEdit(index);
    });
    card.appendChild(editBadge);

    grid.appendChild(card);
  });

  // Append Add App Card if Edit Mode is Active
  if (editModeActive) {
    const addCard = document.createElement('div');
    addCard.className = 'app-card add-card';
    addCard.innerHTML = `
      <div class="add-card-content">
        <div class="add-card-icon">
          <i class="fa-solid fa-plus"></i>
        </div>
        <span class="add-card-title">Add App</span>
      </div>
    `;
    addCard.addEventListener('click', () => {
      openModalForCreate();
    });
    grid.appendChild(addCard);
  }

  // Re-apply workspace config to style the new elements
  applyWorkspaceConfig(workspaceConfig);

  // Re-apply current search filter parameters on re-render
  applySearchFilter();
}

function renderAppDock(apps) {
  const dockContainer = document.getElementById('dock-container');
  if (!dockContainer) return;

  dockContainer.innerHTML = '';

  apps.forEach(app => {
    const dockItem = document.createElement('div');
    dockItem.className = 'dock-item';
    dockItem.setAttribute('data-title', app.title);
    dockItem.style.setProperty('--accent-color-rgb', hexToRgb(app.color));

    dockItem.innerHTML = `
      <a href="${app.url}" target="_blank" aria-label="${app.title}">
        <div class="dock-fallback-icon" style="background: linear-gradient(135deg, rgba(${hexToRgb(app.color)}, 0.3), rgba(${hexToRgb(app.color)}, 0.15)); color: ${app.color}; display: flex; border-radius: inherit; width: 100%; height: 100%; align-items: center; justify-content: center;">
          <i class="fa-solid ${app.icon}"></i>
        </div>
      </a>
      <span class="dock-tooltip">${app.title}</span>
    `;
    dockContainer.appendChild(dockItem);
  });

  // Re-initialize fisheye physics for dock items
  initDockFisheye();
}

/**
 * 1. Dynamic Greeting
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
 * 2. Digital Clock Widget & macOS Menu Clock Synchronization
 */
function initClock() {
  const hoursEl = document.getElementById('clock-hours');
  const minutesEl = document.getElementById('clock-minutes');
  const secondsEl = document.getElementById('clock-seconds');
  const dateEl = document.getElementById('clock-date');

  const menuTimeEl = document.getElementById('menu-time');
  const menuDateEl = document.getElementById('menu-date');

  function updateClock() {
    const now = new Date();
    
    // Time formatting for widget clock
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;

    // Date formatting for widget clock
    if (dateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString(undefined, options);
    }

    // Top macOS Menu Bar Time & Date Sync
    if (menuTimeEl) {
      menuTimeEl.textContent = `${hours}:${minutes}`;
    }
    if (menuDateEl) {
      const menuDateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      menuDateEl.textContent = now.toLocaleDateString(undefined, menuDateOptions);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * 3. Search Bar Filter
 */
function initSearchFilter() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', applySearchFilter);
}

function applySearchFilter() {
  const searchInput = document.getElementById('search-input');
  const noResults = document.getElementById('no-results');
  if (!searchInput) return;

  const query = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('#app-grid .app-card:not(.add-card)');
  let visibleCount = 0;

  cards.forEach(card => {
    const titleEl = card.querySelector('.app-title');
    const descEl = card.querySelector('.app-description');
    const title = titleEl ? titleEl.textContent.toLowerCase() : '';
    const desc = descEl ? descEl.textContent.toLowerCase() : '';

    if (title.includes(query) || desc.includes(query)) {
      card.style.display = 'flex';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, 50);
      visibleCount++;
    } else {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.96)';
      card.style.display = 'none';
    }
  });

  if (noResults) {
    if (visibleCount === 0 && query !== '') {
      noResults.style.display = 'flex';
    } else {
      noResults.style.display = 'none';
    }
  }
}

/**
 * 4. LocalStorage Notepad
 */
function initNotepad() {
  const notepad = document.getElementById('notepad-textarea');
  const status = document.getElementById('notepad-status');
  const STORAGE_KEY = 'launchpad_personal_notes';

  if (!notepad || !status) return;

  const savedNotes = localStorage.getItem(STORAGE_KEY);
  if (savedNotes !== null) {
    notepad.value = savedNotes;
  }

  let saveDebounceTimeout;

  notepad.addEventListener('input', () => {
    status.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    status.style.opacity = '1';

    clearTimeout(saveDebounceTimeout);

    saveDebounceTimeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, notepad.value);
      status.innerHTML = '<i class="fa-solid fa-circle-check"></i> Saved';
      
      setTimeout(() => {
        status.style.opacity = '0.7';
      }, 1500);
    }, 500);
  });
}

/**
 * 5. Theme Picker Widget
 */
function initThemePicker() {
  const themeBtns = document.querySelectorAll('.theme-btn');
  const body = document.body;
  const STORAGE_KEY = 'launchpad_active_theme';

  if (themeBtns.length === 0) return;

  const savedTheme = localStorage.getItem(STORAGE_KEY) || 'theme-midnight-nebula';
  
  // Apply saved theme but retain the 'edit-active' state if toggled
  const isEditActive = body.classList.contains('edit-active');
  body.className = savedTheme;
  if (isEditActive) body.classList.add('edit-active');

  themeBtns.forEach(btn => {
    const themeName = btn.getAttribute('data-theme');
    if (themeName === savedTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const wasEditActive = body.classList.contains('edit-active');
      body.className = themeName;
      if (wasEditActive) body.classList.add('edit-active');
      
      localStorage.setItem(STORAGE_KEY, themeName);
    });
  });
}

/**
 * 6. Mouse Glow Hover Effect (Delegated Listener)
 */
function initCardMouseGlow() {
  const grid = document.getElementById('app-grid');
  if (!grid) return;

  grid.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.app-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
}

/**
 * 7. macOS Fisheye Dock Physics Animation
 */
function initDockFisheye() {
  const dock = document.querySelector('.dock');
  if (!dock) return;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return;

  // Prevent multiple registrations of listeners
  if (dock.dataset.fisheyeInitialized) return;
  dock.dataset.fisheyeInitialized = 'true';

  dock.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const dockRect = dock.getBoundingClientRect();
    
    if (e.clientY < dockRect.top - 60 || e.clientY > dockRect.bottom + 20) {
      resetDockItems();
      return;
    }

    const dockItems = dock.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left + (itemRect.width / 2);
      
      const distance = Math.abs(mouseX - itemCenterX);
      const range = 180;
      
      const maxScale = 1.5;
      const minScale = 1.0;
      
      let scale = minScale;

      if (distance < range) {
        const factor = (range - distance) / range;
        scale = minScale + (maxScale - minScale) * Math.sin(factor * Math.PI / 2);
      }
      
      item.style.transform = `scale(${scale})`;
      
      const padding = (scale - 1) * 16;
      item.style.marginLeft = `${padding}px`;
      item.style.marginRight = `${padding}px`;
    });
  });

  dock.addEventListener('mouseleave', resetDockItems);

  function resetDockItems() {
    const dockItems = dock.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
      item.style.transform = '';
      item.style.marginLeft = '';
      item.style.marginRight = '';
    });
  }
}

/**
 * 8. Keyboard Shortcuts & Arrow Key Navigation
 */
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const isEditing = active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable;

    if (e.key === '/' && !isEditing) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const visibleCards = Array.from(document.querySelectorAll('#app-grid .app-card')).filter(card => card.style.display !== 'none');
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
        visibleCards[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      searchInput.blur();
    }
  });

  searchInput.addEventListener('input', () => {
    document.querySelectorAll('#app-grid .app-card').forEach(card => card.classList.remove('keyboard-active'));
  });
  
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.querySelectorAll('#app-grid .app-card').forEach(card => card.classList.remove('keyboard-active'));
    }, 250);
  });
}

/**
 * 9. Edit Mode Toggle Logic
 */
function initEditMode() {
  const editBtn = document.getElementById('edit-mode-btn');
  if (!editBtn) return;

  editBtn.addEventListener('click', () => {
    editModeActive = !editModeActive;
    
    document.body.classList.toggle('edit-active', editModeActive);
    
    if (editModeActive) {
      editBtn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
      editBtn.classList.add('active');
    } else {
      editBtn.innerHTML = '<i class="fa-solid fa-sliders"></i> Edit Workspace';
      editBtn.classList.remove('active');
    }

    renderAppGrid(userApps);
  });
}

/**
 * 10. CRUD Modal Logic & Event Handlers
 */
function initModalEvents() {
  const cancelBtn = document.getElementById('modal-cancel-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  const modal = document.getElementById('editor-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  const form = document.getElementById('editor-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('modal-app-title').value.trim();
      const desc = document.getElementById('modal-app-desc').value.trim();
      const url = document.getElementById('modal-app-url').value.trim();
      const color = document.getElementById('modal-app-color').value;
      const icon = document.getElementById('modal-app-icon').value;

      if (!title || !desc || !url) {
        return;
      }

      const appData = { title, desc, url, color, icon };

      if (editingAppIndex === null) {
        userApps.push(appData);
      } else {
        userApps[editingAppIndex] = appData;
      }

      saveAppsToStorage(userApps);
      renderAppGrid(userApps);
      renderAppDock(userApps);
      closeModal();
    });
  }
}

function openModalForCreate() {
  editingAppIndex = null;
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = 'Add Application';

  const form = document.getElementById('editor-form');
  if (form) {
    form.reset();
    document.getElementById('modal-app-title').value = '';
    document.getElementById('modal-app-desc').value = '';
    document.getElementById('modal-app-url').value = '';
    document.getElementById('modal-app-color').value = '#a855f7';
    document.getElementById('modal-app-icon').value = 'fa-film';
  }

  const modal = document.getElementById('editor-modal');
  if (modal) modal.style.display = 'flex';
}

function openModalForEdit(index) {
  editingAppIndex = index;
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = 'Edit Application';

  const app = userApps[index];
  if (app) {
    document.getElementById('modal-app-title').value = app.title;
    document.getElementById('modal-app-desc').value = app.desc;
    document.getElementById('modal-app-url').value = app.url;
    document.getElementById('modal-app-color').value = app.color;
    document.getElementById('modal-app-icon').value = app.icon;
  }

  const modal = document.getElementById('editor-modal');
  if (modal) modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('editor-modal');
  if (modal) modal.style.display = 'none';
}


/* ==========================================================================
   WORKSPACE CONFIGURATION ENGINE
   ========================================================================== */

/**
 * Applies workspace layout styles, widget visibility, and weather configurations.
 */
function applyWorkspaceConfig(config) {
  const grid = document.getElementById('app-grid');
  if (grid) {
    // 1. Column classes
    grid.classList.remove('grid-cols-2', 'grid-cols-3', 'grid-cols-4');
    if (config.gridCols && config.gridCols !== 'auto') {
      grid.classList.add(`grid-cols-${config.gridCols}`);
    }
    
    // 2. Gap classes
    grid.classList.remove('gap-tight', 'gap-comfortable', 'gap-spacious');
    if (config.cardGap) {
      grid.classList.add(`gap-${config.cardGap}`);
    }

    // 3. Card size classes
    const cards = grid.querySelectorAll('.app-card');
    cards.forEach(card => {
      card.classList.remove('card-compact', 'card-expanded');
      if (config.cardSize === 'compact') {
        card.classList.add('card-compact');
      } else if (config.cardSize === 'expanded') {
        card.classList.add('card-expanded');
      }
    });
  }

  // 4. Mount/unmount widgets (display: block/none)
  const clockWidget = document.getElementById('clock-widget') || document.querySelector('.clock-card');
  if (clockWidget) {
    clockWidget.style.display = config.showClock ? '' : 'none';
  }

  const notepadWidget = document.getElementById('notepad-widget') || document.querySelector('.notepad-card');
  if (notepadWidget) {
    notepadWidget.style.display = config.showNotepad ? '' : 'none';
  }

  const weatherWidget = document.getElementById('weather-widget') || document.querySelector('.weather-card') || document.querySelector('.weather-widget');
  if (weatherWidget) {
    weatherWidget.style.display = config.showWeather ? '' : 'none';
    
    // Morphs background using weather state class
    weatherWidget.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-snowy');
    if (config.weatherState) {
      weatherWidget.classList.add(`weather-${config.weatherState}`);
    }

    const cityEl = weatherWidget.querySelector('#weather-city') || weatherWidget.querySelector('.weather-city') || weatherWidget.querySelector('.city-label');
    if (cityEl) {
      cityEl.textContent = config.weatherCity || 'London';
    }

    const tempEl = weatherWidget.querySelector('#weather-temp') || weatherWidget.querySelector('.weather-temp') || weatherWidget.querySelector('.temp-value');
    if (tempEl) {
      let temp = '20°C';
      if (config.weatherState === 'sunny') temp = '24°C';
      else if (config.weatherState === 'cloudy') temp = '16°C';
      else if (config.weatherState === 'rainy') temp = '12°C';
      else if (config.weatherState === 'snowy') temp = '1°C';
      tempEl.textContent = temp;
    }

    const iconEl = weatherWidget.querySelector('#weather-icon') || weatherWidget.querySelector('.weather-icon') || weatherWidget.querySelector('.weather-state-icon');
    if (iconEl) {
      iconEl.className = 'fa-solid';
      if (config.weatherState === 'sunny') iconEl.classList.add('fa-sun');
      else if (config.weatherState === 'cloudy') iconEl.classList.add('fa-cloud');
      else if (config.weatherState === 'rainy') iconEl.classList.add('fa-cloud-showers-heavy');
      else if (config.weatherState === 'snowy') iconEl.classList.add('fa-snowflake');
    }
  }

  const resourcesWidget = document.getElementById('resources-widget') || document.querySelector('.resources-card') || document.querySelector('.activity-monitor-card') || document.querySelector('.resources-widget');
  if (resourcesWidget) {
    resourcesWidget.style.display = config.showResources ? '' : 'none';
  }

  const bookmarksWidget = document.getElementById('bookmarks-widget') || document.querySelector('.bookmarks-card') || document.querySelector('.bookmarks-widget');
  if (bookmarksWidget) {
    bookmarksWidget.style.display = config.showBookmarks ? '' : 'none';
  }
}

/**
 * Binds workspace settings modal dialog actions
 */
function initSettingsModal() {
  const settingsBtn = document.getElementById('workspace-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  const closeBtn = document.getElementById('settings-close-btn') || document.querySelector('.settings-close-btn') || document.querySelector('.close-settings');
  const cancelBtn = document.getElementById('settings-cancel-btn') || document.querySelector('.settings-cancel-btn');

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      populateSettingsForm();
      settingsModal.style.display = 'flex';
    });
  }

  const closeModalFn = () => {
    if (settingsModal) settingsModal.style.display = 'none';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModalFn);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModalFn);

  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeModalFn();
      }
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const getVal = (id, isCheckbox = false) => {
        const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`) || document.querySelector(`[name="${id.replace('settings-', '')}"]`);
        if (el) {
          return isCheckbox ? el.checked : el.value;
        }
        // Fallback to current config value
        const camelKey = id.replace('settings-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return workspaceConfig[camelKey];
      };

      workspaceConfig.gridCols = getVal('settings-grid-cols');
      workspaceConfig.cardSize = getVal('settings-card-size');
      workspaceConfig.cardGap = getVal('settings-card-gap');
      workspaceConfig.showClock = getVal('settings-show-clock', true);
      workspaceConfig.showNotepad = getVal('settings-show-notepad', true);
      workspaceConfig.showWeather = getVal('settings-show-weather', true);
      workspaceConfig.showResources = getVal('settings-show-resources', true);
      workspaceConfig.showBookmarks = getVal('settings-show-bookmarks', true);
      workspaceConfig.weatherCity = getVal('settings-weather-city');
      workspaceConfig.weatherState = getVal('settings-weather-state');

      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(workspaceConfig));
      applyWorkspaceConfig(workspaceConfig);
      closeModalFn();
    });
  }
}

function populateSettingsForm() {
  const config = workspaceConfig;
  
  const setVal = (id, val, isCheckbox = false) => {
    const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`) || document.querySelector(`[name="${id.replace('settings-', '')}"]`);
    if (el) {
      if (isCheckbox) {
        el.checked = !!val;
      } else {
        el.value = val;
      }
    }
  };

  setVal('settings-grid-cols', config.gridCols);
  setVal('settings-card-size', config.cardSize);
  setVal('settings-card-gap', config.cardGap);
  setVal('settings-show-clock', config.showClock, true);
  setVal('settings-show-notepad', config.showNotepad, true);
  setVal('settings-show-weather', config.showWeather, true);
  setVal('settings-show-resources', config.showResources, true);
  setVal('settings-show-bookmarks', config.showBookmarks, true);
  setVal('settings-weather-city', config.weatherCity);
  setVal('settings-weather-state', config.weatherState);
}


/* ==========================================================================
   RESOURCE MONITOR WIDGET
   ========================================================================== */

/**
 * Updates an SVG circular gauge based on percentage and circle circumference.
 */
function updateCircularGauge(circleEl, percentage) {
  if (!circleEl) return;
  let circumference = parseFloat(circleEl.getAttribute('stroke-dasharray'));
  if (isNaN(circumference) || circumference <= 0) {
    try {
      circumference = circleEl.getTotalLength();
    } catch (e) {
      const r = parseFloat(circleEl.getAttribute('r')) || 40;
      circumference = 2 * Math.PI * r;
    }
  }
  
  circleEl.style.strokeDasharray = circumference;
  const offset = circumference - (percentage / 100) * circumference;
  circleEl.style.strokeDashoffset = offset;
}

/**
 * Starts simulated CPU, RAM, and Network fluctuations loop.
 */
function initResourceMonitor() {
  const cpuCircle = document.getElementById('cpu-circle') || document.querySelector('.cpu-circle');
  const ramCircle = document.getElementById('ram-circle') || document.querySelector('.ram-circle');
  const netCircle = document.getElementById('network-circle') || document.getElementById('net-circle') || document.querySelector('.network-circle') || document.querySelector('.net-circle');

  const cpuLabel = document.getElementById('cpu-value') || document.querySelector('.cpu-value');
  const ramLabel = document.getElementById('ram-value') || document.querySelector('.ram-value');
  const netLabel = document.getElementById('network-value') || document.getElementById('net-value') || document.querySelector('.network-value') || document.querySelector('.net-value');

  function updateResources() {
    // CPU: fluctuate between 12% and 48%
    const cpuPercent = Math.floor(12 + Math.random() * 37);
    // RAM: steady around 56% (fluctuates slightly between 55% and 57%)
    const ramPercent = Math.floor(55 + Math.random() * 3);
    // Network: fluctuate between 25 Mbps and 92 Mbps
    const netSpeed = Math.floor(25 + Math.random() * 68);
    // Convert to visual percentage (let's assume 100 Mbps = 100%)
    const netPercent = Math.round((netSpeed / 100) * 100);

    if (cpuCircle) updateCircularGauge(cpuCircle, cpuPercent);
    if (ramCircle) updateCircularGauge(ramCircle, ramPercent);
    if (netCircle) updateCircularGauge(netCircle, netPercent);

    if (cpuLabel) cpuLabel.textContent = `${cpuPercent}%`;
    if (ramLabel) ramLabel.textContent = `${ramPercent}%`;
    if (netLabel) netLabel.textContent = `${netSpeed} Mbps`;
  }

  updateResources();
  setInterval(updateResources, 2500);
}


/* ==========================================================================
   BOOKMARKS WIDGET CRUD
   ========================================================================== */

function loadBookmarks() {
  const data = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(DEFAULT_BOOKMARKS));
    return [...DEFAULT_BOOKMARKS];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing bookmarks', e);
    return [...DEFAULT_BOOKMARKS];
  }
}

function saveBookmarks() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(userBookmarks));
}

function renderBookmarks() {
  const listEl = document.getElementById('bookmarks-list') || document.getElementById('bookmark-list') || document.querySelector('.bookmarks-list') || document.querySelector('.bookmark-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  
  userBookmarks.forEach((bookmark, index) => {
    const li = document.createElement('li');
    li.className = 'bookmark-item';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.padding = '8px 12px';
    li.style.marginBottom = '8px';
    li.style.background = 'rgba(255, 255, 255, 0.03)';
    li.style.borderRadius = '10px';
    li.style.border = '1px solid rgba(255, 255, 255, 0.05)';

    // Bookmark Link
    const link = document.createElement('a');
    link.href = bookmark.url;
    link.target = '_blank';
    link.className = 'bookmark-link';
    link.style.display = 'flex';
    link.style.alignItems = 'center';
    link.style.gap = '8px';
    
    // Favicon fetch with Google Favicon service
    const favicon = document.createElement('img');
    favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${getCleanUrl(bookmark.url)}`;
    favicon.alt = '';
    favicon.style.width = '16px';
    favicon.style.height = '16px';
    favicon.style.borderRadius = '3px';
    favicon.onerror = () => {
      favicon.style.display = 'none';
      iconFallback.style.display = 'inline-block';
    };
    
    const iconFallback = document.createElement('i');
    iconFallback.className = 'fa-solid fa-bookmark';
    iconFallback.style.fontSize = '12px';
    iconFallback.style.color = 'var(--text-secondary)';
    iconFallback.style.display = 'none';

    const nameText = document.createElement('span');
    nameText.textContent = bookmark.name;
    nameText.className = 'bookmark-name';
    nameText.style.fontWeight = '500';
    nameText.style.fontSize = '0.9rem';

    link.appendChild(favicon);
    link.appendChild(iconFallback);
    link.appendChild(nameText);

    // Delete Glyph Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'bookmark-delete-btn';
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = '#ff453a';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.padding = '4px';
    deleteBtn.style.opacity = '0.7';
    deleteBtn.style.transition = 'opacity 0.2s, transform 0.2s';
    deleteBtn.title = 'Remove Bookmark';

    deleteBtn.addEventListener('mouseenter', () => {
      deleteBtn.style.opacity = '1';
      deleteBtn.style.transform = 'scale(1.1)';
    });
    deleteBtn.addEventListener('mouseleave', () => {
      deleteBtn.style.opacity = '0.7';
      deleteBtn.style.transform = 'none';
    });

    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      userBookmarks.splice(index, 1);
      saveBookmarks();
      renderBookmarks();
    });

    li.appendChild(link);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });
}

function initBookmarks() {
  userBookmarks = loadBookmarks();
  renderBookmarks();

  const bookmarkForm = document.getElementById('bookmark-form') || document.getElementById('bookmarks-form');
  const addBtn = document.getElementById('add-bookmark-btn') || document.querySelector('.bookmark-add-btn') || document.querySelector('.add-bookmark-btn');
  const nameInput = document.getElementById('bookmark-name') || document.querySelector('.bookmark-name-input');
  const urlInput = document.getElementById('bookmark-url') || document.querySelector('.bookmark-url-input');

  const addAction = (e) => {
    if (e) e.preventDefault();
    if (!nameInput || !urlInput) return;

    const name = nameInput.value.trim();
    let url = urlInput.value.trim();

    if (!name || !url) return;

    // Normalize URL
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    userBookmarks.push({ name, url });
    saveBookmarks();
    renderBookmarks();

    nameInput.value = '';
    urlInput.value = '';
  };

  if (bookmarkForm) {
    bookmarkForm.addEventListener('submit', addAction);
  } else if (addBtn) {
    addBtn.addEventListener('click', addAction);
  }
}
