/* ==========================================================================
   Ecosystem Integrations Setup Script (setup.js)
   ========================================================================== */

// Storage Keys matching app.js
const STORAGE_KEY_INTEGRATIONS = 'launchpad_integration_configs';
const STORAGE_KEY_CONFIG = 'launchpad_workspace_config';

// Local State
let configs = {
  plexUrl: '', plexToken: '',
  tautulliUrl: '', tautulliKey: '',
  sonarrUrl: '', sonarrKey: '',
  radarrUrl: '', radarrKey: '',
  overseerrUrl: '', overseerrKey: '',
  qbittorrentUrl: '', qbittorrentUser: '', qbittorrentPass: ''
};

// Initialize configuration
document.addEventListener('DOMContentLoaded', () => {
  loadThemeConfig();
  initClock();
  loadIntegrationConfigs();
  bindEvents();
});

// Load theme preference from main workspace config
function loadThemeConfig() {
  const configData = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (configData) {
    try {
      const workspaceConfig = JSON.parse(configData);
      
      // Apply active theme
      if (workspaceConfig.theme) {
        document.body.className = ''; // reset classes
        document.body.classList.add(workspaceConfig.theme);
      }
      
      // Toggle glow blobs visibility
      const bgBlobs = document.getElementById('bg-blobs');
      if (bgBlobs) {
        if (workspaceConfig.showBlobs === false) {
          bgBlobs.style.display = 'none';
        } else {
          bgBlobs.style.display = 'block';
        }
      }
      
      // Apply background pattern
      const patternOverlay = document.getElementById('bg-pattern-overlay');
      if (patternOverlay && workspaceConfig.bgPattern && workspaceConfig.bgPattern !== 'none') {
        patternOverlay.className = 'bg-pattern-overlay pattern-' + workspaceConfig.bgPattern;
      }
    } catch (e) {
      console.error('Error applying theme config to setup page:', e);
    }
  }
}

// Live menu clock updater
function initClock() {
  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const menuTimeEl = document.getElementById('menu-time');
    const menuDateEl = document.getElementById('menu-date');

    if (menuTimeEl) menuTimeEl.textContent = `${hours}:${minutes}`;
    if (menuDateEl) {
      const menuDateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      menuDateEl.textContent = now.toLocaleDateString(undefined, menuDateOptions);
    }
  };
  
  updateTime();
  setInterval(updateTime, 1000);
}

// Clean and normalize URLs (strips trailing slashes)
function cleanUrl(url) {
  return url ? url.trim().replace(/\/+$/, '') : '';
}

// Load configurations from storage and pre-fill form fields
function loadIntegrationConfigs() {
  const storedData = localStorage.getItem(STORAGE_KEY_INTEGRATIONS);
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      configs = { ...configs, ...parsed };
    } catch (e) {
      console.error('Failed to parse integration configurations from storage:', e);
    }
  }

  // Populate form inputs
  document.getElementById('plex-url').value = configs.plexUrl || '';
  document.getElementById('plex-token').value = configs.plexToken || '';
  document.getElementById('tautulli-url').value = configs.tautulliUrl || '';
  document.getElementById('tautulli-key').value = configs.tautulliKey || '';
  document.getElementById('sonarr-url').value = configs.sonarrUrl || '';
  document.getElementById('sonarr-key').value = configs.sonarrKey || '';
  document.getElementById('radarr-url').value = configs.radarrUrl || '';
  document.getElementById('radarr-key').value = configs.radarrKey || '';
  document.getElementById('overseerr-url').value = configs.overseerrUrl || '';
  document.getElementById('overseerr-key').value = configs.overseerrKey || '';
  document.getElementById('qbittorrent-url').value = configs.qbittorrentUrl || '';
  document.getElementById('qbittorrent-user').value = configs.qbittorrentUser || '';
  document.getElementById('qbittorrent-pass').value = configs.qbittorrentPass || '';
}

// Save inputs to configs object
function readFormValues() {
  configs.plexUrl = document.getElementById('plex-url').value.trim();
  configs.plexToken = document.getElementById('plex-token').value.trim();
  configs.tautulliUrl = document.getElementById('tautulli-url').value.trim();
  configs.tautulliKey = document.getElementById('tautulli-key').value.trim();
  configs.sonarrUrl = document.getElementById('sonarr-url').value.trim();
  configs.sonarrKey = document.getElementById('sonarr-key').value.trim();
  configs.radarrUrl = document.getElementById('radarr-url').value.trim();
  configs.radarrKey = document.getElementById('radarr-key').value.trim();
  configs.overseerrUrl = document.getElementById('overseerr-url').value.trim();
  configs.overseerrKey = document.getElementById('overseerr-key').value.trim();
  configs.qbittorrentUrl = document.getElementById('qbittorrent-url').value.trim();
  configs.qbittorrentUser = document.getElementById('qbittorrent-user').value.trim();
  configs.qbittorrentPass = document.getElementById('qbittorrent-pass').value.trim();
}

// Update UI status tags for a given service
function setStatus(service, state, message = '') {
  const statusCardEl = document.getElementById(`status-${service}`);
  const statusChecklistEl = document.getElementById(`checklist-${service}`);
  
  let iconClass = '';
  let color = '';
  let label = '';
  let customClass = '';

  switch (state) {
    case 'testing':
      iconClass = 'fa-solid fa-sync fa-spin';
      color = '#fbbf24';
      label = 'Testing...';
      customClass = 'testing';
      break;
    case 'connected':
      iconClass = 'fa-solid fa-circle-check';
      color = '#34d399';
      label = message || 'Connected';
      customClass = 'connected';
      break;
    case 'failed':
      iconClass = 'fa-solid fa-triangle-exclamation';
      color = '#f87171';
      label = message || 'Connection Failed';
      customClass = 'failed';
      break;
    default:
      iconClass = 'fa-solid fa-circle-question';
      color = 'var(--text-secondary)';
      label = 'Idle';
      customClass = '';
  }

  // Update main integration card status tag
  if (statusCardEl) {
    statusCardEl.innerHTML = `<i class="${iconClass}"></i> ${label}`;
    statusCardEl.className = 'setup-card-status ' + customClass;
  }

  // Update sidebar checklist status icon
  if (statusChecklistEl) {
    statusChecklistEl.innerHTML = `<i class="${iconClass}"></i> ${label}`;
    statusChecklistEl.style.color = color;
  }
}

// Single Connection Tester
async function testConnection(service) {
  readFormValues();
  const url = cleanUrl(document.getElementById(`${service}-url`).value);
  
  if (!url) {
    setStatus(service, 'failed', 'Empty URL');
    return false;
  }

  setStatus(service, 'testing');

  // Retrieve service key/token values
  let key = '';
  if (service === 'plex') key = document.getElementById('plex-token').value.trim();
  else if (service === 'tautulli') key = document.getElementById('tautulli-key').value.trim();
  else if (service === 'sonarr') key = document.getElementById('sonarr-key').value.trim();
  else if (service === 'radarr') key = document.getElementById('radarr-key').value.trim();
  else if (service === 'overseerr') key = document.getElementById('overseerr-key').value.trim();

  try {
    let success = false;
    let errorDetail = '';

    if (service === 'plex') {
      const res = await fetch(`${url}/status/sessions?X-Plex-Token=${key}`, { 
        headers: { 'Accept': 'application/json' } 
      });
      success = res.ok;
      if (!res.ok) errorDetail = `HTTP ${res.status}`;
    } else if (service === 'tautulli') {
      const res = await fetch(`${url}/api/v2?apikey=${key}&cmd=get_activity`);
      success = res.ok;
      if (!res.ok) errorDetail = `HTTP ${res.status}`;
    } else if (service === 'sonarr') {
      const res = await fetch(`${url}/api/v3/system/status?apikey=${key}`);
      success = res.ok;
      if (!res.ok) errorDetail = `HTTP ${res.status}`;
    } else if (service === 'radarr') {
      const res = await fetch(`${url}/api/v3/system/status?apikey=${key}`);
      success = res.ok;
      if (!res.ok) errorDetail = `HTTP ${res.status}`;
    } else if (service === 'overseerr') {
      const res = await fetch(`${url}/api/v1/status`, { 
        headers: { 'X-Api-Key': key } 
      });
      success = res.ok;
      if (!res.ok) errorDetail = `HTTP ${res.status}`;
    } else if (service === 'qbittorrent') {
      // Direct Web UI torrent info query
      const res = await fetch(`${url}/api/v2/torrents/info?filter=all`);
      success = res.ok;
      if (!res.ok) errorDetail = `HTTP ${res.status}`;
    }

    if (success) {
      setStatus(service, 'connected', 'Successful');
      return true;
    } else {
      setStatus(service, 'failed', `Error: ${errorDetail}`);
      return false;
    }
  } catch (err) {
    console.warn(`Connection test failed for ${service}:`, err);
    setStatus(service, 'failed', 'CORS / Offline');
    return false;
  }
}

// Bind clicks and UI changes
function bindEvents() {
  // Test connection button clicks
  document.querySelectorAll('.test-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = btn.getAttribute('data-integration');
      testConnection(service);
    });
  });

  // Global "Save & Return" button
  document.getElementById('save-btn').addEventListener('click', () => {
    readFormValues();
    // Normalize url fields in configs before saving
    configs.plexUrl = cleanUrl(configs.plexUrl);
    configs.tautulliUrl = cleanUrl(configs.tautulliUrl);
    configs.sonarrUrl = cleanUrl(configs.sonarrUrl);
    configs.radarrUrl = cleanUrl(configs.radarrUrl);
    configs.overseerrUrl = cleanUrl(configs.overseerrUrl);
    configs.qbittorrentUrl = cleanUrl(configs.qbittorrentUrl);

    localStorage.setItem(STORAGE_KEY_INTEGRATIONS, JSON.stringify(configs));
    
    // Automatically map integration credentials to dashboard cards and create them if missing
    syncDashboardCards();
    
    // Smooth redirect back to dashboard
    window.location.href = 'index.html';
  });

  // Load Demo Data
  document.getElementById('demo-btn').addEventListener('click', () => {
    // Fill values with demo templates
    document.getElementById('plex-url').value = 'http://localhost:32400';
    document.getElementById('plex-token').value = 'PLX-DEMO-TOKEN-12345';
    
    document.getElementById('tautulli-url').value = 'http://localhost:8181';
    document.getElementById('tautulli-key').value = 'tautulliapikey56789';
    
    document.getElementById('sonarr-url').value = 'http://localhost:8989';
    document.getElementById('sonarr-key').value = 'sonarrapiworkingshows';
    
    document.getElementById('radarr-url').value = 'https://films.tomslab.uk';
    document.getElementById('radarr-key').value = '4b07a8deb73d49e4a4b7cb750ec3a803';
    
    document.getElementById('overseerr-url').value = 'http://localhost:5055';
    document.getElementById('overseerr-key').value = 'overseerrrequestkey99';
    
    document.getElementById('qbittorrent-url').value = 'http://localhost:8080';
    document.getElementById('qbittorrent-user').value = 'admin';
    document.getElementById('qbittorrent-pass').value = 'adminadmin';

    // Highlight that changes occurred
    const alertBanner = document.createElement('div');
    alertBanner.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(168, 85, 247, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 12px 24px;
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 500;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    alertBanner.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Demo mock values populated! Click 'Save & Return' to commit.`;
    document.body.appendChild(alertBanner);

    // Remove notification after 4 seconds
    setTimeout(() => {
      alertBanner.style.animation = 'fadeOutDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => alertBanner.remove(), 400);
    }, 4000);

    // Reset all status checks back to idle
    const services = ['plex', 'tautulli', 'sonarr', 'radarr', 'overseerr', 'qbittorrent'];
    services.forEach(s => setStatus(s, 'idle'));
  });

  // Test All Connection buttons
  document.getElementById('test-all-btn').addEventListener('click', () => {
    const services = ['plex', 'tautulli', 'sonarr', 'radarr', 'overseerr', 'qbittorrent'];
    services.forEach(s => testConnection(s));
  });

  // Clear Configs
  document.getElementById('clear-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all API integrations settings?')) {
      localStorage.removeItem(STORAGE_KEY_INTEGRATIONS);
      
      // Wipe fields
      const inputs = document.querySelectorAll('.setup-field input');
      inputs.forEach(input => input.value = '');

      // Reset status fields
      const services = ['plex', 'tautulli', 'sonarr', 'radarr', 'overseerr', 'qbittorrent'];
      services.forEach(s => setStatus(s, 'idle'));

      // Prompt to also clear generated dashboard cards
      if (confirm('Would you also like to remove the integration cards and categories from your dashboard?')) {
        const STORAGE_KEY_GROUPS = 'launchpad_user_groups';
        let groups = [];
        const storedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);
        if (storedGroups) {
          try {
            groups = JSON.parse(storedGroups);
            
            // Remove the 'Self-Hosted Services' group
            let filteredGroups = groups.filter(g => 
              g.id !== 'group-self-hosted' && 
              g.title.toLowerCase() !== 'self-hosted services' && 
              g.title.toLowerCase() !== 'self-hosted'
            );
            
            // Clean up other categories from integration cards
            filteredGroups.forEach(g => {
              g.apps = g.apps.filter(app => !app.integration || app.integration === 'none');
            });
            
            localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(filteredGroups));
            
            // Notify success
            const notify = document.createElement('div');
            notify.style.cssText = `
              position: fixed;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(239, 68, 68, 0.9);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 12px;
              padding: 12px 24px;
              color: #ffffff;
              font-size: 0.9rem;
              font-weight: 500;
              backdrop-filter: blur(10px);
              box-shadow: 0 10px 25px rgba(0,0,0,0.3);
              z-index: 1000;
              animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            notify.innerHTML = `<i class="fa-solid fa-trash-can"></i> Dashboard cards cleared!`;
            document.body.appendChild(notify);
            setTimeout(() => {
              notify.style.animation = 'fadeOutDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
              setTimeout(() => notify.remove(), 400);
            }, 3000);

          } catch (e) {
            console.error('Error clearing dashboard integration cards:', e);
          }
        }
      }
    }
  });

  // Style helper details animation support
  const detailsElements = document.querySelectorAll('.setup-help-details');
  detailsElements.forEach(details => {
    const summary = details.querySelector('.setup-help-summary');
    const content = details.querySelector('.setup-help-content');
    
    summary.addEventListener('click', (e) => {
      // If we open, add a brief delay or animate
      const icon = summary.querySelector('i');
      if (details.open) {
        // closing
        icon.style.transform = '';
      } else {
        // opening
        icon.style.transform = 'rotate(90deg)';
      }
    });
  });
}

// Automatically map integrations credentials to dashboard app cards, creating them if missing
function syncDashboardCards() {
  const STORAGE_KEY_GROUPS = 'launchpad_user_groups';
  let groups = [];
  const storedGroups = localStorage.getItem(STORAGE_KEY_GROUPS);
  if (storedGroups) {
    try {
      groups = JSON.parse(storedGroups);
    } catch (e) {
      console.error('Failed to parse groups:', e);
    }
  }

  // If no groups exist in local storage, start with an empty list
  if (!groups || !Array.isArray(groups)) {
    groups = [];
  }

  // Schema for each self-hosted integration card
  const integrations = [
    { key: 'plex', title: 'Plex', desc: 'Media streaming library server', color: '#e5a00d', icon: 'fa-play' },
    { key: 'tautulli', title: 'Tautulli', desc: 'Plex stream stats and active watcher dashboard', color: '#d97706', icon: 'fa-chart-pie' },
    { key: 'sonarr', title: 'Sonarr', desc: 'TV shows tracker and downloads manager', color: '#00b4e5', icon: 'fa-download' },
    { key: 'radarr', title: 'Radarr', desc: 'Movies tracker and downloads manager', color: '#ffc107', icon: 'fa-film' },
    { key: 'overseerr', title: 'Overseerr', desc: 'Request media files on Plex library', color: '#e27522', icon: 'fa-user-plus' },
    { key: 'qbittorrent', title: 'qBittorrent', desc: 'Active torrent downloading client', color: '#3b82f6', icon: 'fa-arrow-down-up-lock' }
  ];

  let selfHostedGroup = null;

  integrations.forEach(item => {
    const configUrl = configs[`${item.key}Url`].trim();
    if (!configUrl) return; // Skip if URL is empty

    let foundCard = null;

    // 1. Search for card by exact integration type
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const grp = groups[gIdx];
      for (let aIdx = 0; aIdx < grp.apps.length; aIdx++) {
        const app = grp.apps[aIdx];
        if (app.integration === item.key) {
          foundCard = app;
          break;
        }
      }
      if (foundCard) break;
    }

    // 2. Search for card by matching title (case-insensitive) if not found by type
    if (!foundCard) {
      for (let gIdx = 0; gIdx < groups.length; gIdx++) {
        const grp = groups[gIdx];
        for (let aIdx = 0; aIdx < grp.apps.length; aIdx++) {
          const app = grp.apps[aIdx];
          if (app.title && app.title.toLowerCase() === item.title.toLowerCase()) {
            foundCard = app;
            break;
          }
        }
        if (foundCard) break;
      }
    }

    if (foundCard) {
      // Update the URL and ensure integration status is configured
      foundCard.url = configUrl;
      foundCard.integration = item.key;
    } else {
      // Create new dashboard app card
      const newCard = {
        url: configUrl,
        title: item.title,
        desc: item.desc,
        color: item.color,
        icon: item.icon,
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: item.key
      };

      // Find or create 'Self-Hosted Services' group
      if (!selfHostedGroup) {
        selfHostedGroup = groups.find(g => 
          g.id === 'group-self-hosted' || 
          g.title.toLowerCase() === 'self-hosted services' || 
          g.title.toLowerCase() === 'self-hosted'
        );
        
        if (!selfHostedGroup) {
          selfHostedGroup = {
            id: 'group-self-hosted',
            title: 'Self-Hosted Services',
            icon: 'fa-server',
            collapsed: false,
            apps: []
          };
          groups.push(selfHostedGroup);
        }
      }
      selfHostedGroup.apps.push(newCard);
    }
  });

  // Save changes back to local storage
  if (groups.length > 0) {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
  }
}
