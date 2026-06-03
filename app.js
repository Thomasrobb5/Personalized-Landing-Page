/* ==========================================================================
   Premium Glassmorphic Dashboard Functionality (app.js)
   ========================================================================== */

// Global State
let userApps = [];
let editingAppIndex = null;
let editModeActive = false;
let userWidgets = [];

let workspaceConfig = {
  gridCols: 'auto',
  cardSize: 'balanced',
  cardGap: 'comfortable',
  sidebarPos: 'right',
  sidebarCols: '1',
  showClock: true,
  showNotepad: true,
  showWeather: true,
  showResources: true,
  showBookmarks: true,
  weatherCity: 'London',
  weatherState: 'sunny'
};

// Storage Keys
const STORAGE_KEY_APPS = 'launchpad_user_apps';
const STORAGE_KEY_CONFIG = 'launchpad_workspace_config';
const STORAGE_KEY_WIDGETS = 'launchpad_user_widgets';

// Default Applications Array
const DEFAULT_APPS = [
  {
    url: 'https://filmiq.app',
    title: 'TomJRobb',
    desc: 'Cinematic tracker and analytics dashboard',
    color: '#a855f7',
    icon: 'fa-film',
    colspan: 1,
    rowspan: 1,
    sizeOverride: 'default'
  },
  {
    url: 'https://prismpf.com',
    title: 'Prism Personal Finance',
    desc: 'Personal wealth tracker and budgeting system',
    color: '#10b981',
    icon: 'fa-chart-line',
    colspan: 1,
    rowspan: 1,
    sizeOverride: 'default'
  },
  {
    url: 'https://orbit-project-tracker.thomasrobb5.workers.dev/',
    title: 'Orbit Project Management',
    desc: 'Collaborative project tracker and workflow manager',
    color: '#06b6d4',
    icon: 'fa-atom',
    colspan: 1,
    rowspan: 1,
    sizeOverride: 'default'
  },
  {
    url: 'https://diablo4-hof.thomasrobb5.workers.dev/',
    title: 'Diablo 4 Challenge',
    desc: 'Discord community leaderboard and hall of fame',
    color: '#ef4444',
    icon: 'fa-skull',
    colspan: 1,
    rowspan: 1,
    sizeOverride: 'default'
  },
  {
    url: 'https://lightzstocksystem.pages.dev/',
    title: 'Lightz',
    desc: 'Stock inventory and system management utility',
    color: '#f59e0b',
    icon: 'fa-bolt-lightning',
    colspan: 1,
    rowspan: 1,
    sizeOverride: 'default'
  },
  {
    url: 'https://blog.tomjrobb.com/',
    title: 'Personal Blog',
    desc: 'Thoughts on engineering, design, and technology',
    color: '#3b82f6',
    icon: 'fa-pen-nib',
    colspan: 1,
    rowspan: 1,
    sizeOverride: 'default'
  }
];

const DEFAULT_WIDGETS = [
  { id: 'widget-clock', type: 'clock', title: 'Clock', colSpan: 1, settings: {} },
  { id: 'widget-notepad', type: 'notepad', title: 'Notepad', colSpan: 1, settings: {} },
  { id: 'widget-theme', type: 'theme', title: 'Workspace Style', colSpan: 1, settings: {} },
  { id: 'widget-weather', type: 'weather', title: 'Weather', colSpan: 1, settings: { city: 'London', state: 'sunny' } },
  { id: 'widget-resources', type: 'resources', title: 'System Resources', colSpan: 1, settings: {} },
  { id: 'widget-bookmarks', type: 'bookmarks', title: 'Quick Bookmarks', colSpan: 1, settings: {} }
];

document.addEventListener('DOMContentLoaded', () => {
  // Load State from LocalStorage
  userApps = loadAppsFromStorage();
  userWidgets = loadWidgetsFromStorage();
  loadWorkspaceConfig();

  // Render Dashboard Components
  renderAppGrid(userApps);
  renderAppDock(userApps);
  renderSidebarWidgets(userWidgets);

  // Initialize Widgets and Interactive Elements
  initGreeting();
  initGlobalTimers();
  initSearchFilter();
  initKeyboardShortcuts();
  initCardMouseGlow();
  initEditMode();
  initModalEvents();
  initWidgetModalEvents();

  // Initialize Custom Workspace Elements
  applyWorkspaceConfig(workspaceConfig);
  initSettingsModal();
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

    // Apply layout spans
    if (app.colspan && app.colspan > 1) {
      card.classList.add(`colspan-${app.colspan}`);
    }
    if (app.rowspan && app.rowspan > 1) {
      card.classList.add(`rowspan-${app.rowspan}`);
    }
    if (app.sizeOverride && app.sizeOverride !== 'default') {
      card.classList.add(`card-${app.sizeOverride}`);
    }

    if (editModeActive) {
      card.href = '#';
      card.addEventListener('click', (e) => {
        e.preventDefault();
      });
      // Setup HTML5 Drag and Drop
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const toIndex = index;
        if (!isNaN(fromIndex) && fromIndex !== toIndex) {
          const movedApp = userApps.splice(fromIndex, 1)[0];
          userApps.splice(toIndex, 0, movedApp);
          saveAppsToStorage(userApps);
          renderAppGrid(userApps);
          renderAppDock(userApps);
        }
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.app-card').forEach(c => c.classList.remove('drag-over', 'dragging'));
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

    // Toggle Add Widget Button visibility
    const addWidgetBtn = document.getElementById('add-widget-btn');
    if (addWidgetBtn) {
      addWidgetBtn.style.display = editModeActive ? 'flex' : 'none';
    }

    renderAppGrid(userApps);
    renderSidebarWidgets(userWidgets);
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
      const colspan = parseInt(document.getElementById('modal-app-colspan').value, 10) || 1;
      const rowspan = parseInt(document.getElementById('modal-app-rowspan').value, 10) || 1;
      const sizeOverride = document.getElementById('modal-app-size').value;

      if (!title || !desc || !url) {
        return;
      }

      const appData = { title, desc, url, color, icon, colspan, rowspan, sizeOverride };

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
    document.getElementById('modal-app-colspan').value = '1';
    document.getElementById('modal-app-rowspan').value = '1';
    document.getElementById('modal-app-size').value = 'default';
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
    document.getElementById('modal-app-colspan').value = app.colspan || 1;
    document.getElementById('modal-app-rowspan').value = app.rowspan || 1;
    document.getElementById('modal-app-size').value = app.sizeOverride || 'default';
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
      const appTitle = card.querySelector('.app-title')?.textContent;
      const app = userApps.find(a => a.title.toLowerCase() === (appTitle ? appTitle.toLowerCase() : ''));
      
      card.classList.remove('card-compact', 'card-expanded');
      
      const sizeStyle = (app && app.sizeOverride && app.sizeOverride !== 'default') 
        ? app.sizeOverride 
        : config.cardSize;
        
      if (sizeStyle === 'compact') {
        card.classList.add('card-compact');
      } else if (sizeStyle === 'expanded') {
        card.classList.add('card-expanded');
      }
    });
  }

  // 4. Sidebar layout position and columns styling
  const layout = document.querySelector('.dashboard-layout');
  const sidebarWidgetsGrid = document.getElementById('sidebar-widgets');
  
  if (layout) {
    layout.classList.remove('sidebar-right', 'sidebar-left', 'sidebar-top', 'sidebar-hidden');
    const pos = config.sidebarPos || 'right';
    layout.classList.add(`sidebar-${pos}`);
  }
  
  if (sidebarWidgetsGrid) {
    sidebarWidgetsGrid.style.setProperty('--sidebar-cols', config.sidebarCols || '1');
    sidebarWidgetsGrid.classList.remove('cols-1', 'cols-2');
    sidebarWidgetsGrid.classList.add(`cols-${config.sidebarCols || '1'}`);
  }

  // 5. Apply visibility filters to active widgets
  userWidgets.forEach(widget => {
    const el = document.getElementById(widget.id);
    if (!el) return;
    
    let isVisible = true;
    if (widget.type === 'clock' && config.showClock === false) isVisible = false;
    else if (widget.type === 'notepad' && config.showNotepad === false) isVisible = false;
    else if (widget.type === 'weather' && config.showWeather === false) isVisible = false;
    else if (widget.type === 'resources' && config.showResources === false) isVisible = false;
    else if (widget.type === 'bookmarks' && config.showBookmarks === false) isVisible = false;
    
    el.style.display = isVisible ? '' : 'none';
  });
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
        const camelKey = id.replace('settings-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return workspaceConfig[camelKey];
      };

      workspaceConfig.gridCols = getVal('settings-grid-cols');
      workspaceConfig.cardSize = getVal('settings-card-size');
      workspaceConfig.cardGap = getVal('settings-card-gap');
      workspaceConfig.sidebarPos = getVal('settings-sidebar-pos') || 'right';
      workspaceConfig.sidebarCols = getVal('settings-sidebar-cols') || '1';
      workspaceConfig.showClock = getVal('settings-toggle-clock', true);
      workspaceConfig.showNotepad = getVal('settings-toggle-notepad', true);
      workspaceConfig.showWeather = getVal('settings-toggle-weather', true);
      workspaceConfig.showResources = getVal('settings-toggle-resources', true);
      workspaceConfig.showBookmarks = getVal('settings-toggle-bookmarks', true);
      workspaceConfig.weatherCity = getVal('settings-weather-city');
      workspaceConfig.weatherState = getVal('settings-weather-state').toLowerCase();

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
  setVal('settings-sidebar-pos', config.sidebarPos || 'right');
  setVal('settings-sidebar-cols', config.sidebarCols || '1');
  setVal('settings-toggle-clock', config.showClock, true);
  setVal('settings-toggle-notepad', config.showNotepad, true);
  setVal('settings-toggle-weather', config.showWeather, true);
  setVal('settings-toggle-resources', config.showResources, true);
  setVal('settings-toggle-bookmarks', config.showBookmarks, true);
  setVal('settings-weather-city', config.weatherCity);
  setVal('settings-weather-state', config.weatherState.charAt(0).toUpperCase() + config.weatherState.slice(1));
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
 * Dynamic Widgets Storage Synchronizers
 */
function loadWidgetsFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY_WIDGETS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(DEFAULT_WIDGETS));
    return JSON.parse(JSON.stringify(DEFAULT_WIDGETS));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading widgets from storage', e);
    return JSON.parse(JSON.stringify(DEFAULT_WIDGETS));
  }
}

function saveWidgetsToStorage(widgets) {
  localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(widgets));
}

/**
 * Dynamic Widgets Rendering Engine
 */
function renderSidebarWidgets(widgets) {
  const container = document.getElementById('sidebar-widgets');
  if (!container) return;
  
  container.innerHTML = '';
  
  widgets.forEach((widget, index) => {
    const card = document.createElement('article');
    card.className = `widget-card widget-${widget.type}-card`;
    card.id = widget.id;
    card.setAttribute('data-index', index);
    
    if (widget.colSpan && widget.colSpan > 1) {
      card.classList.add(`widget-colspan-${widget.colSpan}`);
    }
    
    if (widget.type === 'weather') {
      card.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy', 'weather-snowy');
      card.classList.add(`weather-${widget.settings.state || 'sunny'}`);
    }
    
    // Setup Edit Mode drag-and-drop reordering
    if (editModeActive) {
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', `widget-${index}`);
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const data = e.dataTransfer.getData('text/plain');
        if (data.startsWith('widget-')) {
          const fromIndex = parseInt(data.replace('widget-', ''), 10);
          const toIndex = index;
          if (!isNaN(fromIndex) && fromIndex !== toIndex) {
            const movedWidget = userWidgets.splice(fromIndex, 1)[0];
            userWidgets.splice(toIndex, 0, movedWidget);
            saveWidgetsToStorage(userWidgets);
            renderSidebarWidgets(userWidgets);
          }
        }
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        document.querySelectorAll('.widget-card').forEach(c => c.classList.remove('drag-over', 'dragging'));
      });
    }
    
    // Widget Header
    const header = document.createElement('div');
    header.className = 'widget-header';
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'widget-title';
    let iconClass = 'fa-circle-question';
    if (widget.type === 'clock') iconClass = 'fa-clock';
    else if (widget.type === 'notepad') iconClass = 'fa-note-sticky';
    else if (widget.type === 'theme') iconClass = 'fa-palette';
    else if (widget.type === 'weather') iconClass = 'fa-cloud-sun';
    else if (widget.type === 'resources') iconClass = 'fa-microchip';
    else if (widget.type === 'bookmarks') iconClass = 'fa-bookmark';
    else if (widget.type === 'todo') iconClass = 'fa-list-check';
    else if (widget.type === 'countdown') iconClass = 'fa-stopwatch';
    else if (widget.type === 'iframe') iconClass = 'fa-window-maximize';
    else if (widget.type === 'calculator') iconClass = 'fa-calculator';
    
    titleEl.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${widget.title}`;
    header.appendChild(titleEl);
    
    // Status text / custom element
    const statusEl = document.createElement('div');
    statusEl.className = 'widget-status';
    statusEl.id = `status-${widget.id}`;
    header.appendChild(statusEl);
    
    card.appendChild(header);
    
    // Widget Body Content
    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'widget-body-content';
    
    buildWidgetBody(widget, bodyContainer, statusEl);
    
    card.appendChild(bodyContainer);
    
    // Edit & Delete badges (Visible only in Edit Mode)
    const deleteBadge = document.createElement('div');
    deleteBadge.className = 'delete-badge';
    deleteBadge.title = 'Delete Widget';
    deleteBadge.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    deleteBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm(`Are you sure you want to delete widget "${widget.title}"?`)) {
        userWidgets.splice(index, 1);
        saveWidgetsToStorage(userWidgets);
        renderSidebarWidgets(userWidgets);
      }
    });
    card.appendChild(deleteBadge);
    
    const editBadge = document.createElement('div');
    editBadge.className = 'edit-badge';
    editBadge.title = 'Edit Widget';
    editBadge.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
    editBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openWidgetModalForEdit(index);
    });
    card.appendChild(editBadge);
    
    container.appendChild(card);
  });
  
  // Toggle Visibility values from config
  applyWorkspaceConfig(workspaceConfig);
  
  // Run initial updates
  runWidgetInitializers();
}

function buildWidgetBody(widget, container, statusEl) {
  if (widget.type === 'clock') buildClockWidget(widget, container);
  else if (widget.type === 'notepad') buildNotepadWidget(widget, container, statusEl);
  else if (widget.type === 'theme') buildThemeWidget(widget, container);
  else if (widget.type === 'weather') buildWeatherWidget(widget, container, statusEl);
  else if (widget.type === 'resources') buildResourcesWidget(widget, container);
  else if (widget.type === 'bookmarks') buildBookmarksWidget(widget, container);
  else if (widget.type === 'todo') buildTodoWidget(widget, container);
  else if (widget.type === 'countdown') buildCountdownWidget(widget, container);
  else if (widget.type === 'iframe') buildIframeWidget(widget, container);
  else if (widget.type === 'calculator') buildCalculatorWidget(widget, container);
}

/**
 * Specialized Widget Builders
 */
function buildClockWidget(widget, container) {
  container.innerHTML = `
    <div class="clock-time" style="justify-content: center;">
      <span class="clock-hours">00</span>:<span class="clock-minutes">00</span><span class="clock-seconds clock-seconds">00</span>
    </div>
    <div class="clock-date" style="text-align: center;">Loading date...</div>
  `;
}

function buildNotepadWidget(widget, container, statusEl) {
  statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Saved';
  statusEl.style.opacity = '0.7';
  
  const savedText = localStorage.getItem(`notepad_text_${widget.id}`) || '';
  const textarea = document.createElement('textarea');
  textarea.className = 'notepad-textarea';
  textarea.placeholder = 'Type notes here... Saves automatically.';
  textarea.value = savedText;
  textarea.style.width = '100%';
  textarea.style.height = '120px';
  textarea.style.background = 'rgba(0, 0, 0, 0.15)';
  textarea.style.border = '1px solid rgba(255, 255, 255, 0.04)';
  textarea.style.borderRadius = '16px';
  textarea.style.padding = '12px';
  textarea.style.color = 'var(--text-primary)';
  textarea.style.fontFamily = 'var(--font-body)';
  textarea.style.fontSize = '0.9rem';
  textarea.style.resize = 'none';
  textarea.style.outline = 'none';
  
  let saveTimeout;
  textarea.addEventListener('input', () => {
    statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    statusEl.style.opacity = '1';
    
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem(`notepad_text_${widget.id}`, textarea.value);
      statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Saved';
      setTimeout(() => { statusEl.style.opacity = '0.7'; }, 1500);
    }, 500);
  });
  
  container.appendChild(textarea);
}

function buildThemeWidget(widget, container) {
  const savedTheme = localStorage.getItem('launchpad_active_theme') || 'theme-midnight-nebula';
  container.innerHTML = `
    <div class="theme-options">
      <button class="theme-btn ${savedTheme==='theme-midnight-nebula'?'active':''}" data-theme="theme-midnight-nebula" style="background: linear-gradient(135deg, #4f46e5, #db2777);" title="Midnight Nebula"></button>
      <button class="theme-btn ${savedTheme==='theme-aurora-borealis'?'active':''}" data-theme="theme-aurora-borealis" style="background: linear-gradient(135deg, #059669, #0891b2);" title="Aurora Borealis"></button>
      <button class="theme-btn ${savedTheme==='theme-solar-eclipse'?'active':''}" data-theme="theme-solar-eclipse" style="background: linear-gradient(135deg, #d97706, #dc2626);" title="Solar Eclipse"></button>
      <button class="theme-btn ${savedTheme==='theme-cyberpunk'?'active':''}" data-theme="theme-cyberpunk" style="background: linear-gradient(135deg, #ff007f, #7000ff);" title="Cyberpunk"></button>
    </div>
  `;
  
  const btns = container.querySelectorAll('.theme-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const themeName = btn.getAttribute('data-theme');
      const body = document.body;
      const wasEditActive = body.classList.contains('edit-active');
      body.className = themeName;
      if (wasEditActive) body.classList.add('edit-active');
      localStorage.setItem('launchpad_active_theme', themeName);
    });
  });
}

function buildWeatherWidget(widget, container, statusEl) {
  const city = widget.settings.city || 'London';
  const state = widget.settings.state || 'sunny';
  statusEl.textContent = city;
  
  let temp = '20°C';
  let desc = 'Clear Sky';
  let iconClass = 'fa-sun';
  
  if (state === 'sunny') { temp = '24°C'; desc = 'Sunny'; iconClass = 'fa-sun'; }
  else if (state === 'cloudy') { temp = '16°C'; desc = 'Cloudy'; iconClass = 'fa-cloud'; }
  else if (state === 'rainy') { temp = '12°C'; desc = 'Rain Showers'; iconClass = 'fa-cloud-showers-heavy'; }
  else if (state === 'snowy') { temp = '1°C'; desc = 'Light Snow'; iconClass = 'fa-snowflake'; }
  
  container.innerHTML = `
    <div class="weather-content" style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
      <div class="weather-temp-info">
        <span style="font-size: 2rem; font-weight: 700; font-family: 'Outfit', sans-serif; line-height: 1;">${temp}</span>
        <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 4px;">${desc}</div>
      </div>
      <div class="weather-icon-container" style="font-size: 2.5rem; opacity: 0.9;">
        <i class="fa-solid ${iconClass}"></i>
      </div>
    </div>
  `;
}

function buildResourcesWidget(widget, container) {
  container.innerHTML = `
    <div class="resource-gauges-container" style="margin-top: 5px;">
      <div class="resource-gauge-wrapper resource-cpu">
        <div class="resource-svg-container">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" class="resource-circle-bg"></circle>
            <circle cx="50" cy="50" r="40" class="resource-circle-val cpu-circle-dynamic" stroke-dasharray="251.2" stroke-dashoffset="251.2"></circle>
          </svg>
          <div class="resource-text cpu-val-dynamic">0%</div>
        </div>
        <span class="resource-label">CPU</span>
      </div>
      
      <div class="resource-gauge-wrapper resource-mem">
        <div class="resource-svg-container">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" class="resource-circle-bg"></circle>
            <circle cx="50" cy="50" r="40" class="resource-circle-val ram-circle-dynamic" stroke-dasharray="251.2" stroke-dashoffset="251.2"></circle>
          </svg>
          <div class="resource-text ram-val-dynamic">0%</div>
        </div>
        <span class="resource-label">RAM</span>
      </div>
      
      <div class="resource-gauge-wrapper resource-net">
        <div class="resource-svg-container">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" class="resource-circle-bg"></circle>
            <circle cx="50" cy="50" r="40" class="resource-circle-val net-circle-dynamic" stroke-dasharray="251.2" stroke-dashoffset="251.2"></circle>
          </svg>
          <div class="resource-text net-val-dynamic">0 Mbps</div>
        </div>
        <span class="resource-label">NET</span>
      </div>
    </div>
  `;
}

function buildBookmarksWidget(widget, container) {
  const listEl = document.createElement('div');
  listEl.className = 'bookmarks-list';
  listEl.style.display = 'flex';
  listEl.style.flexDirection = 'column';
  listEl.style.gap = '8px';
  listEl.style.fontSize = '0.9rem';
  
  const widgetBookmarks = widget.settings.bookmarks || [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ];
  
  widgetBookmarks.forEach((bm, bmIndex) => {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    
    const link = document.createElement('a');
    link.href = bm.url;
    link.target = '_blank';
    link.className = 'bookmark-link';
    
    const favicon = document.createElement('img');
    favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${getCleanUrl(bm.url)}`;
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
    iconFallback.style.display = 'none';
    
    const span = document.createElement('span');
    span.textContent = bm.name;
    span.className = 'bookmark-name';
    
    link.appendChild(favicon);
    link.appendChild(iconFallback);
    link.appendChild(span);
    
    const delBtn = document.createElement('button');
    delBtn.className = 'bookmark-delete-btn';
    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      widgetBookmarks.splice(bmIndex, 1);
      widget.settings.bookmarks = widgetBookmarks;
      saveWidgetsToStorage(userWidgets);
      buildBookmarksWidget(widget, container);
    });
    
    item.appendChild(link);
    item.appendChild(delBtn);
    listEl.appendChild(item);
  });
  
  const inputGroup = document.createElement('div');
  inputGroup.className = 'bookmark-input-group';
  inputGroup.style.marginTop = '10px';
  inputGroup.style.display = 'flex';
  inputGroup.style.gap = '6px';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Name';
  nameInput.style.flex = '1';
  nameInput.style.padding = '8px';
  nameInput.style.fontSize = '0.8rem';
  nameInput.style.borderRadius = '6px';
  nameInput.style.border = '1px solid rgba(255,255,255,0.08)';
  nameInput.style.background = 'rgba(0,0,0,0.15)';
  nameInput.style.color = '#fff';
  
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = 'URL';
  urlInput.style.flex = '1.5';
  urlInput.style.padding = '8px';
  urlInput.style.fontSize = '0.8rem';
  urlInput.style.borderRadius = '6px';
  urlInput.style.border = '1px solid rgba(255,255,255,0.08)';
  urlInput.style.background = 'rgba(0,0,0,0.15)';
  urlInput.style.color = '#fff';
  
  const addBtn = document.createElement('button');
  addBtn.className = 'bookmark-add-btn';
  addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
  addBtn.style.padding = '8px 12px';
  addBtn.style.borderRadius = '6px';
  addBtn.style.border = 'none';
  addBtn.style.background = 'rgba(255,255,255,0.1)';
  addBtn.style.color = '#fff';
  addBtn.style.cursor = 'pointer';
  
  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    
    widgetBookmarks.push({ name, url });
    widget.settings.bookmarks = widgetBookmarks;
    saveWidgetsToStorage(userWidgets);
    buildBookmarksWidget(widget, container);
  });
  
  inputGroup.appendChild(nameInput);
  inputGroup.appendChild(urlInput);
  inputGroup.appendChild(addBtn);
  
  container.innerHTML = '';
  container.appendChild(listEl);
  container.appendChild(inputGroup);
}

function buildTodoWidget(widget, container) {
  const tasks = widget.settings.tasks || [];
  
  const listEl = document.createElement('ul');
  listEl.className = 'todo-list-container';
  listEl.style.padding = '0';
  listEl.style.margin = '0';
  
  tasks.forEach((task, tIndex) => {
    const item = document.createElement('li');
    item.className = `todo-item ${task.completed ? 'completed' : ''}`;
    
    const left = document.createElement('div');
    left.className = 'todo-item-left';
    left.addEventListener('click', () => {
      task.completed = !task.completed;
      widget.settings.tasks = tasks;
      saveWidgetsToStorage(userWidgets);
      buildTodoWidget(widget, container);
    });
    
    const chk = document.createElement('div');
    chk.className = 'todo-checkbox';
    chk.innerHTML = '<i class="fa-solid fa-check"></i>';
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = task.text;
    
    left.appendChild(chk);
    left.appendChild(text);
    
    const delBtn = document.createElement('button');
    delBtn.className = 'todo-delete-btn';
    delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks.splice(tIndex, 1);
      widget.settings.tasks = tasks;
      saveWidgetsToStorage(userWidgets);
      buildTodoWidget(widget, container);
    });
    
    item.appendChild(left);
    item.appendChild(delBtn);
    listEl.appendChild(item);
  });
  
  const inputGroup = document.createElement('div');
  inputGroup.className = 'todo-input-wrapper';
  inputGroup.style.marginTop = '10px';
  inputGroup.style.display = 'flex';
  inputGroup.style.gap = '6px';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Add new task...';
  input.className = 'todo-input';
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = input.value.trim();
      if (!text) return;
      tasks.push({ text, completed: false });
      widget.settings.tasks = tasks;
      saveWidgetsToStorage(userWidgets);
      buildTodoWidget(widget, container);
    }
  });
  
  const addBtn = document.createElement('button');
  addBtn.className = 'bookmark-add-btn';
  addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
  addBtn.style.padding = '8px 12px';
  addBtn.style.borderRadius = '10px';
  addBtn.style.border = 'none';
  addBtn.style.background = 'rgba(255,255,255,0.1)';
  addBtn.style.color = '#fff';
  addBtn.style.cursor = 'pointer';
  addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    tasks.push({ text, completed: false });
    widget.settings.tasks = tasks;
    saveWidgetsToStorage(userWidgets);
    buildTodoWidget(widget, container);
  });
  
  inputGroup.appendChild(input);
  inputGroup.appendChild(addBtn);
  
  container.innerHTML = '';
  container.appendChild(listEl);
  container.appendChild(inputGroup);
}

function buildCountdownWidget(widget, container) {
  const targetStr = widget.settings.targetDate;
  if (!targetStr) {
    container.innerHTML = '<div style="font-size:0.9rem;opacity:0.6;text-align:center;">No target date set. Edit widget to configure.</div>';
    return;
  }
  
  container.innerHTML = `
    <div class="countdown-widget">
      <div class="countdown-display" id="cd-display-${widget.id}">
        <div class="countdown-segment"><span class="countdown-val cd-days">00</span><span class="countdown-lbl">Days</span></div>
        <div class="countdown-segment"><span class="countdown-val cd-hours">00</span><span class="countdown-lbl">Hrs</span></div>
        <div class="countdown-segment"><span class="countdown-val cd-mins">00</span><span class="countdown-lbl">Mins</span></div>
        <div class="countdown-segment"><span class="countdown-val cd-secs">00</span><span class="countdown-lbl">Secs</span></div>
      </div>
    </div>
  `;
}

function buildIframeWidget(widget, container) {
  const url = widget.settings.url || 'about:blank';
  const height = widget.settings.height || 200;
  
  container.innerHTML = `
    <iframe src="${url}" sandbox="allow-scripts allow-same-origin allow-popups" style="width:100%; height:${height}px; border:none; border-radius:12px; background:rgba(0,0,0,0.15);"></iframe>
  `;
}

function buildCalculatorWidget(widget, container) {
  container.innerHTML = `
    <div class="calculator-widget">
      <div class="calc-display" id="calc-disp-${widget.id}">0</div>
      <div class="calc-buttons">
        <button class="calc-btn clear-btn" data-val="C">C</button>
        <button class="calc-btn op-btn" data-val="back"><i class="fa-solid fa-arrow-left-long"></i></button>
        <button class="calc-btn op-btn" data-val="/">/</button>
        <button class="calc-btn op-btn" data-val="*">*</button>
        
        <button class="calc-btn" data-val="7">7</button>
        <button class="calc-btn" data-val="8">8</button>
        <button class="calc-btn" data-val="9">9</button>
        <button class="calc-btn op-btn" data-val="-">-</button>
        
        <button class="calc-btn" data-val="4">4</button>
        <button class="calc-btn" data-val="5">5</button>
        <button class="calc-btn" data-val="6">6</button>
        <button class="calc-btn op-btn" data-val="+">+</button>
        
        <button class="calc-btn" data-val="1">1</button>
        <button class="calc-btn" data-val="2">2</button>
        <button class="calc-btn" data-val="3">3</button>
        <button class="calc-btn eq-btn" data-val="=" style="grid-row: span 2; height: 100%;">=</button>
        
        <button class="calc-btn" data-val="0" style="grid-column: span 2;">0</button>
        <button class="calc-btn" data-val=".">.</button>
      </div>
    </div>
  `;
  
  let equation = '';
  const disp = container.querySelector(`#calc-disp-${widget.id}`);
  
  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.getAttribute('data-val');
      if (val === 'C') {
        equation = '';
        disp.textContent = '0';
      } else if (val === 'back') {
        equation = equation.slice(0, -1);
        disp.textContent = equation || '0';
      } else if (val === '=') {
        try {
          if (equation) {
            const result = new Function('return ' + equation.replace(/[^0-9\+\-\*\/\.]/g, ''))();
            disp.textContent = Number.isInteger(result) ? result : parseFloat(result.toFixed(5));
            equation = disp.textContent;
          }
        } catch (err) {
          disp.textContent = 'Error';
          equation = '';
        }
      } else {
        if (['+', '-', '*', '/'].includes(val) && ['+', '-', '*', '/'].includes(equation.slice(-1))) {
          equation = equation.slice(0, -1) + val;
        } else {
          equation += val;
        }
        disp.textContent = equation;
      }
    });
  });
}

/**
 * Global Clock, Resource Monitor & Countdown Timers
 */
function updateAllClocks() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  
  document.querySelectorAll('.clock-hours').forEach(el => el.textContent = hours);
  document.querySelectorAll('.clock-minutes').forEach(el => el.textContent = minutes);
  document.querySelectorAll('.clock-seconds').forEach(el => el.textContent = seconds);
  
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateText = now.toLocaleDateString(undefined, dateOptions);
  document.querySelectorAll('.clock-date').forEach(el => el.textContent = dateText);
  
  const menuTimeEl = document.getElementById('menu-time');
  const menuDateEl = document.getElementById('menu-date');
  if (menuTimeEl) menuTimeEl.textContent = `${hours}:${minutes}`;
  if (menuDateEl) {
    const menuDateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    menuDateEl.textContent = now.toLocaleDateString(undefined, menuDateOptions);
  }
}

function updateDynamicResources() {
  const cpuPercent = Math.floor(12 + Math.random() * 37);
  const ramPercent = Math.floor(55 + Math.random() * 3);
  const netSpeed = Math.floor(25 + Math.random() * 68);
  const netPercent = Math.round((netSpeed / 100) * 100);
  
  document.querySelectorAll('.cpu-circle-dynamic').forEach(el => updateCircularGauge(el, cpuPercent));
  document.querySelectorAll('.ram-circle-dynamic').forEach(el => updateCircularGauge(el, ramPercent));
  document.querySelectorAll('.net-circle-dynamic').forEach(el => updateCircularGauge(el, netPercent));
  
  document.querySelectorAll('.cpu-val-dynamic').forEach(el => el.textContent = `${cpuPercent}%`);
  document.querySelectorAll('.ram-val-dynamic').forEach(el => el.textContent = `${ramPercent}%`);
  document.querySelectorAll('.net-val-dynamic').forEach(el => el.textContent = `${netSpeed} Mbps`);
}

function tickCountdowns() {
  userWidgets.forEach(widget => {
    if (widget.type !== 'countdown') return;
    const targetStr = widget.settings.targetDate;
    if (!targetStr) return;
    
    const target = new Date(targetStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    
    const display = document.getElementById(`cd-display-${widget.id}`);
    if (!display) return;
    
    if (diff <= 0) {
      display.innerHTML = '<div class="countdown-ended">🎉 Event Reached!</div>';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    const dVal = display.querySelector('.cd-days');
    const hVal = display.querySelector('.cd-hours');
    const mVal = display.querySelector('.cd-mins');
    const sVal = display.querySelector('.cd-secs');
    
    if (dVal) dVal.textContent = days < 10 ? '0' + days : days;
    if (hVal) hVal.textContent = hours < 10 ? '0' + hours : hours;
    if (mVal) mVal.textContent = mins < 10 ? '0' + mins : mins;
    if (sVal) sVal.textContent = secs < 10 ? '0' + secs : secs;
  });
}

function initGlobalTimers() {
  updateAllClocks();
  setInterval(updateAllClocks, 1000);
  
  updateDynamicResources();
  setInterval(updateDynamicResources, 2500);
  
  tickCountdowns();
  setInterval(tickCountdowns, 1000);
}

function runWidgetInitializers() {
  updateAllClocks();
  updateDynamicResources();
  tickCountdowns();
}

/**
 * Widget Modal Management & Catalog
 */
let editingWidgetIndex = null;

function openWidgetModalForCreate() {
  editingWidgetIndex = null;
  document.getElementById('widget-modal-title').textContent = 'Add Widget';
  document.getElementById('widget-form').reset();
  
  document.getElementById('widget-type-select-group').style.display = 'block';
  document.getElementById('widget-type').value = 'clock';
  document.getElementById('widget-title-input').value = '';
  document.getElementById('widget-col-span').value = '1';
  
  document.querySelectorAll('.widget-type-fields').forEach(f => f.style.display = 'none');
  document.getElementById('widget-modal').style.display = 'flex';
}

function openWidgetModalForEdit(index) {
  editingWidgetIndex = index;
  const widget = userWidgets[index];
  
  document.getElementById('widget-modal-title').textContent = 'Edit Widget';
  document.getElementById('widget-form').reset();
  
  document.getElementById('widget-type-select-group').style.display = 'none';
  document.getElementById('widget-type').value = widget.type;
  
  document.getElementById('widget-title-input').value = widget.title;
  document.getElementById('widget-col-span').value = widget.colSpan || 1;
  
  document.querySelectorAll('.widget-type-fields').forEach(f => f.style.display = 'none');
  const targetGroup = document.querySelector(`.field-${widget.type}`);
  if (targetGroup) targetGroup.style.display = 'block';
  
  if (widget.type === 'weather') {
    document.getElementById('widget-weather-city').value = widget.settings.city || '';
    document.getElementById('widget-weather-state').value = widget.settings.state || 'sunny';
  } else if (widget.type === 'countdown') {
    document.getElementById('widget-countdown-date').value = widget.settings.targetDate || '';
  } else if (widget.type === 'iframe') {
    document.getElementById('widget-iframe-url').value = widget.settings.url || '';
    document.getElementById('widget-iframe-height').value = widget.settings.height || 200;
  }
  
  document.getElementById('widget-modal').style.display = 'flex';
}

function closeWidgetModal() {
  document.getElementById('widget-modal').style.display = 'none';
}

function initWidgetModalEvents() {
  const closeBtn = document.getElementById('widget-modal-close-btn');
  const cancelBtn = document.getElementById('widget-cancel-btn');
  const form = document.getElementById('widget-form');
  const typeSelect = document.getElementById('widget-type');
  
  if (closeBtn) closeBtn.addEventListener('click', closeWidgetModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeWidgetModal);
  
  const modal = document.getElementById('widget-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeWidgetModal();
    });
  }
  
  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      const val = typeSelect.value;
      document.querySelectorAll('.widget-type-fields').forEach(f => f.style.display = 'none');
      const targetGroup = document.querySelector(`.field-${val}`);
      if (targetGroup) targetGroup.style.display = 'block';
    });
  }
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const type = typeSelect.value;
      const title = document.getElementById('widget-title-input').value.trim();
      const colSpan = parseInt(document.getElementById('widget-col-span').value, 10) || 1;
      
      let settings = {};
      if (type === 'weather') {
        settings.city = document.getElementById('widget-weather-city').value.trim() || 'London';
        settings.state = document.getElementById('widget-weather-state').value;
      } else if (type === 'countdown') {
        settings.targetDate = document.getElementById('widget-countdown-date').value;
      } else if (type === 'iframe') {
        settings.url = document.getElementById('widget-iframe-url').value.trim();
        settings.height = parseInt(document.getElementById('widget-iframe-height').value, 10) || 200;
      } else if (type === 'todo') {
        settings.tasks = editingWidgetIndex !== null ? (userWidgets[editingWidgetIndex].settings.tasks || []) : [];
      } else if (type === 'bookmarks') {
        settings.bookmarks = editingWidgetIndex !== null ? (userWidgets[editingWidgetIndex].settings.bookmarks || []) : [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'Google', url: 'https://google.com' }
        ];
      }
      
      if (editingWidgetIndex === null) {
        userWidgets.push({
          id: `widget-${Date.now()}`,
          type,
          title,
          colSpan,
          settings
        });
      } else {
        const w = userWidgets[editingWidgetIndex];
        w.title = title;
        w.colSpan = colSpan;
        w.settings = { ...w.settings, ...settings };
      }
      
      saveWidgetsToStorage(userWidgets);
      renderSidebarWidgets(userWidgets);
      closeWidgetModal();
    });
  }

  // Hook up the Add Widget Button display trigger in initEditMode as well
  const addWidgetBtn = document.getElementById('add-widget-btn');
  if (addWidgetBtn) {
    addWidgetBtn.addEventListener('click', openWidgetModalForCreate);
  }
}
