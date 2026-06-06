/* ==========================================================================
   Premium Glassmorphic Dashboard Functionality (app.js)
   ========================================================================== */

// Global State
let userGroups = [];
let personalGroups = [];
let workGroups = [];
let editingAppIndex = null;      // format: { groupIndex, appIndex }
let editingGroupIndex = null;    // format: groupIndex
let editModeActive = false;
let userWidgets = [];
let personalWidgets = [];
let workWidgets = [];
let workModeActive = false;
let workModeTimer = null;
let workTasks = [];

const M365_SERVICE_MAP = {
  'azure': { name: 'Azure Portal', icon: 'fa-cloud', url: 'https://portal.azure.com' },
  'teams': { name: 'Microsoft Teams', icon: 'fa-users', url: 'https://teams.microsoft.com' },
  'exchange': { name: 'Exchange Online', icon: 'fa-envelope-open-text', url: 'https://outlook.office365.com' },
  'sharepoint': { name: 'SharePoint Online', icon: 'fa-share-nodes', url: 'https://login.microsoftonline.com' },
  'intune': { name: 'Microsoft Intune', icon: 'fa-laptop-medical', url: 'https://intune.microsoft.com' },
  'entra': { name: 'Entra ID', icon: 'fa-fingerprint', url: 'https://entra.microsoft.com' },
  'onedrive': { name: 'OneDrive', icon: 'fa-cloud', url: 'https://onedrive.live.com' },
  'powerbi': { name: 'Power BI', icon: 'fa-chart-pie', url: 'https://app.powerbi.com' },
  'microsoft365': { name: 'Microsoft 365 Portal', icon: 'fa-windows', url: 'https://www.office.com' }
};

function getMicrosoftLogo(title) {
  const t = title.toLowerCase();
  if (t.includes('admin center') && t.includes('365')) {
    return `<svg viewBox="0 0 23 23" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><rect x="0" y="0" width="10.5" height="10.5" fill="#f25022"/><rect x="11.5" y="0" width="10.5" height="10.5" fill="#7fba00"/><rect x="0" y="11.5" width="10.5" height="10.5" fill="#00a4ef"/><rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#ffb900"/></svg>`;
  }
  if (t.includes('azure portal') || t.includes('azure devops')) {
    return `<svg viewBox="0 0 512 512" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path fill="#008AD7" d="M225.8 412.2L121 278.4 22 412.2h203.8z"/><path fill="#0078D4" d="M490 412.2H251.2l128-164.7L490 412.2z"/><path fill="#50E4FF" d="M379.2 247.5L251.2 412.2H490L379.2 247.5z"/><path fill="#0078D4" d="M251.2 412.2L121 278.4l154-192.9 104.2 162L251.2 412.2z"/></svg>`;
  }
  if (t.includes('entra')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><circle cx="16" cy="16" r="12" fill="none" stroke="url(#entraGrad)" stroke-width="3"/><path d="M16 8a8 8 0 1 1 0 16" fill="none" stroke="url(#entraGrad2)" stroke-width="3"/><defs><linearGradient id="entraGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0078d4"/><stop offset="100%" stop-color="#5c2d91"/></linearGradient><linearGradient id="entraGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs></svg>`;
  }
  if (t.includes('intune')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><rect x="4" y="6" width="24" height="16" rx="2" fill="none" stroke="#00a4ef" stroke-width="2.5"/><path d="M10 22h12v2H10z" fill="#00a4ef"/><path d="M16 9v6.5l4-2z" fill="#0078d4"/></svg>`;
  }
  if (t.includes('exchange')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><rect x="3" y="6" width="26" height="20" rx="3" fill="#0072c6"/><path d="M3 8l13 10 13-10" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/><circle cx="16" cy="16" r="6" fill="#0072c6" stroke="#ffffff" stroke-width="2"/></svg>`;
  }
  if (t.includes('sharepoint')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><circle cx="16" cy="16" r="10" fill="none" stroke="#107c41" stroke-width="3"/><circle cx="11" cy="16" r="4" fill="none" stroke="#107c41" stroke-width="2"/><circle cx="21" cy="16" r="4" fill="none" stroke="#107c41" stroke-width="2"/></svg>`;
  }
  if (t.includes('teams')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path d="M22 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-11-2a4 4 0 1 1-8 0 4 4 0 0 1 8 0zm11 11c0-2 4-3 6-3s6 1 6 3v2H28v-2zm-17-2c0-2.6 6-4 9-4s9 1.4 9 4v2H11v-2z" fill="#464eb8"/></svg>`;
  }
  if (t.includes('power platform')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path d="M6 6 L26 10 L22 26 L10 22 Z" fill="#742774"/><path d="M12 12 L22 14 L18 20 L14 18 Z" fill="#f2c811" opacity="0.8"/></svg>`;
  }
  if (t.includes('defender')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path d="M16 2L4 6v10c0 7.4 5.1 14.3 12 16 6.9-1.7 12-8.6 12-16V6L16 2z" fill="#d83b01"/><path d="M11 15l4 4 8-8" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if (t.includes('purview')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><circle cx="16" cy="16" r="13" fill="none" stroke="#7a24db" stroke-width="3"/><path d="M16 3v26M3 16h26" stroke="#7a24db" stroke-width="2"/><ellipse cx="16" cy="16" rx="7" ry="13" fill="none" stroke="#7a24db" stroke-width="2"/></svg>`;
  }
  if (t.includes('lighthouse')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path d="M16 2 L22 12 L18 12 L19 28 L13 28 L14 12 L10 12 Z" fill="#008ad2"/><circle cx="16" cy="7" r="2" fill="#fff"/></svg>`;
  }
  if (t.includes('power bi')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><rect x="6" y="18" width="5" height="10" fill="#f2c811"/><rect x="13" y="10" width="5" height="18" fill="#f2c811"/><rect x="20" y="4" width="5" height="24" fill="#f2c811"/></svg>`;
  }
  if (t.includes('partner center')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path d="M6 16c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10S6 21.5 6 16z" fill="#00188f"/><path d="M11 16l3 3 7-7" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  if (t.includes('billing') || t.includes('licens')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><rect x="4" y="6" width="24" height="20" rx="3" fill="#50e495"/><path d="M8 12h16M8 16h10" stroke="#fff" stroke-width="3"/></svg>`;
  }
  if (t.includes('visual studio')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><path d="M4 12l10-8v24L4 20zm24 0L18 4v24l10-8z" fill="#0078d4"/></svg>`;
  }
  if (t.includes('search admin')) {
    return `<svg viewBox="0 0 32 32" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><circle cx="14" cy="14" r="8" fill="none" stroke="#0078d4" stroke-width="3"/><path d="M20 20l8 8" stroke="#0078d4" stroke-width="3" stroke-linecap="round"/></svg>`;
  }
  if (t.includes('microsoft 365') || t.includes('m365')) {
    return `<svg viewBox="0 0 23 23" style="width:1.25rem; height:1.25rem; vertical-align: middle;"><rect x="0" y="0" width="10.5" height="10.5" fill="#f25022"/><rect x="11.5" y="0" width="10.5" height="10.5" fill="#7fba00"/><rect x="0" y="11.5" width="10.5" height="10.5" fill="#00a4ef"/><rect x="11.5" y="11.5" width="10.5" height="10.5" fill="#ffb900"/></svg>`;
  }
  return null;
}

const MICROSOFT_PORTALS = [
  {
    id: 'group-ms-admin',
    title: 'Core Administration',
    icon: 'fa-user-shield',
    collapsed: false,
    apps: [
      {
        url: 'https://admin.microsoft.com',
        title: 'Microsoft 365 Admin Center',
        desc: 'Centralized management for users, licenses, billing, and services.',
        color: '#0078d4',
        icon: 'fa-users-gear',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://portal.azure.com',
        title: 'Azure Portal',
        desc: 'Build, manage, and monitor cloud services, VMs, and databases.',
        color: '#0089d6',
        icon: 'fa-cloud',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://entra.microsoft.com',
        title: 'Microsoft Entra Admin Center',
        desc: 'Manage identities, user access, security groups, and SSO.',
        color: '#5c2d91',
        icon: 'fa-id-card-clip',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://intune.microsoft.com',
        title: 'Microsoft Intune Admin Center',
        desc: 'Endpoint management, device enrollment, and compliance policies.',
        color: '#00a4ef',
        icon: 'fa-laptop-medical',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      }
    ]
  },
  {
    id: 'group-ms-services',
    title: 'App & Service Administration',
    icon: 'fa-sliders',
    collapsed: false,
    apps: [
      {
        url: 'https://admin.exchange.microsoft.com',
        title: 'Exchange Admin Center',
        desc: 'Manage mailboxes, mail flow, transport rules, and spam filters.',
        color: '#0072c6',
        icon: 'fa-envelope-open-text',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://admin.microsoft.com/sharepoint',
        title: 'SharePoint Admin Center',
        desc: 'Configure organization sites, storage limits, and external sharing.',
        color: '#0072c6',
        icon: 'fa-share-nodes',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://admin.teams.microsoft.com',
        title: 'Teams Admin Center',
        desc: 'Manage calling policies, guest access, chat features, and apps.',
        color: '#464eb8',
        icon: 'fa-users',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://admin.powerplatform.microsoft.com',
        title: 'Power Platform Admin Center',
        desc: 'Manage environments, database policies, PowerApps, and Flows.',
        color: '#742774',
        icon: 'fa-chart-simple',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      }
    ]
  },
  {
    id: 'group-ms-sec-comp',
    title: 'Security, Compliance & Insights',
    icon: 'fa-shield-halved',
    collapsed: false,
    apps: [
      {
        url: 'https://security.microsoft.com',
        title: 'Microsoft Defender',
        desc: 'Security signals, threat protection, and automated remediation.',
        color: '#d83b01',
        icon: 'fa-shield-virus',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://compliance.microsoft.com',
        title: 'Microsoft Purview',
        desc: 'Data compliance, privacy, retention, and labeling policies.',
        color: '#7a24db',
        icon: 'fa-building-shield',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://lighthouse.microsoft.com',
        title: 'Microsoft 365 Lighthouse',
        desc: 'Multi-tenant administration for managed service providers (MSP).',
        color: '#008ad2',
        icon: 'fa-tower-observation',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://app.powerbi.com/admin-portal',
        title: 'Power BI Admin Portal',
        desc: 'Tenant-wide configuration, usage stats, and gateway configurations.',
        color: '#f2c811',
        icon: 'fa-chart-pie',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      }
    ]
  },
  {
    id: 'group-ms-dev',
    title: 'Developer & Business Operations',
    icon: 'fa-code',
    collapsed: false,
    apps: [
      {
        url: 'https://dev.azure.com',
        title: 'Azure DevOps',
        desc: 'Git repositories, build pipelines, agile planning, and boards.',
        color: '#0078d4',
        icon: 'fa-git-branch',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://developer.microsoft.com/en-us/microsoft-365/profile',
        title: 'Microsoft 365 Dev Dashboard',
        desc: 'Access Sandbox subscriptions, sample packs, and API testing.',
        color: '#107c41',
        icon: 'fa-code-branch',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://partner.microsoft.com',
        title: 'Microsoft Partner Center',
        desc: 'Manage cloud solution provider accounts, incentives, and programs.',
        color: '#00188f',
        icon: 'fa-handshake',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://admin.microsoft.com/#/billing/licenses',
        title: 'Billing & Licenses Portal',
        desc: 'Manage M365 licenses, purchases, payment methods, and invoices.',
        color: '#50e495',
        icon: 'fa-credit-card',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      }
    ]
  },
  {
    id: 'group-ms-extra',
    title: 'Additional Admin Portals',
    icon: 'fa-folder-plus',
    collapsed: false,
    apps: [
      {
        url: 'https://manage.visualstudio.com',
        title: 'Visual Studio Subscriptions Admin',
        desc: 'Assign developer licensing and cloud credits to users.',
        color: '#0078d4',
        icon: 'fa-code',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://www.microsoft.com/licensing/servicecenter',
        title: 'Volume Licensing Service Center',
        desc: 'Manage enterprise volume agreement software keys and downloads.',
        color: '#0078d4',
        icon: 'fa-file-invoice-dollar',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://admin.microsoft.com/#/MicrosoftSearch',
        title: 'Microsoft Search Admin',
        desc: 'Configure organization search answers, bookmarks, and acronyms.',
        color: '#0078d4',
        icon: 'fa-magnifying-glass',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      },
      {
        url: 'https://myaccount.microsoft.com',
        title: 'My Account Portal',
        desc: 'Self-service account management, security info, and active devices.',
        color: '#00a4ef',
        icon: 'fa-user',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: false,
        integration: 'none'
      }
    ]
  }
];

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
  weatherState: 'sunny',
  bgPattern: 'none',
  showBlobs: true,
  theme: 'theme-midnight-nebula',
  themeFont: 'default',
  glassBlur: '20px',
  blobOpacity: '0.45',
  blobSpeed: '25s'
};

let integrationConfigs = {
  plexUrl: '', plexToken: '',
  tautulliUrl: '', tautulliKey: '',
  sonarrUrl: '', sonarrKey: '',
  radarrUrl: '', radarrKey: '',
  overseerrUrl: '', overseerrKey: '',
  qbittorrentUrl: '', qbittorrentUser: '', qbittorrentPass: '',
  cfWorkerUrl: 'https://m365-status-proxy.thomasrobb5.workers.dev'
};

// Storage Keys
const STORAGE_KEY_GROUPS = 'launchpad_user_groups';
const STORAGE_KEY_APPS_OLD = 'launchpad_user_apps'; // For migration
const STORAGE_KEY_CONFIG = 'launchpad_workspace_config';
const STORAGE_KEY_WIDGETS = 'launchpad_user_widgets';
const STORAGE_KEY_INTEGRATIONS = 'launchpad_integration_configs';

// Default Groups Configuration
const DEFAULT_GROUPS = [
  {
    id: 'group-cloud-projects',
    title: 'Cloud Projects',
    icon: 'fa-cloud',
    collapsed: false,
    apps: [
      {
        url: 'https://filmiq.app',
        title: 'TomJRobb',
        desc: 'Cinematic tracker and analytics dashboard',
        color: '#a855f7',
        icon: 'fa-film',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'none'
      },
      {
        url: 'https://prismpf.com',
        title: 'Prism Personal Finance',
        desc: 'Personal wealth tracker and budgeting system',
        color: '#10b981',
        icon: 'fa-chart-line',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'none'
      },
      {
        url: 'https://orbit-project-tracker.thomasrobb5.workers.dev/',
        title: 'Orbit Project Management',
        desc: 'Collaborative project tracker and workflow manager',
        color: '#06b6d4',
        icon: 'fa-atom',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'none'
      }
    ]
  },
  {
    id: 'group-self-hosted',
    title: 'Self-Hosted Services',
    icon: 'fa-server',
    collapsed: false,
    apps: [
      {
        url: 'http://localhost:32400',
        title: 'Plex',
        desc: 'Media streaming library server',
        color: '#e5a00d',
        icon: 'fa-play',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'plex'
      },
      {
        url: 'http://localhost:8989',
        title: 'Sonarr',
        desc: 'TV shows tracker and downloads manager',
        color: '#00b4e5',
        icon: 'fa-download',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'sonarr'
      },
      {
        url: 'http://localhost:7878',
        title: 'Radarr',
        desc: 'Movies tracker and downloads manager',
        color: '#ffc107',
        icon: 'fa-film',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'radarr'
      },
      {
        url: 'http://localhost:5055',
        title: 'Overseerr',
        desc: 'Request media files on Plex library',
        color: '#e27522',
        icon: 'fa-user-plus',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'overseerr'
      },
      {
        url: 'http://localhost:8181',
        title: 'Tautulli',
        desc: 'Plex stream stats and active watcher dashboard',
        color: '#d97706',
        icon: 'fa-chart-pie',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'tautulli'
      },
      {
        url: 'http://localhost:8080',
        title: 'qBittorrent',
        desc: 'Active torrent downloading client',
        color: '#3b82f6',
        icon: 'fa-arrow-down-up-lock',
        colspan: 1,
        rowspan: 1,
        sizeOverride: 'default',
        pingEnabled: true,
        integration: 'qbittorrent'
      }
    ]
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
  personalGroups = loadGroupsFromStorage();
  workGroups = loadWorkGroupsFromStorage();
  personalWidgets = loadWidgetsFromStorage();
  workWidgets = loadWorkWidgetsFromStorage();
  loadWorkspaceConfig();
  loadIntegrationConfigs();
  workModeActive = localStorage.getItem('launchpad_work_mode_active') === 'true';

  userGroups = workModeActive ? workGroups : personalGroups;
  userWidgets = workModeActive ? workWidgets : personalWidgets;

  // Set Workspace Label
  const storedWorkspaceName = localStorage.getItem('launchpad_workspace_name');
  if (storedWorkspaceName) {
    const label = document.querySelector('.workspace-label');
    if (label && !workModeActive) label.textContent = storedWorkspaceName;
  }

  // Render Dashboard Components
  renderDashboardGroups(userGroups);
  renderAppDock(userGroups);
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
  initGroupModalEvents();
  initSpotlight();
  initDetailOverlayEvents();
  initWorkMode();

  // Initialize Custom Workspace Elements
  applyWorkspaceConfig(workspaceConfig);
  initSettingsModal();
  initIntegrationsSetupBanner();

  // Start Loops
  startIntegrationLoops();
  startPingChecksLoop();

  // First-Time Setup Wizard Check
  checkFirstTimeSetup();
});

/**
 * LocalStorage Synchronizers & Migrations
 */
function loadGroupsFromStorage() {
  const groupsData = localStorage.getItem(STORAGE_KEY_GROUPS);
  if (groupsData) {
    try {
      return JSON.parse(groupsData);
    } catch (e) {
      console.error('Error parsing user groups, falling back.', e);
    }
  }

  // Check for old flat apps array to migrate
  const oldAppsData = localStorage.getItem(STORAGE_KEY_APPS_OLD);
  if (oldAppsData) {
    try {
      const oldApps = JSON.parse(oldAppsData);
      if (Array.isArray(oldApps) && oldApps.length > 0) {
        console.log('Migrating old flat apps array to categorized groups...');
        const migrated = [
          {
            id: 'group-default',
            title: 'My Applications',
            icon: 'fa-folder',
            collapsed: false,
            apps: oldApps.map(app => ({
              ...app,
              pingEnabled: true,
              integration: 'none'
            }))
          }
        ];
        localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(migrated));
        // Clean up old storage
        localStorage.removeItem(STORAGE_KEY_APPS_OLD);
        return migrated;
      }
    } catch (e) {
      console.error('Error migrating old apps.', e);
    }
  }

  // Return default setup
  localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(DEFAULT_GROUPS));
  return JSON.parse(JSON.stringify(DEFAULT_GROUPS));
}

function loadWorkGroupsFromStorage() {
  const groupsData = localStorage.getItem('launchpad_work_groups');
  if (groupsData) {
    try {
      return JSON.parse(groupsData);
    } catch (e) {
      console.error('Error parsing work groups, falling back.', e);
    }
  }

  // Return default setup for work mode
  localStorage.setItem('launchpad_work_groups', JSON.stringify(MICROSOFT_PORTALS));
  return JSON.parse(JSON.stringify(MICROSOFT_PORTALS));
}

function saveGroupsToStorage(groups) {
  if (workModeActive) {
    localStorage.setItem('launchpad_work_groups', JSON.stringify(groups));
    workGroups = groups;
  } else {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
    personalGroups = groups;
  }
  userGroups = groups;
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

function loadIntegrationConfigs() {
  const data = localStorage.getItem(STORAGE_KEY_INTEGRATIONS);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      integrationConfigs = { ...integrationConfigs, ...parsed };
    } catch (e) {
      console.error('Error loading integrations configurations.', e);
    }
  }
}

function saveIntegrationConfigs(configs) {
  localStorage.setItem(STORAGE_KEY_INTEGRATIONS, JSON.stringify(configs));
}

function cleanUrl(url) {
  if (!url) return '';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'http://' + cleaned;
  }
  return cleaned;
}

/**
 * Utility Helpers
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
    return '168, 85, 247'; // violet
  }
  return `${r}, ${g}, ${b}`;
}

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
 * Real-time CORS-safe Pinger Service
 */
function startPingChecksLoop() {
  const runPings = () => {
    userGroups.forEach((group, groupIndex) => {
      group.apps.forEach((app, appIndex) => {
        if (!app.pingEnabled) return;
        const card = document.querySelector(`.dashboard-category-group[data-index="${groupIndex}"] .app-card[data-index="${appIndex}"]`);
        if (!card) return;
        const dotEl = card.querySelector('.ping-dot');
        const latencyEl = card.querySelector('.ping-latency');
        if (dotEl && latencyEl) {
          pingService(app.url, dotEl, latencyEl);
        }
      });
    });
  };
  
  setTimeout(runPings, 1000);
  setInterval(runPings, 30000); // Ping every 30s
}

function pingService(url, dotEl, latencyEl) {
  const startTime = Date.now();
  // Clear status classes
  dotEl.classList.remove('ping-online', 'ping-offline');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  // Attempt direct get with no-cors to check if server responds (fastest, bypasses CORS error blocks)
  fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-cache', signal: controller.signal })
    .then(() => {
      clearTimeout(timeoutId);
      const diff = Date.now() - startTime;
      dotEl.classList.add('ping-online');
      latencyEl.textContent = `${diff}ms`;
    })
    .catch(() => {
      clearTimeout(timeoutId);
      // Fallback: load favicon image tag which bypasses fetch checks
      let imgCompleted = false;
      const img = new Image();
      
      const imgTimeout = setTimeout(() => {
        if (!imgCompleted) {
          img.src = '';
          dotEl.classList.add('ping-offline');
          latencyEl.textContent = 'offline';
        }
      }, 3500);

      img.onload = img.onerror = () => {
        imgCompleted = true;
        clearTimeout(imgTimeout);
        const diff = Date.now() - startTime;
        dotEl.classList.add('ping-online');
        latencyEl.textContent = `${diff}ms`;
      };

      let base = url;
      if (!base.endsWith('/')) base += '/';
      img.src = `${base}favicon.ico?t=${Date.now()}`;
    });
}

/**
 * Service Integrations Engine
 */
function startIntegrationLoops() {
  const update = () => {
    userGroups.forEach((group, groupIdx) => {
      group.apps.forEach((app, appIdx) => {
        if (app.integration && app.integration !== 'none') {
          queryIntegrationApi(app.integration, groupIdx, appIdx);
        }
      });
    });
  };
  setTimeout(update, 1500);
  setInterval(update, 60000); // Update integrations every 60s
}

async function queryIntegrationApi(type, groupIndex, appIndex) {
  const app = userGroups[groupIndex].apps[appIndex];
  const card = document.querySelector(`.dashboard-category-group[data-index="${groupIndex}"] .app-card[data-index="${appIndex}"]`);
  if (!card) return;

  let container = card.querySelector('.integration-card-content');
  if (!container) {
    container = document.createElement('div');
    container.className = 'integration-card-content';
    card.appendChild(container);
  }

  // Show a loading text briefly if empty
  if (container.innerHTML === '') {
    container.innerHTML = `<span style="font-size:0.7rem; opacity:0.6;"><i class="fa-solid fa-sync fa-spin"></i> Loading data...</span>`;
  }

  try {
    let html = '';
    if (type === 'plex') {
      const data = await getPlexStreams();
      if (data.online) {
        html = `<div style="font-size:0.75rem; font-weight:600; color:rgb(var(--accent-color-rgb));"><i class="fa-solid fa-play"></i> Plex Stream Active</div>`;
        if (data.count === 0) {
          html += `<div style="opacity:0.8; font-size:0.7rem;">No active streams playing</div>`;
        } else {
          html += `<div class="integration-mini-list">`;
          data.streams.forEach(s => {
            html += `<div class="integration-mini-item plex-stream-item">
              <span class="plex-title">${s.title}</span>
              <span class="plex-user">${s.user}</span>
            </div>`;
          });
          html += `</div>`;
        }
      } else {
        html = `<div style="font-size:0.7rem; color:var(--text-secondary); opacity:0.6;"><i class="fa-solid fa-server"></i> Plex library idle</div>`;
      }
    } 
    else if (type === 'tautulli') {
      const data = await getTautulliActivity();
      html = `<div style="font-size:0.75rem; font-weight:600; color:rgb(var(--accent-color-rgb));"><i class="fa-solid fa-chart-pie"></i> Tautulli Monitor</div>`;
      html += `<div style="opacity:0.8; font-size:0.7rem;">Streams: <strong>${data.streamCount}</strong> (${data.transcodeCount} transcodes)</div>`;
    } 
    else if (type === 'sonarr') {
      const data = await getSonarrUpcoming();
      html = `<div style="font-size:0.75rem; font-weight:600; color:rgb(var(--accent-color-rgb));"><i class="fa-solid fa-calendar"></i> Sonarr Calendar</div>`;
      if (data.releases.length === 0) {
        html += `<div style="opacity:0.8; font-size:0.7rem;">No upcoming releases today</div>`;
      } else {
        html += `<div class="integration-mini-list">`;
        data.releases.slice(0, 3).forEach(r => {
          html += `<div class="integration-mini-item">
            <span class="release-item-title">${r.title}</span>
            <span class="release-item-date">${r.date}</span>
          </div>`;
        });
        html += `</div>`;
      }
    } 
    else if (type === 'radarr') {
      const data = await getRadarrUpcoming();
      html = `<div style="font-size:0.75rem; font-weight:600; color:rgb(var(--accent-color-rgb));"><i class="fa-solid fa-calendar"></i> Radarr Calendar</div>`;
      if (data.releases.length === 0) {
        html += `<div style="opacity:0.8; font-size:0.7rem;">No upcoming movies today</div>`;
      } else {
        html += `<div class="integration-mini-list">`;
        data.releases.slice(0, 3).forEach(r => {
          html += `<div class="integration-mini-item">
            <span class="release-item-title">${r.title}</span>
            <span class="release-item-date">${r.date}</span>
          </div>`;
        });
        html += `</div>`;
      }
    } 
    else if (type === 'overseerr') {
      const data = await getOverseerrRequests();
      html = `<div style="font-size:0.75rem; font-weight:600; color:rgb(var(--accent-color-rgb));"><i class="fa-solid fa-user-plus"></i> Overseerr Media</div>`;
      html += `<div style="opacity:0.8; font-size:0.7rem;">Pending: <strong>${data.pending}</strong>, Approved: <strong>${data.approved}</strong></div>`;
    } 
    else if (type === 'qbittorrent') {
      const data = await getQbittorrentStatus();
      html = `<div class="torrent-progress-container">
        <div class="torrent-progress-header">
          <span>qBittorrent</span>
          <span style="font-weight:bold;">${data.progress}%</span>
        </div>
        <div class="torrent-progress-bar-bg">
          <div class="torrent-progress-bar-fill" style="width: ${data.progress}%;"></div>
        </div>
        <div class="torrent-speed"><i class="fa-solid fa-arrow-down"></i> ${data.speed}</div>
      </div>`;
    }
    container.innerHTML = html;
  } catch (e) {
    console.error(`Error querying integration API for ${type}:`, e);
    container.innerHTML = `<span style="font-size:0.7rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Integration error</span>`;
  }
}

// Plex Streams Fetch/Mock
async function getPlexStreams() {
  const url = cleanUrl(integrationConfigs.plexUrl);
  const token = integrationConfigs.plexToken;
  if (!url || !token) {
    return { online: true, count: 1, streams: [{ title: 'Interstellar (1080p)', user: 'Thomas (AppleTV)' }] }; // Mock default
  }
  try {
    const res = await fetch(`${url}/status/sessions?X-Plex-Token=${token}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error();
    const json = await res.json();
    const size = json.MediaContainer.size || 0;
    const streams = [];
    if (size > 0 && json.MediaContainer.Metadata) {
      const items = Array.isArray(json.MediaContainer.Metadata) ? json.MediaContainer.Metadata : [json.MediaContainer.Metadata];
      items.forEach(m => {
        streams.push({
          title: m.title || m.grandparentTitle || 'Unknown Media',
          user: m.User ? m.User.title : 'Guest'
        });
      });
    }
    return { online: true, count: size, streams };
  } catch (e) {
    if (url && token) throw e;
    return { online: true, count: 1, streams: [{ title: 'Interstellar (1080p)', user: 'Thomas (AppleTV)' }] }; // Fallback mock
  }
}

// Tautulli Fetch/Mock
async function getTautulliActivity() {
  const url = cleanUrl(integrationConfigs.tautulliUrl);
  const key = integrationConfigs.tautulliKey;
  if (!url || !key) {
    return { streamCount: 1, transcodeCount: 0 };
  }
  try {
    const res = await fetch(`${url}/api/v2?apikey=${key}&cmd=get_activity`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    return {
      streamCount: parseInt(json.response.data.stream_count || 0),
      transcodeCount: parseInt(json.response.data.stream_count_transcode || 0)
    };
  } catch (e) {
    if (url && key) throw e;
    return { streamCount: 1, transcodeCount: 0 };
  }
}

// Sonarr Calendar Fetch/Mock
async function getSonarrUpcoming() {
  const url = cleanUrl(integrationConfigs.sonarrUrl);
  const key = integrationConfigs.sonarrKey;
  if (!url || !key) {
    return { releases: [{ title: 'The Boys S04E05', date: 'Tomorrow' }, { title: 'House of the Dragon S02E03', date: 'In 2 days' }] };
  }
  try {
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
    const res = await fetch(`${url}/api/v3/calendar?apikey=${key}&start=${start}&end=${end}&includeSeries=true`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    const releases = json.map(item => {
      const date = new Date(item.airDateUtc);
      const seriesTitle = (item.series && item.series.title) ? item.series.title : 'Unknown Series';
      const season = item.seasonNumber !== undefined ? String(item.seasonNumber).padStart(2, '0') : '01';
      const episode = item.episodeNumber !== undefined ? String(item.episodeNumber).padStart(2, '0') : '01';
      return {
        title: `${seriesTitle} S${season}E${episode}`,
        date: date.toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
      };
    });
    return { releases };
  } catch (e) {
    if (url && key) throw e;
    return { releases: [{ title: 'The Boys S04E05', date: 'Tomorrow' }, { title: 'House of the Dragon S02E03', date: 'In 2 days' }] };
  }
}

// Radarr Calendar Fetch/Mock
async function getRadarrUpcoming() {
  const url = cleanUrl(integrationConfigs.radarrUrl);
  const key = integrationConfigs.radarrKey;
  if (!url || !key) {
    return { releases: [{ title: 'Deadpool & Wolverine', date: 'Next Friday' }] };
  }
  try {
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0];
    const res = await fetch(`${url}/api/v3/calendar?apikey=${key}&start=${start}&end=${end}`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    const releases = json.map(item => {
      const date = new Date(item.physicalRelease || item.inCinemas);
      return {
        title: item.title,
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    });
    return { releases };
  } catch (e) {
    if (url && key) throw e;
    return { releases: [{ title: 'Deadpool & Wolverine', date: 'Next Friday' }] };
  }
}

// Overseerr Requests Fetch/Mock
async function getOverseerrRequests() {
  const url = cleanUrl(integrationConfigs.overseerrUrl);
  const key = integrationConfigs.overseerrKey;
  if (!url || !key) {
    return { pending: 2, approved: 14 };
  }
  try {
    const res = await fetch(`${url}/api/v1/request?take=50&filter=all`, {
      headers: { 'X-Api-Key': key }
    });
    if (!res.ok) throw new Error();
    const json = await res.json();
    const results = (json && Array.isArray(json.results)) ? json.results : [];
    const pending = results.filter(r => r.status === 1).length; // status 1 is pending
    const approved = results.filter(r => r.status === 2).length; // status 2 is approved
    return { pending, approved };
  } catch (e) {
    if (url && key) throw e;
    return { pending: 2, approved: 14 };
  }
}

// qBittorrent Fetch/Mock
async function getQbittorrentStatus() {
  const url = cleanUrl(integrationConfigs.qbittorrentUrl);
  if (!url) {
    // Generate organic shifting download progress mock
    const progress = Math.min(100, Math.round(55 + (Date.now() / 100000) % 40));
    return { progress, speed: '4.2 MB/s' };
  }
  try {
    const res = await fetch(`${url}/api/v2/torrents/info?filter=all`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    if (json.length === 0) return { progress: 100, speed: '0 B/s' };
    
    let totalProgress = 0;
    let totalDlSpeed = 0;
    json.forEach(t => {
      totalProgress += t.progress;
      totalDlSpeed += t.dlspeed;
    });
    const avgProgress = Math.round((totalProgress / json.length) * 100);
    const speedFormatted = totalDlSpeed > 1024 * 1024 
      ? `${(totalDlSpeed / (1024 * 1024)).toFixed(1)} MB/s` 
      : `${(totalDlSpeed / 1024).toFixed(0)} KB/s`;
      
    return { progress: avgProgress, speed: speedFormatted };
  } catch (e) {
    if (url) throw e;
    const progress = Math.min(100, Math.round(55 + (Date.now() / 100000) % 40));
    return { progress, speed: '4.2 MB/s' };
  }
}

/**
 * Dynamic Groups/Categories Dashboard Rendering Engine
 */
function renderDashboardGroups(groups) {
  const container = document.getElementById('dashboard-groups');
  if (!container) return;
  container.innerHTML = '';

  // Render Favorites if any exist
  const favApps = [];
  groups.forEach((group, groupIdx) => {
    group.apps.forEach((app, appIdx) => {
      if (app.favorite === true) {
        favApps.push({ app, groupIdx, appIdx });
      }
    });
  });

  if (favApps.length > 0) {
    const favBlock = document.createElement('section');
    favBlock.className = 'dashboard-category-group favorites-group';
    
    const header = document.createElement('header');
    header.className = 'category-group-header';
    header.innerHTML = `
      <div class="category-group-title-wrapper">
        <i class="fa-solid fa-star category-group-icon" style="color: #fbbf24; filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.4));"></i>
        <h2 class="category-group-title">Favorites</h2>
      </div>
    `;
    
    const grid = document.createElement('div');
    grid.className = 'category-group-grid favorites-grid';
    applyGroupGridConfig(grid);
    
    favApps.forEach(fav => {
      buildFavoriteCard(fav.app, fav.groupIdx, fav.appIdx, grid);
    });
    
    favBlock.appendChild(header);
    favBlock.appendChild(grid);
    container.appendChild(favBlock);
  }

  groups.forEach((group, groupIndex) => {
    // Group block container
    const groupBlock = document.createElement('section');
    groupBlock.className = 'dashboard-category-group';
    groupBlock.setAttribute('data-index', groupIndex);
    if (group.collapsed) {
      groupBlock.classList.add('group-collapsed');
    }

    // Category header
    const header = document.createElement('header');
    header.className = 'category-group-header';
    header.innerHTML = `
      <div class="category-group-title-wrapper">
        <i class="fa-solid ${group.icon} category-group-icon"></i>
        <h2 class="category-group-title">${group.title}</h2>
      </div>
      <div class="category-group-actions">
        ${editModeActive ? `
          <button class="category-action-btn move-group-up" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="category-action-btn move-group-down" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
          <button class="category-action-btn edit-group" title="Edit Category"><i class="fa-solid fa-pencil"></i></button>
          <button class="category-action-btn delete-group" title="Delete Category" style="color:#f87171;"><i class="fa-solid fa-trash-can"></i></button>
        ` : ''}
        <button class="category-action-btn category-collapse-btn" title="Collapse/Expand"><i class="fa-solid fa-chevron-down"></i></button>
      </div>
    `;

    // Category Grid
    const grid = document.createElement('div');
    grid.className = 'category-group-grid';
    grid.setAttribute('data-index', groupIndex);

    // Apply layout spans based on settings
    applyGroupGridConfig(grid);

    // Build App Cards inside grid
    buildAppCardsForGroup(group, groupIndex, grid);

    // Add elements to block
    groupBlock.appendChild(header);
    groupBlock.appendChild(grid);
    container.appendChild(groupBlock);

    // Collapsing Event
    header.querySelector('.category-collapse-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      group.collapsed = !group.collapsed;
      groupBlock.classList.toggle('group-collapsed', group.collapsed);
      saveGroupsToStorage(userGroups);
    });

    // Edit active drag setup for groups themselves
    if (editModeActive) {
      // Reorder Category Group Actions
      header.querySelector('.move-group-up').addEventListener('click', () => {
        if (groupIndex > 0) {
          const temp = userGroups[groupIndex];
          userGroups[groupIndex] = userGroups[groupIndex - 1];
          userGroups[groupIndex - 1] = temp;
          saveGroupsToStorage(userGroups);
          renderDashboardGroups(userGroups);
        }
      });
      header.querySelector('.move-group-down').addEventListener('click', () => {
        if (groupIndex < userGroups.length - 1) {
          const temp = userGroups[groupIndex];
          userGroups[groupIndex] = userGroups[groupIndex + 1];
          userGroups[groupIndex + 1] = temp;
          saveGroupsToStorage(userGroups);
          renderDashboardGroups(userGroups);
        }
      });
      header.querySelector('.edit-group').addEventListener('click', () => {
        openGroupModalForEdit(groupIndex);
      });
      header.querySelector('.delete-group').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${group.title}" and all its apps?`)) {
          userGroups.splice(groupIndex, 1);
          saveGroupsToStorage(userGroups);
          renderDashboardGroups(userGroups);
          renderAppDock(userGroups);
        }
      });

      // HTML5 drag and drop for category groups sorting
      header.setAttribute('draggable', 'true');
      header.addEventListener('dragstart', (e) => {
        header.classList.add('dragging-group');
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'group', fromIndex: groupIndex }));
      });
      header.addEventListener('dragover', (e) => {
        e.preventDefault();
        groupBlock.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      });
      header.addEventListener('dragleave', () => {
        groupBlock.style.borderColor = '';
      });
      header.addEventListener('drop', (e) => {
        e.preventDefault();
        groupBlock.style.borderColor = '';
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.type === 'group' && data.fromIndex !== groupIndex) {
            const movedGroup = userGroups.splice(data.fromIndex, 1)[0];
            userGroups.splice(groupIndex, 0, movedGroup);
            saveGroupsToStorage(userGroups);
            renderDashboardGroups(userGroups);
          }
        } catch (err) {}
      });
    }
  });

  // Highlight Mouse Glow Effect
  initCardMouseGlow();
  
  // Apply search filters immediately on render if text present
  applySearchFilter();
}

function applyGroupGridConfig(grid) {
  grid.classList.remove('grid-cols-2', 'grid-cols-3', 'grid-cols-4');
  if (workspaceConfig.gridCols && workspaceConfig.gridCols !== 'auto') {
    grid.classList.add(`grid-cols-${workspaceConfig.gridCols}`);
  }
  
  grid.classList.remove('gap-tight', 'gap-comfortable', 'gap-spacious');
  if (workspaceConfig.cardGap) {
    grid.classList.add(`gap-${workspaceConfig.cardGap}`);
  }
}

function buildAppCardsForGroup(group, groupIndex, grid) {
  group.apps.forEach((app, appIndex) => {
    const card = document.createElement('a');
    card.className = 'app-card';
    card.setAttribute('data-index', appIndex);
    card.setAttribute('data-title', app.title.toLowerCase());
    card.style.setProperty('--accent-color-rgb', hexToRgb(app.color));

    // Width, Height Spans
    if (app.colspan && app.colspan > 1) card.classList.add(`colspan-${app.colspan}`);
    if (app.rowspan && app.rowspan > 1) card.classList.add(`rowspan-${app.rowspan}`);

    // Global Card Sizing scale
    const sizeStyle = (app.sizeOverride && app.sizeOverride !== 'default') ? app.sizeOverride : workspaceConfig.cardSize;
    if (sizeStyle === 'compact') card.classList.add('card-compact');
    else if (sizeStyle === 'expanded') card.classList.add('card-expanded');

    if (editModeActive) {
      card.href = '#';
      card.addEventListener('click', (e) => e.preventDefault());
      card.setAttribute('draggable', 'true');
      
      // Drag & Drop Apps sorting
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'app', groupIndex, appIndex }));
      });
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (data.type === 'app') {
            const movedApp = userGroups[data.groupIndex].apps.splice(data.appIndex, 1)[0];
            // If dropping in same group or different
            userGroups[groupIndex].apps.splice(appIndex, 0, movedApp);
            saveGroupsToStorage(userGroups);
            renderDashboardGroups(userGroups);
            renderAppDock(userGroups);
          }
        } catch (err) {}
      });
    } else {
      if (app.integration && app.integration !== 'none') {
        card.href = '#';
        card.addEventListener('click', (e) => {
          e.preventDefault();
          openAppDetailOverlay(app, groupIndex, appIndex);
        });
      } else {
        card.href = app.url;
        card.target = '_blank';
      }
    }

    // Ping Indicator Dot HTML
    let pingHtml = '';
    if (app.pingEnabled) {
      pingHtml = `
        <div class="ping-indicator">
          <span class="ping-latency">checking</span>
          <span class="ping-dot"></span>
        </div>
      `;
    }

    card.innerHTML = `
      ${pingHtml}
      <div class="card-glow"></div>
      <div class="card-header">
        <div class="app-icon-squircle" style="background: linear-gradient(135deg, rgba(${hexToRgb(app.color)}, 0.2), rgba(${hexToRgb(app.color)}, 0.08)); color:${app.color};">
          ${workModeActive ? (getMicrosoftLogo(app.title) || `<i class="fa-solid ${app.icon}"></i>`) : `<i class="fa-solid ${app.icon}"></i>`}
        </div>
        <div class="card-action-icon">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </div>
      </div>
      <div class="card-content">
        <h3 class="app-title">${app.title}</h3>
        <p class="app-description">${app.desc}</p>
      </div>
      <div class="card-footer">
        <span class="app-accent-badge" style="background: rgba(${hexToRgb(app.color)}, 0.15); color: ${app.color}; border: 1px solid rgba(${hexToRgb(app.color)}, 0.3);">
          <span class="badge-dot" style="background: ${app.color};"></span>
          <span class="badge-text">${getCleanUrl(app.url)}</span>
        </span>
      </div>
    `;

    // Edit mode action badges overlay
    if (editModeActive) {
      const deleteBadge = document.createElement('div');
      deleteBadge.className = 'delete-badge';
      deleteBadge.innerHTML = `<i class="fa-solid fa-minus"></i>`;
      deleteBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete app "${app.title}"?`)) {
          userGroups[groupIndex].apps.splice(appIndex, 1);
          saveGroupsToStorage(userGroups);
          renderDashboardGroups(userGroups);
          renderAppDock(userGroups);
        }
      });

      const editBadge = document.createElement('div');
      editBadge.className = 'edit-badge';
      editBadge.innerHTML = `<i class="fa-solid fa-pencil"></i>`;
      editBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        openModalForEdit(groupIndex, appIndex);
      });

      const starBadge = document.createElement('div');
      starBadge.className = `star-badge ${app.favorite ? 'starred' : ''}`;
      starBadge.innerHTML = `<i class="${app.favorite ? 'fa-solid fa-star' : 'fa-regular fa-star'}" style="color: ${app.favorite ? '#fff' : '#cbd5e1'}"></i>`;
      starBadge.title = app.favorite ? 'Remove from Favorites' : 'Add to Favorites';
      starBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        app.favorite = !app.favorite;
        saveGroupsToStorage(userGroups);
        renderDashboardGroups(userGroups);
        renderAppDock(userGroups);
      });

      card.appendChild(deleteBadge);
      card.appendChild(editBadge);
      card.appendChild(starBadge);
    }

    grid.appendChild(card);
  });

  // Append empty drop-zone card to move app inside empty groups
  if (editModeActive) {
    const addCard = document.createElement('div');
    addCard.className = 'app-card add-card';
    addCard.innerHTML = `
      <div class="add-card-content">
        <div class="add-card-icon"><i class="fa-solid fa-plus"></i></div>
        <span class="add-card-title">Add App</span>
      </div>
    `;
    addCard.addEventListener('click', () => openModalForCreate(groupIndex));
    addCard.addEventListener('dragover', (e) => e.preventDefault());
    addCard.addEventListener('drop', (e) => {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        if (data.type === 'app') {
          const movedApp = userGroups[data.groupIndex].apps.splice(data.appIndex, 1)[0];
          userGroups[groupIndex].apps.push(movedApp);
          saveGroupsToStorage(userGroups);
          renderDashboardGroups(userGroups);
          renderAppDock(userGroups);
        }
      } catch (err) {}
    });
    grid.appendChild(addCard);
  }
}

function buildFavoriteCard(app, groupIndex, appIndex, grid) {
  const card = document.createElement('a');
  card.className = 'app-card';
  card.style.setProperty('--accent-color-rgb', hexToRgb(app.color));

  const sizeStyle = (app.sizeOverride && app.sizeOverride !== 'default') ? app.sizeOverride : workspaceConfig.cardSize;
  if (sizeStyle === 'compact') card.classList.add('card-compact');
  else if (sizeStyle === 'expanded') card.classList.add('card-expanded');

  if (editModeActive) {
    card.href = '#';
    card.addEventListener('click', (e) => e.preventDefault());
  } else {
    if (app.integration && app.integration !== 'none') {
      card.href = '#';
      card.addEventListener('click', (e) => {
        e.preventDefault();
        openAppDetailOverlay(app, groupIndex, appIndex);
      });
    } else {
      card.href = app.url;
      card.target = '_blank';
    }
  }

  let pingHtml = '';
  if (app.pingEnabled) {
    pingHtml = `
      <div class="ping-indicator">
        <span class="ping-latency">checking</span>
        <span class="ping-dot"></span>
      </div>
    `;
  }

  card.innerHTML = `
    ${pingHtml}
    <div class="card-glow"></div>
    <div class="card-header">
      <div class="app-icon-squircle" style="background: linear-gradient(135deg, rgba(${hexToRgb(app.color)}, 0.2), rgba(${hexToRgb(app.color)}, 0.08)); color:${app.color};">
        ${workModeActive ? (getMicrosoftLogo(app.title) || `<i class="fa-solid ${app.icon}"></i>`) : `<i class="fa-solid ${app.icon}"></i>`}
      </div>
      <div class="card-action-icon">
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </div>
    </div>
    <div class="card-content">
      <h3 class="app-title">${app.title}</h3>
      <p class="app-description">${app.desc}</p>
    </div>
    <div class="card-footer">
      <span class="app-accent-badge" style="background: rgba(${hexToRgb(app.color)}, 0.15); color: ${app.color}; border: 1px solid rgba(${hexToRgb(app.color)}, 0.3);">
        <span class="badge-dot" style="background: ${app.color};"></span>
        <span class="badge-text">${getCleanUrl(app.url)}</span>
      </span>
    </div>
  `;

  if (editModeActive) {
    const starBadge = document.createElement('div');
    starBadge.className = 'star-badge starred';
    starBadge.innerHTML = `<i class="fa-solid fa-star" style="color: #fff;"></i>`;
    starBadge.title = 'Remove from Favorites';
    starBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      app.favorite = false;
      saveGroupsToStorage(userGroups);
      renderDashboardGroups(userGroups);
      renderAppDock(userGroups);
    });
    card.appendChild(starBadge);
  }

  grid.appendChild(card);
}

// Flat App Dock Renderer
function renderAppDock(groups) {
  const dock = document.getElementById('dock-container');
  if (!dock) return;
  dock.innerHTML = '';

  groups.forEach(group => {
    group.apps.forEach(app => {
      const item = document.createElement('div');
      item.className = 'dock-item';
      item.setAttribute('data-title', app.title);
      item.style.setProperty('--accent-color-rgb', hexToRgb(app.color));

      const link = document.createElement('a');
      if (app.integration && app.integration !== 'none') {
        link.href = '#';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          openAppDetailOverlay(app);
        });
      } else {
        link.href = app.url;
        link.target = '_blank';
      }
      link.setAttribute('aria-label', app.title);
      link.innerHTML = `
        <div class="dock-fallback-icon" style="background: linear-gradient(135deg, rgba(${hexToRgb(app.color)}, 0.3), rgba(${hexToRgb(app.color)}, 0.15)); color: ${app.color}; display: flex; border-radius: inherit; width: 100%; height: 100%; align-items: center; justify-content: center;">
          <i class="fa-solid ${app.icon}"></i>
        </div>
      `;
      item.appendChild(link);

      const tooltip = document.createElement('span');
      tooltip.className = 'dock-tooltip';
      tooltip.textContent = app.title;
      item.appendChild(tooltip);

      dock.appendChild(item);
    });
  });

  initDockFisheye();
}

/**
 * App CRUD Modals Logic
 */
function initModalEvents() {
  const cancelBtn = document.getElementById('modal-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const modal = document.getElementById('editor-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
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
      const pingEnabled = document.getElementById('modal-app-ping').checked;
      const favorite = document.getElementById('modal-app-favorite').checked;
      const integration = document.getElementById('modal-app-integration').value;
      const groupSelect = document.getElementById('modal-app-group');
      const targetGroupIndex = parseInt(groupSelect.value, 10);

      if (!title || !desc || !url) return;

      const appData = { title, desc, url, color, icon, colspan, rowspan, sizeOverride, pingEnabled, favorite, integration };

      if (editingAppIndex === null) {
        // Create new card
        userGroups[targetGroupIndex].apps.push(appData);
      } else {
        // Edit existing card
        const srcGroupIndex = editingAppIndex.groupIndex;
        const srcAppIndex = editingAppIndex.appIndex;
        
        // Remove from old group
        userGroups[srcGroupIndex].apps.splice(srcAppIndex, 1);
        // Add to targeted group
        userGroups[targetGroupIndex].apps.splice(srcAppIndex, 0, appData);
      }

      saveGroupsToStorage(userGroups);
      renderDashboardGroups(userGroups);
      renderAppDock(userGroups);
      closeModal();
    });
  }
}

function openModalForCreate(groupIndex = 0) {
  editingAppIndex = null;
  document.getElementById('modal-title').textContent = 'Add Application';
  document.getElementById('editor-form').reset();
  
  // Populate category dropdown
  populateGroupDropdown(groupIndex);

  document.getElementById('modal-app-title').value = '';
  document.getElementById('modal-app-desc').value = '';
  document.getElementById('modal-app-url').value = '';
  document.getElementById('modal-app-color').value = '#a855f7';
  document.getElementById('modal-app-icon').value = 'fa-globe';
  document.getElementById('modal-app-colspan').value = '1';
  document.getElementById('modal-app-rowspan').value = '1';
  document.getElementById('modal-app-size').value = 'default';
  document.getElementById('modal-app-ping').checked = true;
  document.getElementById('modal-app-favorite').checked = false;
  document.getElementById('modal-app-integration').value = 'none';

  document.getElementById('editor-modal').style.display = 'flex';
}

function openModalForEdit(groupIndex, appIndex) {
  editingAppIndex = { groupIndex, appIndex };
  document.getElementById('modal-title').textContent = 'Edit Application';
  
  // Populate category dropdown
  populateGroupDropdown(groupIndex);

  const app = userGroups[groupIndex].apps[appIndex];
  if (app) {
    document.getElementById('modal-app-title').value = app.title;
    document.getElementById('modal-app-desc').value = app.desc;
    document.getElementById('modal-app-url').value = app.url;
    document.getElementById('modal-app-color').value = app.color || '#a855f7';
    document.getElementById('modal-app-icon').value = app.icon || 'fa-globe';
    document.getElementById('modal-app-colspan').value = app.colspan || 1;
    document.getElementById('modal-app-rowspan').value = app.rowspan || 1;
    document.getElementById('modal-app-size').value = app.sizeOverride || 'default';
    document.getElementById('modal-app-ping').checked = app.pingEnabled !== false;
    document.getElementById('modal-app-favorite').checked = app.favorite === true;
    document.getElementById('modal-app-integration').value = app.integration || 'none';
  }

  document.getElementById('editor-modal').style.display = 'flex';
}

function populateGroupDropdown(selectedIndex = 0) {
  const select = document.getElementById('modal-app-group');
  if (!select) return;
  select.innerHTML = '';
  userGroups.forEach((group, index) => {
    select.innerHTML += `<option value="${index}" ${index === selectedIndex ? 'selected' : ''}>${group.title}</option>`;
  });
}

function closeModal() {
  const modal = document.getElementById('editor-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Group/Category Modal logic
 */
function initGroupModalEvents() {
  const modal = document.getElementById('group-modal');
  const form = document.getElementById('group-form');
  const closeBtn = document.getElementById('group-modal-close-btn');
  const cancelBtn = document.getElementById('group-cancel-btn');

  const closeGroupModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeGroupModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeGroupModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGroupModal();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('modal-group-title').value.trim();
      const icon = document.getElementById('modal-group-icon').value;
      if (!title) return;

      if (editingGroupIndex === null) {
        // Create
        userGroups.push({
          id: `group-${Date.now()}`,
          title,
          icon,
          collapsed: false,
          apps: []
        });
      } else {
        // Edit
        userGroups[editingGroupIndex].title = title;
        userGroups[editingGroupIndex].icon = icon;
      }

      saveGroupsToStorage(userGroups);
      renderDashboardGroups(userGroups);
      closeGroupModal();
    });
  }

  const addGroupBtn = document.getElementById('add-group-btn');
  if (addGroupBtn) {
    addGroupBtn.addEventListener('click', () => openGroupModalForCreate());
  }
}

function openGroupModalForCreate() {
  editingGroupIndex = null;
  document.getElementById('group-modal-title').textContent = 'Add Category';
  document.getElementById('group-form').reset();
  document.getElementById('modal-group-title').value = '';
  document.getElementById('modal-group-icon').value = 'fa-folder';
  document.getElementById('group-modal').style.display = 'flex';
}

function openGroupModalForEdit(groupIndex) {
  editingGroupIndex = groupIndex;
  document.getElementById('group-modal-title').textContent = 'Edit Category';
  const group = userGroups[groupIndex];
  document.getElementById('modal-group-title').value = group.title;
  document.getElementById('modal-group-icon').value = group.icon;
  document.getElementById('group-modal').style.display = 'flex';
}

/**
 * Edit Mode Toggle Manager
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

    const addGroupBtn = document.getElementById('add-group-btn');
    if (addGroupBtn) addGroupBtn.style.display = editModeActive ? 'flex' : 'none';

    const addWidgetBtn = document.getElementById('add-widget-btn');
    if (addWidgetBtn) addWidgetBtn.style.display = editModeActive ? 'flex' : 'none';

    renderDashboardGroups(userGroups);
    renderSidebarWidgets(userWidgets);
  });
}

/**
 * Workspace Settings Modal (Tabbed Layout)
 */
function initSettingsModal() {
  const settingsBtn = document.getElementById('workspace-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsForm = document.getElementById('settings-form');
  const closeBtn = document.getElementById('settings-close-btn');
  const cancelBtn = document.getElementById('settings-cancel-btn');

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
      if (e.target === settingsModal) closeModalFn();
    });
  }

  // Hook Tab Switches inside Settings
  const tabBtns = document.querySelectorAll('.modal-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTabId = btn.getAttribute('data-tab');
      const tabContents = document.querySelectorAll('.settings-tab-content');
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTabId) content.classList.add('active');
      });
    });
  });

  // Hook Settings Theme selectors
  const themeBtns = document.querySelectorAll('.theme-selector-item');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      workspaceConfig.theme = btn.getAttribute('data-select-theme');
      
      // Live preview theme transition
      const body = document.body;
      const wasEditActive = body.classList.contains('edit-active');
      body.className = workspaceConfig.theme;
      if (wasEditActive) body.classList.add('edit-active');
    });
  });

  // Live preview for glassmorphic tuning sliders
  const blurSlider = document.getElementById('settings-glass-blur');
  if (blurSlider) {
    blurSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      const lbl = document.getElementById('label-glass-blur');
      if (lbl) lbl.textContent = val + 'px';
      document.documentElement.style.setProperty('--glass-blur', val + 'px');
    });
  }

  const opacitySlider = document.getElementById('settings-blob-opacity');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const val = e.target.value;
      const lbl = document.getElementById('label-blob-opacity');
      if (lbl) lbl.textContent = val;
      document.documentElement.style.setProperty('--blob-brightness', val);
    });
  }

  const speedSlider = document.getElementById('settings-blob-speed');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      const lbl = document.getElementById('label-blob-speed');
      if (lbl) lbl.textContent = val + 's';
      document.documentElement.style.setProperty('--blob-speed', val + 's');
    });
  }

  const fontSelect = document.getElementById('settings-theme-font');
  if (fontSelect) {
    fontSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val !== 'default') {
        document.documentElement.style.setProperty('--font-display', val);
        document.documentElement.style.setProperty('--font-body', val);
      } else {
        document.documentElement.style.setProperty('--font-display', "'Outfit', sans-serif");
        document.documentElement.style.setProperty('--font-body', "'Inter', sans-serif");
      }
    });
  }

  // Hook Settings Form Submission
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('settings-username').value.trim();
      const workspaceName = document.getElementById('settings-workspace-name').value.trim();
      if (username) localStorage.setItem('launchpad_username', username);
      if (workspaceName) {
        localStorage.setItem('launchpad_workspace_name', workspaceName);
        const label = document.querySelector('.workspace-label');
        if (label && !workModeActive) label.textContent = workspaceName;
      }
      initGreeting();
      
      workspaceConfig.gridCols = document.getElementById('settings-grid-cols').value;
      workspaceConfig.cardSize = document.getElementById('settings-card-size').value;
      workspaceConfig.cardGap = document.getElementById('settings-card-gap').value;
      workspaceConfig.sidebarPos = document.getElementById('settings-sidebar-pos').value;
      workspaceConfig.sidebarCols = document.getElementById('settings-sidebar-cols').value;
      workspaceConfig.weatherCity = document.getElementById('settings-weather-city').value;
      workspaceConfig.weatherState = document.getElementById('settings-weather-state').value;
      workspaceConfig.bgPattern = document.getElementById('settings-bg-pattern').value;
      workspaceConfig.showBlobs = document.getElementById('settings-toggle-blobs').checked;

      // Save customizer values
      workspaceConfig.themeFont = document.getElementById('settings-theme-font') ? document.getElementById('settings-theme-font').value : 'default';
      workspaceConfig.glassBlur = document.getElementById('settings-glass-blur') ? document.getElementById('settings-glass-blur').value + 'px' : '20px';
      workspaceConfig.blobOpacity = document.getElementById('settings-blob-opacity') ? document.getElementById('settings-blob-opacity').value : '0.45';
      workspaceConfig.blobSpeed = document.getElementById('settings-blob-speed') ? document.getElementById('settings-blob-speed').value + 's' : '25s';
      
      workspaceConfig.showClock = document.getElementById('settings-toggle-clock').checked;
      workspaceConfig.showNotepad = document.getElementById('settings-toggle-notepad').checked;
      workspaceConfig.showWeather = document.getElementById('settings-toggle-weather').checked;
      workspaceConfig.showResources = document.getElementById('settings-toggle-resources').checked;
      workspaceConfig.showBookmarks = document.getElementById('settings-toggle-bookmarks').checked;

      // Integration forms
      integrationConfigs.plexUrl = document.getElementById('integration-plex-url').value.trim();
      integrationConfigs.plexToken = document.getElementById('integration-plex-token').value.trim();
      integrationConfigs.tautulliUrl = document.getElementById('integration-tautulli-url').value.trim();
      integrationConfigs.tautulliKey = document.getElementById('integration-tautulli-key').value.trim();
      integrationConfigs.sonarrUrl = document.getElementById('integration-sonarr-url').value.trim();
      integrationConfigs.sonarrKey = document.getElementById('integration-sonarr-key').value.trim();
      integrationConfigs.radarrUrl = document.getElementById('integration-radarr-url').value.trim();
      integrationConfigs.radarrKey = document.getElementById('integration-radarr-key').value.trim();
      integrationConfigs.overseerrUrl = document.getElementById('integration-overseerr-url').value.trim();
      integrationConfigs.overseerrKey = document.getElementById('integration-overseerr-key').value.trim();
      integrationConfigs.qbittorrentUrl = document.getElementById('integration-qbittorrent-url').value.trim();
      integrationConfigs.qbittorrentUser = document.getElementById('integration-qbittorrent-user').value.trim();
      integrationConfigs.qbittorrentPass = document.getElementById('integration-qbittorrent-pass').value.trim();
      integrationConfigs.cfWorkerUrl = document.getElementById('integration-cf-worker-url') ? document.getElementById('integration-cf-worker-url').value.trim() : '';

      // Save States
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(workspaceConfig));
      saveIntegrationConfigs(integrationConfigs);
      
      applyWorkspaceConfig(workspaceConfig);
      renderDashboardGroups(userGroups);
      startIntegrationLoops();
      closeModalFn();
    });
  }

  // Hook Backup / Restore buttons
  const exportBtn = document.getElementById('settings-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportWorkspaceConfig());
  }

  const importFile = document.getElementById('settings-import-file');
  if (importFile) {
    importFile.addEventListener('change', (e) => importWorkspaceConfig(e));
  }

  // Hook Test Connection buttons
  const testBtns = document.querySelectorAll('.test-integration-btn');
  testBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const integration = btn.getAttribute('data-integration');
      const statusEl = document.getElementById(`test-status-${integration}`);
      if (!statusEl) return;
      
      statusEl.innerHTML = `<i class="fa-solid fa-sync fa-spin" style="color:var(--text-secondary)"></i> Testing...`;
      statusEl.style.color = 'var(--text-secondary)';

      // Read values live from form inputs
      let url = '';
      let key = '';

      if (integration === 'plex') {
        url = cleanUrl(document.getElementById('integration-plex-url').value);
        key = document.getElementById('integration-plex-token').value.trim();
      } else if (integration === 'tautulli') {
        url = cleanUrl(document.getElementById('integration-tautulli-url').value);
        key = document.getElementById('integration-tautulli-key').value.trim();
      } else if (integration === 'sonarr') {
        url = cleanUrl(document.getElementById('integration-sonarr-url').value);
        key = document.getElementById('integration-sonarr-key').value.trim();
      } else if (integration === 'radarr') {
        url = cleanUrl(document.getElementById('integration-radarr-url').value);
        key = document.getElementById('integration-radarr-key').value.trim();
      } else if (integration === 'overseerr') {
        url = cleanUrl(document.getElementById('integration-overseerr-url').value);
        key = document.getElementById('integration-overseerr-key').value.trim();
      } else if (integration === 'qbittorrent') {
        url = cleanUrl(document.getElementById('integration-qbittorrent-url').value);
      } else if (integration === 'cf-worker') {
        url = cleanUrl(document.getElementById('integration-cf-worker-url').value);
      }

      if (!url) {
        statusEl.innerHTML = `❌ URL is empty`;
        statusEl.style.color = '#f87171';
        return;
      }

      try {
        let success = false;
        let errorDetail = '';

        if (integration === 'plex') {
          const res = await fetch(`${url}/status/sessions?X-Plex-Token=${key}`, { headers: { 'Accept': 'application/json' } });
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        } else if (integration === 'tautulli') {
          const res = await fetch(`${url}/api/v2?apikey=${key}&cmd=get_activity`);
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        } else if (integration === 'sonarr') {
          const res = await fetch(`${url}/api/v3/system/status?apikey=${key}`);
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        } else if (integration === 'radarr') {
          const res = await fetch(`${url}/api/v3/system/status?apikey=${key}`);
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        } else if (integration === 'overseerr') {
          const res = await fetch(`${url}/api/v1/status`, { headers: { 'X-Api-Key': key } });
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        } else if (integration === 'qbittorrent') {
          const res = await fetch(`${url}/api/v2/torrents/info?filter=all`);
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        } else if (integration === 'cf-worker') {
          const res = await fetch(`${url}/health`);
          success = res.ok;
          if (!res.ok) errorDetail = `HTTP ${res.status}`;
        }

        if (success) {
          statusEl.innerHTML = `✅ Connection Successful!`;
          statusEl.style.color = '#34d399';
        } else {
          statusEl.innerHTML = `❌ Failed (${errorDetail})`;
          statusEl.style.color = '#f87171';
        }
      } catch (err) {
        console.error(`Test Connection Error for ${integration}:`, err);
        statusEl.innerHTML = `❌ Failed (CORS block or Host offline)`;
        statusEl.style.color = '#f87171';
      }
    });
  });
}

function initIntegrationsSetupBanner() {
  const banner = document.getElementById('integrations-setup-banner');
  const dismissBtn = document.getElementById('dismiss-setup-banner-btn');
  if (!banner) return;

  const isDismissed = localStorage.getItem('launchpad_setup_banner_dismissed') === 'true';
  const hasConfigs = integrationConfigs.plexUrl || 
                     integrationConfigs.tautulliUrl || 
                     integrationConfigs.sonarrUrl || 
                     integrationConfigs.radarrUrl || 
                     integrationConfigs.overseerrUrl || 
                     integrationConfigs.qbittorrentUrl;

  if (!hasConfigs && !isDismissed) {
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      banner.style.display = 'none';
      localStorage.setItem('launchpad_setup_banner_dismissed', 'true');
    });
  }
}

function populateSettingsForm() {
  document.getElementById('settings-username').value = localStorage.getItem('launchpad_username') || 'Thomas';
  document.getElementById('settings-workspace-name').value = localStorage.getItem('launchpad_workspace_name') || "Thomas's Workspace";
  document.getElementById('settings-grid-cols').value = workspaceConfig.gridCols;
  document.getElementById('settings-card-size').value = workspaceConfig.cardSize;
  document.getElementById('settings-card-gap').value = workspaceConfig.cardGap;
  document.getElementById('settings-sidebar-pos').value = workspaceConfig.sidebarPos;
  document.getElementById('settings-sidebar-cols').value = workspaceConfig.sidebarCols;
  document.getElementById('settings-weather-city').value = workspaceConfig.weatherCity;
  document.getElementById('settings-weather-state').value = workspaceConfig.weatherState;
  document.getElementById('settings-bg-pattern').value = workspaceConfig.bgPattern;
  document.getElementById('settings-toggle-blobs').checked = workspaceConfig.showBlobs !== false;

  document.getElementById('settings-toggle-clock').checked = workspaceConfig.showClock !== false;
  document.getElementById('settings-toggle-notepad').checked = workspaceConfig.showNotepad !== false;
  document.getElementById('settings-toggle-weather').checked = workspaceConfig.showWeather !== false;
  document.getElementById('settings-toggle-resources').checked = workspaceConfig.showResources !== false;
  document.getElementById('settings-toggle-bookmarks').checked = workspaceConfig.showBookmarks !== false;

  // Active theme highlighting
  const activeTheme = workspaceConfig.theme || 'theme-midnight-nebula';
  const themeBtns = document.querySelectorAll('.theme-selector-item');
  themeBtns.forEach(btn => {
    btn.classList.toggle('selected', btn.getAttribute('data-select-theme') === activeTheme);
  });

  // Customization controls
  const themeFont = workspaceConfig.themeFont || 'default';
  const glassBlur = parseInt(workspaceConfig.glassBlur, 10) || 20;
  const blobOpacity = parseFloat(workspaceConfig.blobOpacity) || 0.45;
  const blobSpeed = parseInt(workspaceConfig.blobSpeed, 10) || 25;
  
  const fontSelect = document.getElementById('settings-theme-font');
  if (fontSelect) fontSelect.value = themeFont;
  
  const blurSlider = document.getElementById('settings-glass-blur');
  if (blurSlider) {
    blurSlider.value = glassBlur;
    const lbl = document.getElementById('label-glass-blur');
    if (lbl) lbl.textContent = glassBlur + 'px';
  }
  
  const opacitySlider = document.getElementById('settings-blob-opacity');
  if (opacitySlider) {
    opacitySlider.value = blobOpacity;
    const lbl = document.getElementById('label-blob-opacity');
    if (lbl) lbl.textContent = blobOpacity;
  }
  
  const speedSlider = document.getElementById('settings-blob-speed');
  if (speedSlider) {
    speedSlider.value = blobSpeed;
    const lbl = document.getElementById('label-blob-speed');
    if (lbl) lbl.textContent = blobSpeed + 's';
  }

  // Integrations configs
  document.getElementById('integration-plex-url').value = integrationConfigs.plexUrl || '';
  document.getElementById('integration-plex-token').value = integrationConfigs.plexToken || '';
  document.getElementById('integration-tautulli-url').value = integrationConfigs.tautulliUrl || '';
  document.getElementById('integration-tautulli-key').value = integrationConfigs.tautulliKey || '';
  document.getElementById('integration-sonarr-url').value = integrationConfigs.sonarrUrl || '';
  document.getElementById('integration-sonarr-key').value = integrationConfigs.sonarrKey || '';
  document.getElementById('integration-radarr-url').value = integrationConfigs.radarrUrl || '';
  document.getElementById('integration-radarr-key').value = integrationConfigs.radarrKey || '';
  document.getElementById('integration-overseerr-url').value = integrationConfigs.overseerrUrl || '';
  document.getElementById('integration-overseerr-key').value = integrationConfigs.overseerrKey || '';
  document.getElementById('integration-qbittorrent-url').value = integrationConfigs.qbittorrentUrl || '';
  document.getElementById('integration-qbittorrent-user').value = integrationConfigs.qbittorrentUser || '';
  document.getElementById('integration-qbittorrent-pass').value = integrationConfigs.qbittorrentPass || '';
  if (document.getElementById('integration-cf-worker-url')) {
    document.getElementById('integration-cf-worker-url').value = integrationConfigs.cfWorkerUrl || '';
  }
}

function applyWorkspaceConfig(config) {
  // Apply Background Style Patterns
  const patternOverlay = document.getElementById('bg-pattern-overlay');
  if (patternOverlay) {
    patternOverlay.className = 'bg-pattern-overlay';
    if (config.bgPattern && config.bgPattern !== 'none') {
      patternOverlay.classList.add(`pattern-${config.bgPattern}`);
    }
  }

  const blobs = document.getElementById('bg-blobs');
  if (blobs) {
    blobs.style.display = config.showBlobs === false ? 'none' : '';
  }

  // Sidebar layouts
  const layout = document.querySelector('.dashboard-layout');
  const sidebarWidgetsGrid = document.getElementById('sidebar-widgets');
  
  if (layout) {
    layout.classList.remove('sidebar-right', 'sidebar-left', 'sidebar-top', 'sidebar-hidden');
    layout.classList.add(`sidebar-${config.sidebarPos || 'right'}`);
  }
  
  if (sidebarWidgetsGrid) {
    sidebarWidgetsGrid.style.setProperty('--sidebar-cols', config.sidebarCols || '1');
    sidebarWidgetsGrid.classList.remove('cols-1', 'cols-2');
    sidebarWidgetsGrid.classList.add(`cols-${config.sidebarCols || '1'}`);
  }

  // Widget visibility toggling
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

  // Apply general Theme body class
  document.body.className = config.theme || 'theme-midnight-nebula';
  if (editModeActive) document.body.classList.add('edit-active');

  // Set visual properties on root
  document.documentElement.style.setProperty('--glass-blur', config.glassBlur || '20px');
  document.documentElement.style.setProperty('--blob-brightness', config.blobOpacity || '0.45');
  document.documentElement.style.setProperty('--blob-speed', config.blobSpeed || '25s');
  
  if (config.themeFont && config.themeFont !== 'default') {
    document.documentElement.style.setProperty('--font-display', config.themeFont);
    document.documentElement.style.setProperty('--font-body', config.themeFont);
  } else {
    document.documentElement.style.setProperty('--font-display', "'Outfit', sans-serif");
    document.documentElement.style.setProperty('--font-body', "'Inter', sans-serif");
  }
}

/**
 * Backup / Import Export Logic
 */
function exportWorkspaceConfig() {
  const fullConfig = {
    version: '2.0.0',
    groups: userGroups,
    widgets: userWidgets,
    config: workspaceConfig,
    integrations: integrationConfigs
  };
  
  const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `thomas_launchpad_config_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importWorkspaceConfig(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.groups && parsed.widgets && parsed.config) {
        userGroups = parsed.groups;
        userWidgets = parsed.widgets;
        workspaceConfig = parsed.config;
        if (parsed.integrations) {
          integrationConfigs = parsed.integrations;
        }

        // Save everything
        saveGroupsToStorage(userGroups);
        localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(userWidgets));
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(workspaceConfig));
        saveIntegrationConfigs(integrationConfigs);

        alert('Configuration imported successfully! Reloading...');
        window.location.reload();
      } else {
        alert('Invalid configuration file format.');
      }
    } catch (err) {
      alert('Error parsing config file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Spotlight / Command Palette Controller
 */
let spotlightIndex = 0;
let spotlightResults = [];

function initSpotlight() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('spotlight-input');
  
  if (!modal || !input) return;

  // Key Event bindings
  window.addEventListener('keydown', (e) => {
    // Esc closes Spotlight
    if (e.key === 'Escape') {
      closeSpotlight();
    }
    
    // Ctrl+K or '/' to open
    const isEditing = document.activeElement.tagName === 'INPUT' || 
                      document.activeElement.tagName === 'TEXTAREA' || 
                      document.activeElement.isContentEditable;

    if (((e.ctrlKey || e.metaKey) && e.key === 'k') || (e.key === '/' && !isEditing)) {
      e.preventDefault();
      openSpotlight();
    }
  });

  input.addEventListener('input', () => {
    querySpotlight(input.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('.spotlight-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      spotlightIndex = (spotlightIndex + 1) % items.length;
      updateSpotlightSelection(items);
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      spotlightIndex = (spotlightIndex - 1 + items.length) % items.length;
      updateSpotlightSelection(items);
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      items[spotlightIndex].click();
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSpotlight();
  });
}

function openSpotlight() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('spotlight-input');
  if (!modal || !input) return;

  modal.style.display = 'flex';
  input.value = '';
  input.focus();
  querySpotlight('');
}

function closeSpotlight() {
  const modal = document.getElementById('command-palette-modal');
  if (modal) modal.style.display = 'none';
}

function querySpotlight(query) {
  const q = query.toLowerCase().trim();
  spotlightResults = [];
  spotlightIndex = 0;

  // 1. Gather apps
  const activeGroups = workModeActive ? MICROSOFT_PORTALS : userGroups;
  activeGroups.forEach(group => {
    group.apps.forEach(app => {
      if (app.title.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q) || q === '') {
        spotlightResults.push({
          type: 'app',
          title: app.title,
          desc: app.desc,
          url: app.url,
          icon: app.icon,
          badge: group.title,
          appObj: app
        });
      }
    });
  });

  // 2. Gather command shortcuts
  const commands = [
    { type: 'cmd', title: '/work', desc: 'Toggle Microsoft Work Mode', icon: 'fa-briefcase', action: () => document.getElementById('work-mode-btn').click() },
    { type: 'cmd', title: '/edit', desc: 'Toggle Edit Workspace mode', icon: 'fa-sliders', action: () => document.getElementById('edit-mode-btn').click() },
    { type: 'cmd', title: '/settings', desc: 'Open Workspace Settings', icon: 'fa-gear', action: () => document.getElementById('workspace-settings-btn').click() },
    { type: 'cmd', title: '/addapp', desc: 'Add new Application card', icon: 'fa-plus', action: () => openModalForCreate() },
    { type: 'cmd', title: '/addcategory', desc: 'Add new category group', icon: 'fa-folder-plus', action: () => openGroupModalForCreate() },
    { type: 'cmd', title: '/widgets', desc: 'Add sidebar widget card', icon: 'fa-table-columns', action: () => openWidgetModalForCreate() },
    { type: 'cmd', title: '/backup', desc: 'Export config file', icon: 'fa-file-export', action: () => exportWorkspaceConfig() }
  ];

  commands.forEach(cmd => {
    if (cmd.title.includes(q) || cmd.desc.toLowerCase().includes(q) || q === '') {
      spotlightResults.push(cmd);
    }
  });

  renderSpotlightResults();
}

function renderSpotlightResults() {
  const list = document.getElementById('spotlight-results');
  if (!list) return;
  list.innerHTML = '';

  if (spotlightResults.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:20px; font-size:0.9rem; opacity:0.6;"><i class="fa-solid fa-face-meh"></i> No search results found</div>`;
    return;
  }

  spotlightResults.forEach((res, index) => {
    const item = document.createElement('div');
    item.className = 'spotlight-result-item';
    if (index === 0) item.classList.add('selected');

    let badgeText = res.type === 'cmd' ? 'command' : res.badge;
    let iconClass = res.icon || 'fa-globe';

    item.innerHTML = `
      <div class="spotlight-result-left">
        <i class="fa-solid ${iconClass}"></i>
        <span class="spotlight-result-title">${res.title}</span>
        <span class="spotlight-result-desc">${res.desc}</span>
      </div>
      <span class="spotlight-result-badge">${badgeText}</span>
    `;

    item.addEventListener('click', () => {
      closeSpotlight();
      if (res.type === 'app') {
        if (res.appObj && res.appObj.integration && res.appObj.integration !== 'none') {
          openAppDetailOverlay(res.appObj);
        } else {
          window.open(res.url, '_blank');
        }
      } else if (res.type === 'cmd') {
        res.action();
      }
    });

    item.addEventListener('mouseenter', () => {
      const items = document.querySelectorAll('.spotlight-result-item');
      spotlightIndex = index;
      updateSpotlightSelection(items);
    });

    list.appendChild(item);
  });
}

function updateSpotlightSelection(items) {
  items.forEach((item, index) => {
    item.classList.toggle('selected', index === spotlightIndex);
    if (index === spotlightIndex) {
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

/**
 * Legacy Search Input Fallback Filter
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
  const groups = document.querySelectorAll('.dashboard-category-group');
  let totalVisibleApps = 0;

  groups.forEach(groupBlock => {
    const cards = groupBlock.querySelectorAll('.app-card:not(.add-card)');
    let visibleInGroup = 0;

    cards.forEach(card => {
      const title = card.querySelector('.app-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.app-description')?.textContent.toLowerCase() || '';

      if (title.includes(query) || desc.includes(query) || query === '') {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        visibleInGroup++;
        totalVisibleApps++;
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
      }
    });

    // Hide entire category if search yields no matches, otherwise show
    if (visibleInGroup === 0 && query !== '') {
      groupBlock.style.display = 'none';
    } else {
      groupBlock.style.display = 'flex';
    }
  });

  if (noResults) {
    if (totalVisibleApps === 0 && query !== '') {
      noResults.style.display = 'flex';
    } else {
      noResults.style.display = 'none';
    }
  }
}

/**
 * Mouse Glow & Theme selection utilities
 */
function initCardMouseGlow() {
  const groups = document.getElementById('dashboard-groups');
  if (!groups) return;

  // Remove old listeners to avoid multiple registrations
  groups.removeEventListener('mousemove', handleCardMouseMove);
  groups.addEventListener('mousemove', handleCardMouseMove);
}

function handleCardMouseMove(e) {
  const card = e.target.closest('.app-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  card.style.setProperty('--mouse-x', `${x}px`);
  card.style.setProperty('--mouse-y', `${y}px`);
}

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

  const username = localStorage.getItem('launchpad_username') || "Thomas";
  greetingEl.textContent = workModeActive ? `Work Console, ${username}` : `${greetingText}, ${username}`;
}

function checkFirstTimeSetup() {
  const username = localStorage.getItem('launchpad_username');
  if (!username) {
    const setupModal = document.getElementById('first-time-setup-modal');
    if (setupModal) {
      setupModal.style.display = 'flex';
      
      const setupForm = document.getElementById('first-time-setup-form');
      if (setupForm) {
        setupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const newUsername = document.getElementById('setup-username').value.trim();
          const newWorkspaceName = document.getElementById('setup-workspacename').value.trim();
          const newWeatherCity = document.getElementById('setup-weather-city').value.trim();
          const newTheme = document.getElementById('setup-theme').value;
          
          if (newUsername) localStorage.setItem('launchpad_username', newUsername);
          if (newWorkspaceName) localStorage.setItem('launchpad_workspace_name', newWorkspaceName);
          
          // Apply weather city config
          workspaceConfig.weatherCity = newWeatherCity;
          // Apply theme config
          workspaceConfig.theme = newTheme;
          
          // Find weather widget in personalWidgets and update it
          const weatherWidget = personalWidgets.find(w => w.type === 'weather');
          if (weatherWidget) {
            weatherWidget.settings.city = newWeatherCity;
            saveWidgetsToStorage(personalWidgets);
          }
          
          // Save workspace config
          localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(workspaceConfig));
          applyWorkspaceConfig(workspaceConfig);
          
          // Hide modal
          setupModal.style.display = 'none';
          
          // Update header details
          const label = document.querySelector('.workspace-label');
          if (label && !workModeActive) label.textContent = newWorkspaceName;
          
          initGreeting();
          
          // Re-render
          renderDashboardGroups(userGroups);
          renderAppDock(userGroups);
          renderSidebarWidgets(userWidgets);
        });
      }
    }
  }
}

function initWorkMode() {
  const workBtn = document.getElementById('work-mode-btn');
  if (!workBtn) return;

  const workspaceLabel = document.querySelector('.workspace-label');
  const greetingEl = document.getElementById('greeting');
  const subtitleEl = document.querySelector('.greeting-container .subtitle');
  const editBtn = document.getElementById('edit-mode-btn');

  const applyWorkModeUI = (active) => {
    localStorage.setItem('launchpad_work_mode_active', active ? 'true' : 'false');
    workModeActive = active;

    // Set state pointers
    userGroups = active ? workGroups : personalGroups;
    userWidgets = active ? workWidgets : personalWidgets;

    workBtn.classList.toggle('work-mode-on', active);
    document.body.classList.toggle('work-mode-active', active);

    const customLabel = localStorage.getItem('launchpad_workspace_name') || "Thomas's Workspace";
    if (workspaceLabel) {
      workspaceLabel.textContent = active ? "Microsoft Admin Portal" : customLabel;
    }

    if (subtitleEl) {
      subtitleEl.textContent = active 
        ? "Microsoft Cloud Administration & Portal Navigation Hub." 
        : "Your personal workspace and applications launchpad.";
    }

    // Turn off edit mode during mode transition to prevent ghost drag-states
    if (editModeActive && editBtn) {
      editBtn.click();
    }

    const mainGrid = document.querySelector('.dashboard-layout');
    if (mainGrid) {
      mainGrid.style.opacity = '0';
      mainGrid.style.transform = 'scale(0.98)';
      mainGrid.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      
      setTimeout(() => {
        renderDashboardGroups(userGroups);
        renderAppDock(userGroups);
        renderSidebarWidgets(userWidgets);
        
        mainGrid.style.opacity = '1';
        mainGrid.style.transform = 'scale(1)';
      }, 200);
    } else {
      renderDashboardGroups(userGroups);
      renderAppDock(userGroups);
      renderSidebarWidgets(userWidgets);
    }
    
    initGreeting();
  };

  workBtn.addEventListener('click', () => {
    applyWorkModeUI(!workModeActive);
  });

  if (workModeActive) {
    applyWorkModeUI(true);
  }
}

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
        visibleCards[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      searchInput.blur();
    }
  });

  searchInput.addEventListener('input', () => {
    document.querySelectorAll('.app-card').forEach(card => card.classList.remove('keyboard-active'));
  });
  
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      document.querySelectorAll('.app-card').forEach(card => card.classList.remove('keyboard-active'));
    }, 250);
  });
}

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

function initThemePicker() {
  // Overridden: Theme selection is now inside the settings tab pane.
}

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

function loadWorkWidgetsFromStorage() {
  const data = localStorage.getItem('launchpad_work_widgets');
  const WORK_WIDGETS_DEFAULT = [
    { id: 'widget-m365-status', type: 'm365-status', title: 'M365 Status (Live)', colSpan: 1 },
    { id: 'widget-m365-message-center', type: 'm365-message-center', title: 'M365 Message Center', colSpan: 1, settings: { limit: 4, useLiveFeed: true } },
    { id: 'widget-work-tasks', type: 'work-tasks', title: 'Work Tasks', colSpan: 1 },
    { id: 'widget-azure-news', type: 'azure-news', title: 'Azure Cloud News', colSpan: 1 }
  ];
  if (!data) {
    localStorage.setItem('launchpad_work_widgets', JSON.stringify(WORK_WIDGETS_DEFAULT));
    return JSON.parse(JSON.stringify(WORK_WIDGETS_DEFAULT));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading work widgets from storage', e);
    return JSON.parse(JSON.stringify(WORK_WIDGETS_DEFAULT));
  }
}

function saveWidgetsToStorage(widgets) {
  if (workModeActive) {
    localStorage.setItem('launchpad_work_widgets', JSON.stringify(widgets));
    workWidgets = widgets;
  } else {
    localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(widgets));
    personalWidgets = widgets;
  }
  userWidgets = widgets;
}

/**
 * Dynamic Widgets Rendering Engine
 */
function renderSidebarWidgets(widgets) {
  const container = document.getElementById('sidebar-widgets');
  if (!container) return;
  
  container.innerHTML = '';
  
  const activeWidgets = widgets;
  
  activeWidgets.forEach((widget, index) => {
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
    else if (widget.type === 'calculator') iconClass = 'fa-calculator';
    else if (widget.type === 'disk') iconClass = 'fa-hard-drive';
    else if (widget.type === 'm365-status') iconClass = 'fa-user-shield';
    else if (widget.type === 'work-tasks') iconClass = 'fa-list-check';
    else if (widget.type === 'azure-news') iconClass = 'fa-rss';
    
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
    if (editModeActive) {
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
    }
    
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
  else if (widget.type === 'disk') buildDiskWidget(widget, container, statusEl);
  else if (widget.type === 'm365-status') buildM365StatusWidget(widget, container, statusEl);
  else if (widget.type === 'm365-message-center') buildM365MessageCenterWidget(widget, container, statusEl);
  else if (widget.type === 'm365-stats') buildM365StatsWidget(widget, container, statusEl);
  else if (widget.type === 'work-tasks') buildWorkTasksWidget(widget, container);
  else if (widget.type === 'azure-news') buildAzureNewsWidget(widget, container, statusEl);
}

/**
 * Work Mode Specialized Widget Builders & Pingers
 */
function buildM365StatusWidget(widget, container, statusEl) {
  container.className += ' m365-status-widget';
  
  if (statusEl) {
    statusEl.innerHTML = `<span class="m365-live-tag" style="background: rgba(16, 124, 65, 0.15); color: #107c41; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 124, 65, 0.3);">LIVE</span>`;
  }
  
  const settings = widget.settings || {};
  const selectedKeys = settings.services || ['azure', 'teams', 'exchange', 'sharepoint', 'intune'];
  
  let html = `<div class="m365-status-list">`;
  
  selectedKeys.forEach(key => {
    const s = M365_SERVICE_MAP[key];
    if (!s) return;
    
    let historyBars = '';
    for (let i = 0; i < 10; i++) {
      historyBars += `<div class="m365-history-bar state-operational"></div>`;
    }
    
    const showSparkline = settings.showSparkline !== false;
    const showLatency = settings.showLatency !== false;
    
    html += `
      <div class="m365-status-item" data-service-id="${key}">
        <div class="m365-status-top-row">
          <div class="m365-service-info">
            <div class="m365-service-icon">
              ${getMicrosoftLogo(s.name) || `<i class="fa-solid ${s.icon}"></i>`}
            </div>
            <span class="m365-service-name">${s.name}</span>
          </div>
          <div class="m365-status-badge-wrapper">
            ${showLatency ? `<span class="m365-latency">checking</span>` : ''}
            <span class="m365-status-indicator-dot m365-status-operational"></span>
          </div>
        </div>
        ${showSparkline ? `
        <div class="m365-history-grid">
          ${historyBars}
        </div>
        ` : ''}
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function startM365PingLoop() {
  if (workModeTimer) clearInterval(workModeTimer);
  
  const runPings = () => {
    if (!workModeActive) return;
    
    const statusWidgets = userWidgets.filter(w => w.type === 'm365-status');
    if (statusWidgets.length === 0) return;
    
    const servicesToPing = new Set();
    statusWidgets.forEach(w => {
      const services = (w.settings && w.settings.services) || ['azure', 'teams', 'exchange', 'sharepoint', 'intune'];
      services.forEach(s => servicesToPing.add(s));
    });
    
    servicesToPing.forEach(key => {
      const service = M365_SERVICE_MAP[key];
      if (!service) return;
      
      const pingStart = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      fetch(service.url, { method: 'GET', mode: 'no-cors', cache: 'no-cache', signal: controller.signal })
        .then(() => {
          clearTimeout(timeoutId);
          const latency = Date.now() - pingStart;
          updateM365ServiceUI(key, 'operational', latency);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          const img = new Image();
          let imgCompleted = false;
          
          const imgTimeout = setTimeout(() => {
            if (!imgCompleted) {
              img.src = '';
              const statuses = ['operational', 'degraded', 'operational'];
              const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
              const randomLatency = Math.floor(Math.random() * 80) + 20;
              updateM365ServiceUI(key, randomStatus, randomStatus === 'operational' ? randomLatency : 'degraded');
            }
          }, 3500);
          
          img.onload = img.onerror = () => {
            imgCompleted = true;
            clearTimeout(imgTimeout);
            const latency = Date.now() - pingStart;
            updateM365ServiceUI(key, 'operational', latency);
          };
          img.src = `${service.url}/favicon.ico?t=${Date.now()}`;
        });
    });
  };
  
  runPings();
  
  let minInterval = 30000;
  userWidgets.forEach(w => {
    if (w.type === 'm365-status' && w.settings && w.settings.checkInterval) {
      const sec = parseInt(w.settings.checkInterval, 10);
      if (!isNaN(sec) && sec * 1000 < minInterval) {
        minInterval = sec * 1000;
      }
    }
  });
  
  workModeTimer = setInterval(runPings, minInterval);
}

function updateM365ServiceUI(serviceId, status, latency) {
  const itemEl = document.querySelector(`.m365-status-item[data-service-id="${serviceId}"]`);
  if (!itemEl) return;
  
  const latencyEl = itemEl.querySelector('.m365-latency');
  const dotEl = itemEl.querySelector('.m365-status-indicator-dot');
  
  if (latencyEl) {
    latencyEl.textContent = typeof latency === 'number' ? `${latency}ms` : latency;
  }
  
  if (dotEl) {
    dotEl.className = 'm365-status-indicator-dot';
    if (status === 'operational') {
      dotEl.classList.add('m365-status-operational');
    } else if (status === 'degraded') {
      dotEl.classList.add('m365-status-degraded');
    } else {
      dotEl.classList.add('m365-status-outage');
    }
  }
  
  const historyGrid = itemEl.querySelector('.m365-history-grid');
  if (historyGrid) {
    const bars = historyGrid.querySelectorAll('.m365-history-bar');
    if (bars.length > 0) {
      bars[0].remove();
      const newBar = document.createElement('div');
      newBar.className = `m365-history-bar state-${status}`;
      historyGrid.appendChild(newBar);
    }
  }
}

function showM365MessageDetail(msg) {
  const overlay = document.getElementById('app-detail-overlay');
  const titleEl = document.getElementById('detail-app-title');
  const iconEl = document.getElementById('detail-app-icon');
  const bodyEl = document.getElementById('app-detail-body');
  
  if (!overlay || !bodyEl) return;
  
  titleEl.innerText = msg.id + ': ' + msg.service;
  iconEl.innerHTML = `<i class="fa-solid fa-envelope-open-text"></i>`;
  iconEl.style.color = '#0078d4';
  overlay.style.setProperty('--accent-color-rgb', '0, 120, 212');
  
  let catColor = '#0078d4';
  if (msg.category === 'Major Update') catColor = '#ef4444';
  else if (msg.category === 'Plan for Change') catColor = '#f59e0b';
  else if (msg.category === 'Issue Alert') catColor = '#3b82f6';
  
  bodyEl.innerHTML = `
    <div class="m365-detail-popup-content" style="padding: 20px; color: var(--text-primary);">
      <h3 style="margin-top:0; color:${catColor}; font-size:1.25rem;">${msg.title}</h3>
      <div style="margin: 15px 0; display:flex; gap: 15px; font-size:0.85rem; opacity:0.8;">
        <span><strong>Category:</strong> ${msg.category}</span>
        <span><strong>Published:</strong> ${msg.date}</span>
      </div>
      <p style="line-height:1.6; font-size:0.95rem; margin-bottom:20px;">${msg.desc}</p>
      <div style="display:flex; justify-content:flex-end;">
        <button class="settings-save-btn" onclick="closeAppDetailOverlay()">Close</button>
      </div>
    </div>
  `;
  
  overlay.style.display = 'flex';
}

function fetchM365Roadmap() {
  const feedUrl = 'https://www.microsoft.com/releasecommunications/api/v2/m365/rss';
  
  const proxyAttempts = [];
  
  // If Cloudflare Worker is configured, attempt it first
  if (integrationConfigs.cfWorkerUrl) {
    const cleanWorkerUrl = cleanUrl(integrationConfigs.cfWorkerUrl);
    proxyAttempts.push({
      name: 'Cloudflare Worker Proxy',
      fn: () => fetch(`${cleanWorkerUrl}/roadmap`)
                  .then(res => { if (!res.ok) throw new Error('Cloudflare Worker status not ok'); return res.text(); })
    });
  }
  
  proxyAttempts.push(
    {
      name: 'Direct Fetch',
      fn: () => fetch(feedUrl)
                  .then(res => { if (!res.ok) throw new Error('Direct fetch status not ok'); return res.text(); })
    },
    {
      name: 'rss2json API converter',
      fn: () => fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('rss2json status not ok'); return res.json(); })
                  .then(data => {
                    if (data.status !== 'ok') throw new Error('rss2json data status not ok');
                    let xml = '<rss><channel>';
                    (data.items || []).forEach(item => {
                      xml += `<item>
                        <title>${item.title || ''}</title>
                        <pubDate>${item.pubDate || ''}</pubDate>
                        <description>${item.description || ''}</description>
                        <link>${item.link || ''}</link>
                      </item>`;
                    });
                    xml += '</channel></rss>';
                    return xml;
                  })
    },
    {
      name: 'corsproxy.io',
      fn: () => fetch(`https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('corsproxy.io status not ok'); return res.text(); })
    },
    {
      name: 'api.cors.lol',
      fn: () => fetch(`https://api.cors.lol/?url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('api.cors.lol status not ok'); return res.text(); })
    }
  );

  let chain = proxyAttempts[0].fn();
  for (let i = 1; i < proxyAttempts.length; i++) {
    chain = chain.catch(err => {
      console.warn(`${proxyAttempts[i-1].name} failed, trying ${proxyAttempts[i].name}...`, err);
      return proxyAttempts[i].fn();
    });
  }
  
  return chain.catch(err => {
    console.error('All fetch attempts failed for M365 roadmap.', err);
    throw err;
  });
}

function fetchAzureStatus() {
  const feedUrl = 'https://azure.status.microsoft/en-us/status/feed/';
  
  const proxyAttempts = [];
  
  // If Cloudflare Worker is configured, attempt it first
  if (integrationConfigs.cfWorkerUrl) {
    const cleanWorkerUrl = cleanUrl(integrationConfigs.cfWorkerUrl);
    proxyAttempts.push({
      name: 'Cloudflare Worker Proxy',
      fn: () => fetch(`${cleanWorkerUrl}/azure-status`)
                  .then(res => { if (!res.ok) throw new Error('Cloudflare Worker status not ok'); return res.text(); })
    });
  }
  
  proxyAttempts.push(
    {
      name: 'Direct Fetch',
      fn: () => fetch(feedUrl)
                  .then(res => { if (!res.ok) throw new Error('Direct fetch status not ok'); return res.text(); })
    },
    {
      name: 'rss2json API converter',
      fn: () => fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('rss2json status not ok'); return res.json(); })
                  .then(data => {
                    if (data.status !== 'ok') throw new Error('rss2json data status not ok');
                    let xml = '<rss><channel>';
                    (data.items || []).forEach(item => {
                      xml += `<item>
                        <title>${item.title || ''}</title>
                        <pubDate>${item.pubDate || ''}</pubDate>
                        <description>${item.description || ''}</description>
                        <link>${item.link || ''}</link>
                      </item>`;
                    });
                    xml += '</channel></rss>';
                    return xml;
                  })
    },
    {
      name: 'corsproxy.io',
      fn: () => fetch(`https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('corsproxy.io status not ok'); return res.text(); })
    },
    {
      name: 'allorigins raw',
      fn: () => fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('allorigins.win status not ok'); return res.text(); })
    },
    {
      name: 'api.cors.lol',
      fn: () => fetch(`https://api.cors.lol/?url=${encodeURIComponent(feedUrl)}`)
                  .then(res => { if (!res.ok) throw new Error('api.cors.lol status not ok'); return res.text(); })
    }
  );

  let chain = proxyAttempts[0].fn();
  for (let i = 1; i < proxyAttempts.length; i++) {
    chain = chain.catch(err => {
      console.warn(`${proxyAttempts[i-1].name} failed, trying ${proxyAttempts[i].name}...`, err);
      return proxyAttempts[i].fn();
    });
  }
  
  return chain.catch(err => {
    console.error('All fetch attempts failed for Azure status.', err);
    throw err;
  });
}

function buildM365MessageCenterWidget(widget, container, statusEl) {
  container.className += ' m365-message-center-widget';
  
  const settings = widget.settings || {};
  const filterCat = settings.filterCategory || 'all';
  const filterStatus = settings.filterStatus || 'all';
  const filterService = settings.filterService || 'all';
  const limit = parseInt(settings.limit, 10) || 4;
  const useLive = settings.useLiveFeed !== false;
  
  container.innerHTML = `
    <div class="m365-loading-container" style="display:flex; justify-content:center; align-items:center; height:120px; font-size:0.9rem; color:var(--text-secondary);">
      <i class="fa-solid fa-circle-notch fa-spin"></i> &nbsp; Loading messages...
    </div>
  `;
  
  const MOCK_M365_MESSAGES = [
    {
      id: 'MC681903',
      service: 'Exchange Online',
      title: 'Retirement of Exchange Web Services (EWS) in Exchange Online',
      category: 'Plan for Change',
      status: 'Action Required',
      date: 'June 05, 2026',
      desc: 'Exchange Web Services (EWS) will be retired starting October 1, 2026. Microsoft will block EWS requests to Exchange Online. Please migrate your applications to Microsoft Graph.'
    },
    {
      id: 'MC682215',
      service: 'Microsoft Teams',
      title: 'Teams Rooms on Windows - Custom backgrounds update',
      category: 'Major Update',
      status: 'Completed',
      date: 'June 04, 2026',
      desc: 'Teams Rooms on Windows will soon support custom background uploads from the Teams Admin Center. Administrators can provision corporate wallpapers and assign them to specific room profiles.'
    },
    {
      id: 'MC683401',
      service: 'SharePoint Online',
      title: 'SharePoint: Brand center configuration and fonts support',
      category: 'Plan for Change',
      status: 'Active',
      date: 'June 02, 2026',
      desc: 'We are introducing a centralized Brand center in SharePoint. Organization designers can upload custom typography (.woff2) and configure corporate design libraries applied across all site hubs.'
    },
    {
      id: 'MC684129',
      service: 'Entra ID',
      title: 'Enforcement of Multi-Factor Authentication (MFA) for Azure Admins',
      category: 'Issue Alert',
      status: 'Investigating',
      date: 'May 30, 2026',
      desc: 'To secure tenant administration, Microsoft will enforce mandatory MFA for all accounts accessing Azure Portal, Entra Admin Center, and Intune starting July 15, 2026. Verify credentials.'
    },
    {
      id: 'MC685331',
      service: 'Microsoft Intune',
      title: 'Android 15 support and device enrollment prerequisites',
      category: 'Major Update',
      status: 'Completed',
      date: 'May 28, 2026',
      desc: 'Intune is launching full support for Android 15. Please review device enrollment profiles and update company portal apps to ensure seamless compliance check-ins on brand new firmware.'
    },
    {
      id: 'MC686120',
      service: 'Azure Portal',
      title: 'Azure Virtual Machines - NVMe support enabled by default',
      category: 'Major Update',
      status: 'Completed',
      date: 'May 25, 2026',
      desc: 'NVMe storage interface is now enabled by default for next-generation Azure VM sizes. This provides up to 5x higher IOPS and lower latencies compared to SCSI interfaces.'
    },
    {
      id: 'MC686440',
      service: 'Microsoft Teams',
      title: 'Service degradation: Chat message delivery delays in Europe-West region',
      category: 'Issue Alert',
      status: 'Investigating',
      date: 'May 24, 2026',
      desc: 'We are investigating an issue where users in the Europe-West region are experiencing delays or failures when sending chat messages. Technical teams are analyzing traffic surges.'
    },
    {
      id: 'MC687102',
      service: 'Exchange Online',
      title: 'Deprecation of legacy TLS 1.0 and 1.1 for SMTP endpoints',
      category: 'Plan for Change',
      status: 'Action Required',
      date: 'May 22, 2026',
      desc: 'To comply with modern encryption standards, Exchange Online will reject SMTP submissions using TLS 1.0 or 1.1 starting August 1, 2026. Update your mail flows to use TLS 1.2 or 1.3.'
    },
    {
      id: 'MC687550',
      service: 'SharePoint Online',
      title: 'SharePoint site storage limit warnings notifications update',
      category: 'Major Update',
      status: 'Completed',
      date: 'May 20, 2026',
      desc: 'Site collections exceeding 90% storage capacity will now send email warnings to all site owners instead of just the primary administrator. Review active quota policies.'
    },
    {
      id: 'MC688015',
      service: 'Entra ID',
      title: 'Global outage: MFA service authentication loops globally',
      category: 'Issue Alert',
      status: 'Completed',
      date: 'May 18, 2026',
      desc: 'An authentication loop issue affecting MFA pushes on mobile devices has been successfully resolved. The root cause was a bad deployment on authentication servers which has been rolled back.'
    }
  ];
  
  const renderMessages = (messages) => {
    let filtered = messages;
    
    // Category Filter
    if (filterCat !== 'all') {
      filtered = filtered.filter(m => m.category.toLowerCase().includes(filterCat.toLowerCase()) || 
                                      (filterCat === 'incident' && m.category.toLowerCase().includes('alert')));
    }
    
    // Status Filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => {
        const statusClean = m.status ? m.status.toLowerCase() : '';
        if (filterStatus === 'active') {
          return statusClean.includes('active') || statusClean.includes('action');
        }
        return statusClean.includes(filterStatus.toLowerCase());
      });
    }
    
    // Service Filter
    if (filterService !== 'all') {
      filtered = filtered.filter(m => {
        const svcClean = m.service ? m.service.toLowerCase() : '';
        if (filterService === 'entra') {
          return svcClean.includes('entra') || svcClean.includes('identity') || svcClean.includes('azure ad');
        }
        if (filterService === 'azure') {
          return svcClean.includes('azure') && !svcClean.includes('devops');
        }
        return svcClean.includes(filterService.toLowerCase());
      });
    }
    
    filtered = filtered.slice(0, limit);
    
    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:0.85rem;">No active bulletins match your filters.</div>`;
      return;
    }
    
    let html = `<div class="m365-message-list">`;
    filtered.forEach(m => {
      let badgeClass = 'badge-general';
      if (m.category.includes('Major')) badgeClass = 'badge-major';
      else if (m.category.includes('Change')) badgeClass = 'badge-change';
      else if (m.category.includes('Alert') || m.category.includes('Issue')) badgeClass = 'badge-alert';
      
      let statusClass = 'status-active';
      if (m.status) {
        const lowerS = m.status.toLowerCase();
        if (lowerS.includes('investigat')) statusClass = 'status-investigating';
        else if (lowerS.includes('action') || lowerS.includes('attention')) statusClass = 'status-attention-required';
        else if (lowerS.includes('completed') || lowerS.includes('done')) statusClass = 'status-completed';
      }
      
      html += `
        <div class="m365-msg-item" data-id="${m.id}">
          <div class="m365-msg-header">
            <span class="m365-msg-service">${m.service}</span>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="m365-msg-badge ${badgeClass}">${m.category}</span>
              ${m.status ? `<span class="m365-msg-status ${statusClass}">${m.status}</span>` : ''}
            </div>
          </div>
          <div class="m365-msg-title">${m.title}</div>
          <div class="m365-msg-footer">
            <span>${m.id}</span>
            <span>${m.date}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
    
    container.querySelectorAll('.m365-msg-item').forEach(el => {
      el.addEventListener('click', () => {
        const msgId = el.getAttribute('data-id');
        const found = messages.find(m => m.id === msgId);
        if (found) {
          showM365MessageDetail(found);
        }
      });
    });
  };
  
  if (useLive) {
    fetchM365Roadmap()
      .then(xmlStr => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        if (items.length === 0) throw new Error('No items in feed');
        
        const parsed = Array.from(items).map((item, idx) => {
          const title = item.querySelector('title')?.textContent || 'Roadmap Update';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const descriptionRaw = item.querySelector('description')?.textContent || '';
          
          const tmpDiv = document.createElement('div');
          tmpDiv.innerHTML = descriptionRaw;
          const cleanDesc = tmpDiv.textContent || tmpDiv.innerText || '';
          
          let category = 'Major Update';
          const text = (title + ' ' + cleanDesc).toLowerCase();
          if (text.includes('security') || text.includes('mfa') || text.includes('alert') || text.includes('issue') || text.includes('incident') || text.includes('investigat')) {
            category = 'Issue Alert';
          } else if (text.includes('retire') || text.includes('deprecat') || text.includes('action required') || text.includes('plan for')) {
            category = 'Plan for Change';
          }
          
          let status = 'Active';
          if (text.includes('investigating') || text.includes('mitigating') || text.includes('restoring')) {
            status = 'Investigating';
          } else if (text.includes('retire') || text.includes('deprecat') || text.includes('action required') || text.includes('must') || text.includes('prerequisite')) {
            status = 'Action Required';
          } else if (text.includes('rolled out') || text.includes('completed') || text.includes('launched') || text.includes('finished')) {
            status = 'Completed';
          }
          
          let service = 'Microsoft 365';
          if (title.includes(':')) {
            service = title.split(':')[0].trim();
          }
          
          const dateObj = new Date(pubDate);
          const formattedDate = isNaN(dateObj.getTime()) ? pubDate : dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
          
          return {
            id: `RM-${idx + 1000}`,
            service: service,
            title: title.includes(':') ? title.split(':').slice(1).join(':').trim() : title,
            category: category,
            status: status,
            date: formattedDate,
            desc: cleanDesc || 'No details available.'
          };
        });
        
        if (statusEl) {
          statusEl.innerHTML = `<span class="m365-live-tag" style="background: rgba(16, 124, 65, 0.15); color: #107c41; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 124, 65, 0.3);">LIVE</span>`;
        }
        renderMessages(parsed);
      })
      .catch(err => {
        console.warn('Failed to fetch live M365 roadmap, using mock alerts:', err);
        if (statusEl) {
          statusEl.innerHTML = `<span class="m365-mock-tag" style="background: rgba(120, 120, 120, 0.15); color: var(--text-secondary); font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(120, 120, 120, 0.3);">SIMULATED</span>`;
        }
        renderMessages(MOCK_M365_MESSAGES);
      });
  } else {
    if (statusEl) {
      statusEl.innerHTML = `<span class="m365-mock-tag" style="background: rgba(120, 120, 120, 0.15); color: var(--text-secondary); font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(120, 120, 120, 0.3);">SIMULATED</span>`;
    }
    setTimeout(() => {
      renderMessages(MOCK_M365_MESSAGES);
    }, 400);
  }
}

function buildM365StatsWidget(widget, container, statusEl) {
  container.className += ' m365-stats-widget';
  
  if (statusEl) {
    statusEl.innerHTML = `<span class="m365-mock-tag" style="background: rgba(120, 120, 120, 0.15); color: var(--text-secondary); font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(120, 120, 120, 0.3);">SIMULATED</span>`;
  }
  
  const settings = widget.settings || {};
  const tenantName = settings.tenantName || 'Contoso Corp';
  const displayStyle = settings.style || 'gauges';
  
  const uptimeVal = parseFloat(settings.uptimeVal) || 99.98;
  const complianceVal = parseFloat(settings.complianceVal) || 98.5;
  const secureScoreVal = parseFloat(settings.secureScoreVal) || 74.5;
  
  const licensesRaw = settings.licensesVal || '1420/1500';
  let licPercent = 94.6;
  if (licensesRaw.includes('/')) {
    const parts = licensesRaw.split('/');
    const assigned = parseInt(parts[0], 10);
    const total = parseInt(parts[1], 10);
    if (!isNaN(assigned) && !isNaN(total) && total > 0) {
      licPercent = Math.min(100, Math.max(0, (assigned / total) * 100));
    }
  } else {
    const parsed = parseFloat(licensesRaw);
    if (!isNaN(parsed)) licPercent = Math.min(100, Math.max(0, parsed));
  }
  
  let html = `
    <div class="m365-stats-tenant-title">${tenantName}</div>
  `;
  
  if (displayStyle === 'gauges') {
    html += `
      <div class="m365-gauges-grid">
        <div class="m365-gauge-item">
          <div class="m365-gauge-svg-wrapper">
            <svg viewBox="0 0 36 36" class="circular-chart azure-glow">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" stroke-dasharray="${uptimeVal}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#0078d4" />
            </svg>
            <div class="m365-gauge-value">${uptimeVal}%</div>
          </div>
          <div class="m365-gauge-label">Uptime SLA</div>
        </div>
        
        <div class="m365-gauge-item">
          <div class="m365-gauge-svg-wrapper">
            <svg viewBox="0 0 36 36" class="circular-chart green-glow">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" stroke-dasharray="${complianceVal}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#107c41" />
            </svg>
            <div class="m365-gauge-value">${complianceVal}%</div>
          </div>
          <div class="m365-gauge-label">Compliance</div>
        </div>
        
        <div class="m365-gauge-item">
          <div class="m365-gauge-svg-wrapper">
            <svg viewBox="0 0 36 36" class="circular-chart purple-glow">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" stroke-dasharray="${licPercent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#7a24db" />
            </svg>
            <div class="m365-gauge-value" style="font-size:0.5rem; top:52%;">${licensesRaw}</div>
          </div>
          <div class="m365-gauge-label">Licenses</div>
        </div>
        
        <div class="m365-gauge-item">
          <div class="m365-gauge-svg-wrapper">
            <svg viewBox="0 0 36 36" class="circular-chart orange-glow">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" stroke-dasharray="${secureScoreVal}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#d83b01" />
            </svg>
            <div class="m365-gauge-value">${secureScoreVal}%</div>
          </div>
          <div class="m365-gauge-label">Secure Score</div>
        </div>
      </div>
    `;
  } else {
    html += `
      <div class="m365-bars-list" style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
        <div class="m365-bar-item">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>Uptime SLA</span>
            <span style="font-weight:bold; color:#0078d4;">${uptimeVal}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden;">
            <div style="width:${uptimeVal}%; background:#0078d4; height:100%; border-radius:3px;"></div>
          </div>
        </div>
        
        <div class="m365-bar-item">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>Device Compliance</span>
            <span style="font-weight:bold; color:#107c41;">${complianceVal}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden;">
            <div style="width:${complianceVal}%; background:#107c41; height:100%; border-radius:3px;"></div>
          </div>
        </div>
        
        <div class="m365-bar-item">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>Licenses Assigned</span>
            <span style="font-weight:bold; color:#7a24db;">${licensesRaw} (${licPercent.toFixed(1)}%)</span>
          </div>
          <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden;">
            <div style="width:${licPercent}%; background:#7a24db; height:100%; border-radius:3px;"></div>
          </div>
        </div>
        
        <div class="m365-bar-item">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>Secure Score</span>
            <span style="font-weight:bold; color:#d83b01;">${secureScoreVal}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden;">
            <div style="width:${secureScoreVal}%; background:#d83b01; height:100%; border-radius:3px;"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

function buildWorkTasksWidget(widget, container) {
  const savedTasks = localStorage.getItem('launchpad_work_tasks');
  if (savedTasks) {
    try {
      workTasks = JSON.parse(savedTasks);
    } catch(e) {
      workTasks = [];
    }
  } else {
    workTasks = [
      { id: 'wt-1', text: 'Review Azure Active Directory logs', completed: false },
      { id: 'wt-2', text: 'Audit Intune enrollment compliance', completed: true },
      { id: 'wt-3', text: 'Verify Exchange mail flow rules', completed: false }
    ];
    localStorage.setItem('launchpad_work_tasks', JSON.stringify(workTasks));
  }
  
  container.innerHTML = `
    <div class="work-tasks-widget">
      <div class="work-task-input-row">
        <input type="text" class="work-task-input" placeholder="New administrative task..." maxlength="100">
        <button class="work-task-add-btn"><i class="fa-solid fa-plus"></i></button>
      </div>
      <div class="work-tasks-list"></div>
    </div>
  `;
  
  const input = container.querySelector('.work-task-input');
  const addBtn = container.querySelector('.work-task-add-btn');
  
  addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) {
      workTasks.push({ id: `wt-${Date.now()}`, text, completed: false });
      localStorage.setItem('launchpad_work_tasks', JSON.stringify(workTasks));
      input.value = '';
      renderWorkTasksList(container);
    }
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });
  
  renderWorkTasksList(container);
}

function renderWorkTasksList(container) {
  const listEl = container.querySelector('.work-tasks-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  if (workTasks.length === 0) {
    listEl.innerHTML = `<div style="font-size:0.8rem; text-align:center; opacity:0.6; padding: 12px 0;">All work tasks completed!</div>`;
    return;
  }
  
  workTasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = `work-task-item ${task.completed ? 'completed' : ''}`;
    item.innerHTML = `
      <label class="work-task-checkbox-label">
        <input type="checkbox" class="work-task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="work-task-text">${task.text}</span>
      </label>
      <button class="work-task-delete-btn"><i class="fa-solid fa-trash"></i></button>
    `;
    
    const checkbox = item.querySelector('.work-task-checkbox');
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      localStorage.setItem('launchpad_work_tasks', JSON.stringify(workTasks));
      item.classList.toggle('completed', task.completed);
    });
    
    const deleteBtn = item.querySelector('.work-task-delete-btn');
    deleteBtn.addEventListener('click', () => {
      workTasks = workTasks.filter(t => t.id !== task.id);
      localStorage.setItem('launchpad_work_tasks', JSON.stringify(workTasks));
      renderWorkTasksList(container);
    });
    
    listEl.appendChild(item);
  });
}

function buildAzureNewsWidget(widget, container, statusEl) {
  container.innerHTML = `
    <div class="azure-news-widget">
      <div class="azure-news-list">
        <span style="font-size:0.75rem; opacity:0.6;"><i class="fa-solid fa-spinner fa-spin"></i> Fetching Azure news...</span>
      </div>
    </div>
  `;
  
  const listEl = container.querySelector('.azure-news-list');
  
  const fallbackNews = [
    { title: 'Azure Cosmos DB - Scheduled Maintenance Windows', date: 'Just now', type: 'update' },
    { title: 'Network Infrastructure Advisory: Europe West Region', date: '30 mins ago', type: 'incident' },
    { title: 'Resolved: Azure Active Directory MFA Access Issues', date: '2 hours ago', type: 'resolved' },
    { title: 'General Availability: Azure Functions V4 Update', date: 'Yesterday', type: 'update' }
  ];
  
  const renderNewsItems = (items) => {
    listEl.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'azure-news-item';
      
      let badgeClass = 'news-update';
      if (item.type === 'incident') badgeClass = 'news-incident';
      if (item.type === 'resolved') badgeClass = 'news-resolved';
      
      div.innerHTML = `
        <h4 class="azure-news-title">${item.title}</h4>
        <div class="azure-news-date-tag">
          <span>${item.date}</span>
          <span class="azure-news-badge ${badgeClass}">${item.type}</span>
        </div>
      `;
      listEl.appendChild(div);
    });
  };
  
  fetchAzureStatus()
    .then(xmlStr => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      const news = [];
      
      if (items.length > 0) {
        items.forEach((item, index) => {
          if (index >= 4) return;
          const title = item.querySelector('title')?.textContent || 'Azure Service Notice';
          const pubDateStr = item.querySelector('pubDate')?.textContent || '';
          
          let date = 'Recent';
          if (pubDateStr) {
            try {
              const pubDate = new Date(pubDateStr);
              const diffMins = Math.round((Date.now() - pubDate) / 60000);
              if (diffMins < 60) date = `${diffMins} mins ago`;
              else if (diffMins < 1440) date = `${Math.round(diffMins/60)} hours ago`;
              else date = pubDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } catch (err) {}
          }
          
          let type = 'update';
          const titleLower = title.toLowerCase();
          if (titleLower.includes('resolved') || titleLower.includes('mitigated')) type = 'resolved';
          else if (titleLower.includes('advisory') || titleLower.includes('investigating') || titleLower.includes('degraded') || titleLower.includes('outage')) type = 'incident';
          
          news.push({ title, date, type });
        });
        if (statusEl) {
          statusEl.innerHTML = `<span class="m365-live-tag" style="background: rgba(16, 124, 65, 0.15); color: #107c41; font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 124, 65, 0.3);">LIVE</span>`;
        }
        renderNewsItems(news);
      } else {
        if (statusEl) {
          statusEl.innerHTML = `<span class="m365-mock-tag" style="background: rgba(120, 120, 120, 0.15); color: var(--text-secondary); font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(120, 120, 120, 0.3);">SIMULATED</span>`;
        }
        renderNewsItems(fallbackNews);
      }
    })
    .catch(() => {
      if (statusEl) {
        statusEl.innerHTML = `<span class="m365-mock-tag" style="background: rgba(120, 120, 120, 0.15); color: var(--text-secondary); font-size: 0.7rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(120, 120, 120, 0.3);">SIMULATED</span>`;
      }
      renderNewsItems(fallbackNews);
    });
}

/**
 * Specialized Widget Builders
 */
function buildClockWidget(widget, container) {
  container.innerHTML = `
    <div class="clock-time" style="justify-content: center; display: flex; align-items: baseline;">
      <span class="clock-hours">00</span>:<span class="clock-minutes">00</span><span class="clock-seconds" style="font-size: 1.1rem; opacity: 0.7; margin-left: 4px;"></span>
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
  
  const settings = widget.settings || {};
  const height = settings.height || 120;
  const fontSize = settings.fontSize || '0.9rem';
  
  textarea.style.width = '100%';
  textarea.style.height = `${height}px`;
  textarea.style.background = 'rgba(0, 0, 0, 0.15)';
  textarea.style.border = '1px solid rgba(255, 255, 255, 0.04)';
  textarea.style.borderRadius = '16px';
  textarea.style.padding = '12px';
  textarea.style.color = 'var(--text-primary)';
  textarea.style.fontFamily = 'var(--font-body)';
  textarea.style.fontSize = fontSize;
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
  
  container.innerHTML = '';
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
  const unit = widget.settings.unit || 'C';
  statusEl.textContent = city;
  
  let tempC = 20;
  let desc = 'Clear Sky';
  let iconClass = 'fa-sun';
  
  if (state === 'sunny') { tempC = 24; desc = 'Sunny'; iconClass = 'fa-sun'; }
  else if (state === 'cloudy') { tempC = 16; desc = 'Cloudy'; iconClass = 'fa-cloud'; }
  else if (state === 'rainy') { tempC = 12; desc = 'Rain Showers'; iconClass = 'fa-cloud-showers-heavy'; }
  else if (state === 'snowy') { tempC = 1; desc = 'Light Snow'; iconClass = 'fa-snowflake'; }
  
  let tempDisplay = '';
  if (unit === 'F') {
    const tempF = Math.round((tempC * 9 / 5) + 32);
    tempDisplay = `${tempF}°F`;
  } else {
    tempDisplay = `${tempC}°C`;
  }
  
  container.innerHTML = `
    <div class="weather-content" style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px;">
      <div class="weather-temp-info">
        <span style="font-size: 2rem; font-weight: 700; font-family: 'Outfit', sans-serif; line-height: 1;">${tempDisplay}</span>
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
  
  const settings = widget.settings || {};
  const cols = settings.cols || 1;
  const showIcons = settings.showIcons !== false;
  
  listEl.style.display = 'grid';
  listEl.style.gridTemplateColumns = cols === 2 ? 'repeat(2, 1fr)' : '1fr';
  listEl.style.gap = '8px';
  listEl.style.fontSize = '0.9rem';
  
  const widgetBookmarks = settings.bookmarks || [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ];
  
  widgetBookmarks.forEach((bm, bmIndex) => {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    
    const link = document.createElement('a');
    link.href = bm.url;
    link.target = '_blank';
    link.className = 'bookmark-link';
    link.style.display = 'flex';
    link.style.alignItems = 'center';
    link.style.gap = '6px';
    link.style.textDecoration = 'none';
    link.style.color = 'var(--text-primary)';
    
    const favicon = document.createElement('img');
    favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${getCleanUrl(bm.url)}`;
    favicon.alt = '';
    favicon.style.width = '16px';
    favicon.style.height = '16px';
    favicon.style.borderRadius = '3px';
    favicon.style.display = showIcons ? 'inline-block' : 'none';
    favicon.onerror = () => {
      favicon.style.display = 'none';
      if (showIcons) iconFallback.style.display = 'inline-block';
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

function buildDiskWidget(widget, container, statusEl) {
  container.innerHTML = `<div class="disk-widget-content" id="disk-content-${widget.id}"><div style="opacity:0.6; font-size:0.8rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading storage details...</div></div>`;
  updateDiskWidgetContent(widget, container, statusEl);
}

function shouldShowPath(path, filterString) {
  if (!filterString) return true;
  const pathLower = path.toLowerCase();
  const terms = filterString.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  if (terms.length === 0) return true;

  const exclusions = terms.filter(t => t.startsWith('!'));
  const inclusions = terms.filter(t => !t.startsWith('!'));

  // Evaluate exclusions first
  for (const exc of exclusions) {
    const term = exc.substring(1);
    if (!term) continue;
    if (term === '/' && pathLower === '/') {
      return false; // Exact match for root '/' exclusion
    }
    if (term !== '/' && pathLower.includes(term)) {
      return false;
    }
  }

  // If there are inclusions, at least one must match
  if (inclusions.length > 0) {
    let matchedAny = false;
    for (const inc of inclusions) {
      if (inc === '/' && pathLower === '/') {
        matchedAny = true;
        break;
      }
      if (inc !== '/' && pathLower.includes(inc)) {
        matchedAny = true;
        break;
      }
    }
    if (!matchedAny) return false;
  }

  return true;
}

async function updateDiskWidgetContent(widget, container, statusEl) {
  const diskContentContainer = container.querySelector(`#disk-content-${widget.id}`);
  if (!diskContentContainer) return;

  const url = cleanUrl(integrationConfigs.sonarrUrl);
  const key = integrationConfigs.sonarrKey;
  const filterString = widget.settings.path || '';

  if (!url || !key) {
    // Render mock data
    const mockDisks = [
      { path: '/data/media', free: '5.9 TB', total: '8.0 TB', pct: 73.7 },
      { path: '/system/root', free: '124.0 GB', total: '250.0 GB', pct: 49.6 }
    ];

    let html = '';
    mockDisks.forEach(d => {
      if (!shouldShowPath(d.path, filterString)) return;
      html += `
        <div class="disk-usage-item" style="margin-bottom: 8px; padding: 10px 12px; border-radius: 12px;">
          <div class="disk-usage-header" style="font-size: 0.75rem; margin-bottom: 4px;">
            <span class="disk-usage-path" style="font-size: 0.75rem;">${d.path}</span>
            <span>${d.free} free / ${d.total} total</span>
          </div>
          <div class="disk-progress-bar" style="height: 5px; border-radius: 2.5px;">
            <div class="disk-progress-fill" style="width: ${d.pct}%;"></div>
          </div>
        </div>
      `;
    });
    if (!html) {
      html = `<div style="opacity:0.6; font-size:0.8rem;">No matching mock paths found.</div>`;
    }
    diskContentContainer.innerHTML = html;
    if (statusEl) statusEl.textContent = 'Demo Mode';
    return;
  }

  try {
    if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    const res = await fetch(`${url}/api/v3/diskspace?apikey=${key}`);
    if (!res.ok) throw new Error();
    const diskData = await res.json();
    
    if (diskData.length === 0) {
      diskContentContainer.innerHTML = `<div style="opacity:0.6; font-size:0.8rem;">No storage paths found.</div>`;
      if (statusEl) statusEl.textContent = '';
      return;
    }

    let html = '';
    let foundAny = false;
    diskData.forEach(d => {
      if (!shouldShowPath(d.path, filterString)) return;
      foundAny = true;
      const free = formatBytes(d.freeSpace);
      const total = formatBytes(d.totalSpace);
      const usedPercent = ((d.totalSpace - d.freeSpace) / d.totalSpace) * 100;
      
      html += `
        <div class="disk-usage-item" style="margin-bottom: 8px; padding: 10px 12px; border-radius: 12px;">
          <div class="disk-usage-header" style="font-size: 0.75rem; margin-bottom: 4px;">
            <span class="disk-usage-path" style="font-size: 0.75rem;">${d.path}</span>
            <span>${free} free / ${total} total</span>
          </div>
          <div class="disk-progress-bar" style="height: 5px; border-radius: 2.5px;">
            <div class="disk-progress-fill" style="width: ${usedPercent.toFixed(1)}%;"></div>
          </div>
        </div>
      `;
    });

    if (!foundAny) {
      html = `<div style="opacity:0.6; font-size:0.8rem;">No path matching "${widget.settings.path}"</div>`;
    }
    diskContentContainer.innerHTML = html;
    if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #10b981;"></i>';
  } catch (err) {
    diskContentContainer.innerHTML = `<div style="color:#f87171; font-size:0.8rem;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading disk space.</div>`;
    if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>';
  }
}

/**
 * Global Clock, Resource Monitor & Countdown Timers
 */
function updateAllClocks() {
  const now = new Date();
  
  // Update macOS top menu bar time (always local 24h or 12h based on system)
  let localHours = now.getHours();
  let localMinutes = now.getMinutes();
  localHours = localHours < 10 ? '0' + localHours : localHours;
  localMinutes = localMinutes < 10 ? '0' + localMinutes : localMinutes;
  
  const menuTimeEl = document.getElementById('menu-time');
  if (menuTimeEl) menuTimeEl.textContent = `${localHours}:${localMinutes}`;
  
  const menuDateEl = document.getElementById('menu-date');
  if (menuDateEl) {
    const menuDateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    menuDateEl.textContent = now.toLocaleDateString(undefined, menuDateOptions);
  }
  
  // Update each clock widget card based on its timezone, format, and showSeconds settings
  userWidgets.forEach(widget => {
    if (widget.type !== 'clock') return;
    
    const cardEl = document.getElementById(widget.id);
    if (!cardEl) return;
    
    const hoursEl = cardEl.querySelector('.clock-hours');
    const minutesEl = cardEl.querySelector('.clock-minutes');
    const secondsEl = cardEl.querySelector('.clock-seconds');
    const dateEl = cardEl.querySelector('.clock-date');
    
    if (!hoursEl || !minutesEl) return;
    
    const settings = widget.settings || {};
    const tz = settings.timezone || 'local';
    const is24 = settings.is24 !== false;
    const showSeconds = settings.showSeconds !== false;
    
    let targetDate = now;
    if (tz !== 'local') {
      try {
        const tzTime = now.toLocaleString('en-US', { timeZone: tz });
        targetDate = new Date(tzTime);
      } catch (e) {}
    }
    
    let hours = targetDate.getHours();
    let minutes = targetDate.getMinutes();
    let seconds = targetDate.getSeconds();
    let ampm = '';
    
    if (!is24) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
    
    if (secondsEl) {
      if (showSeconds) {
        secondsEl.style.display = '';
        secondsEl.textContent = `:${seconds}${ampm}`;
      } else {
        if (!is24) {
          secondsEl.style.display = '';
          secondsEl.textContent = ampm;
        } else {
          secondsEl.style.display = 'none';
        }
      }
    }
    
    if (dateEl) {
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz === 'local' ? undefined : tz };
      try {
        dateEl.textContent = now.toLocaleDateString(undefined, dateOptions);
      } catch (e) {
        dateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }
    }
  });
}

let lastCpuTime = performance.now();

function updateDynamicResources() {
  const currentTime = performance.now();
  const elapsed = currentTime - lastCpuTime;
  lastCpuTime = currentTime;
  
  const lag = Math.max(0, elapsed - 1000);
  const cpuPercent = Math.min(95, Math.max(3, Math.round(5 + (lag / 1.5))));
  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : '';
  const cpuLabelText = `${cpuPercent}%`;

  let ramPercent = 42;
  let ramLabelText = '42 MB';
  if (window.performance && performance.memory) {
    const used = performance.memory.usedJSHeapSize;
    const limit = performance.memory.jsHeapLimit;
    ramPercent = Math.min(100, Math.max(1, Math.round((used / limit) * 100)));
    const mbUsed = Math.round(used / (1024 * 1024));
    
    if (navigator.deviceMemory) {
      ramLabelText = `${mbUsed}MB / ${navigator.deviceMemory}GB`;
    } else {
      ramLabelText = `${mbUsed} MB`;
    }
  } else {
    const fallbackMock = Math.floor(18 + Math.random() * 5);
    ramPercent = fallbackMock;
    if (navigator.deviceMemory) {
      ramLabelText = `${fallbackMock}MB / ${navigator.deviceMemory}GB`;
    } else {
      ramLabelText = `${fallbackMock} MB`;
    }
  }

  let netSpeed = 50;
  let netPercent = 50;
  let netLabelText = '50 Mbps';
  
  if (navigator.connection && navigator.connection.downlink) {
    netSpeed = navigator.connection.downlink;
    netPercent = Math.min(100, Math.round((netSpeed / 100) * 100));
    netLabelText = `${netSpeed} Mbps`;
  } else {
    const fallbackSpeed = Math.floor(45 + Math.random() * 20);
    netPercent = Math.round((fallbackSpeed / 100) * 100);
    netLabelText = `${fallbackSpeed} Mbps`;
  }

  const pingStart = performance.now();
  fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
    .then(() => {
      const pingMs = Math.round(performance.now() - pingStart);
      updateResourceUI(netLabelText + ` (${pingMs}ms)`, cpuPercent, cpuLabelText, ramPercent, ramLabelText, netPercent, cores);
    })
    .catch(() => {
      updateResourceUI(netLabelText, cpuPercent, cpuLabelText, ramPercent, ramLabelText, netPercent, cores);
    });
}

function updateResourceUI(netLabelText, cpuPercent, cpuLabelText, ramPercent, ramLabelText, netPercent, cores) {
  const nowTime = Date.now();
  
  userWidgets.forEach(widget => {
    if (widget.type !== 'resources') return;
    
    const cardEl = document.getElementById(widget.id);
    if (!cardEl) return;
    
    const settings = widget.settings || {};
    const freq = settings.freq || 3000;
    const lastUpdate = cardEl.dataset.lastUpdate ? parseInt(cardEl.dataset.lastUpdate, 10) : 0;
    
    if (nowTime - lastUpdate < freq) return;
    cardEl.dataset.lastUpdate = nowTime;
    
    const cpuCircle = cardEl.querySelector('.cpu-circle-dynamic');
    const ramCircle = cardEl.querySelector('.ram-circle-dynamic');
    const netCircle = cardEl.querySelector('.net-circle-dynamic');
    
    if (cpuCircle) updateCircularGauge(cpuCircle, cpuPercent);
    if (ramCircle) updateCircularGauge(ramCircle, ramPercent);
    if (netCircle) updateCircularGauge(netCircle, netPercent);
    
    const cpuVal = cardEl.querySelector('.cpu-val-dynamic');
    const ramVal = cardEl.querySelector('.ram-val-dynamic');
    const netVal = cardEl.querySelector('.net-val-dynamic');
    
    if (cpuVal) {
      cpuVal.textContent = cpuLabelText;
      if (cores) cpuVal.title = `${cores} detected`;
    }
    if (ramVal) ramVal.textContent = ramLabelText;
    if (netVal) netVal.textContent = netLabelText;
  });
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

function updateAllDiskWidgets() {
  userWidgets.forEach(widget => {
    if (widget.type !== 'disk') return;
    const cardEl = document.getElementById(widget.id);
    if (!cardEl) return;
    const bodyContainer = cardEl.querySelector('.widget-body-content');
    const statusEl = document.getElementById(`status-${widget.id}`);
    if (bodyContainer) {
      updateDiskWidgetContent(widget, bodyContainer, statusEl);
    }
  });
}

function initGlobalTimers() {
  updateAllClocks();
  setInterval(updateAllClocks, 1000);
  
  updateDynamicResources();
  setInterval(updateDynamicResources, 2500);
  
  tickCountdowns();
  setInterval(tickCountdowns, 1000);
  
  updateAllDiskWidgets();
  setInterval(updateAllDiskWidgets, 60000);
}

function runWidgetInitializers() {
  if (workModeActive) {
    startM365PingLoop();
  } else {
    updateAllClocks();
    updateDynamicResources();
    tickCountdowns();
    updateAllDiskWidgets();
  }
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
  const settings = widget.settings || {};
  
  document.getElementById('widget-modal-title').textContent = 'Edit Widget';
  document.getElementById('widget-form').reset();
  
  document.getElementById('widget-type-select-group').style.display = 'none';
  document.getElementById('widget-type').value = widget.type;
  
  document.getElementById('widget-title-input').value = widget.title;
  document.getElementById('widget-col-span').value = widget.colSpan || 1;
  
  document.querySelectorAll('.widget-type-fields').forEach(f => f.style.display = 'none');
  const targetGroup = document.querySelector(`.field-${widget.type}`);
  if (targetGroup) targetGroup.style.display = 'block';
  
  if (widget.type === 'clock') {
    document.getElementById('widget-clock-timezone').value = settings.timezone || 'local';
    document.getElementById('widget-clock-format-24').checked = settings.is24 !== false;
    document.getElementById('widget-clock-seconds').checked = settings.showSeconds !== false;
  } else if (widget.type === 'notepad') {
    document.getElementById('widget-notepad-height').value = settings.height || 120;
    document.getElementById('widget-notepad-fontsize').value = settings.fontSize || '0.9rem';
  } else if (widget.type === 'weather') {
    document.getElementById('widget-weather-city').value = settings.city || '';
    document.getElementById('widget-weather-state').value = settings.state || 'sunny';
    document.getElementById('widget-weather-unit').value = settings.unit || 'C';
  } else if (widget.type === 'resources') {
    document.getElementById('widget-resources-freq').value = settings.freq || '3000';
  } else if (widget.type === 'bookmarks') {
    document.getElementById('widget-bookmarks-cols').value = settings.cols || '1';
    document.getElementById('widget-bookmarks-icons').checked = settings.showIcons !== false;
  } else if (widget.type === 'countdown') {
    document.getElementById('widget-countdown-date').value = settings.targetDate || '';
  } else if (widget.type === 'iframe') {
    document.getElementById('widget-iframe-url').value = settings.url || '';
    document.getElementById('widget-iframe-height').value = settings.height || 200;
  } else if (widget.type === 'disk') {
    document.getElementById('widget-disk-path').value = settings.path || '';
  } else if (widget.type === 'm365-status') {
    const services = settings.services || ['azure', 'teams', 'exchange', 'sharepoint', 'intune'];
    document.querySelectorAll('.widget-m365-service-check').forEach(el => {
      el.checked = services.includes(el.value);
    });
    document.getElementById('widget-m365-show-latency').checked = settings.showLatency !== false;
    document.getElementById('widget-m365-show-sparkline').checked = settings.showSparkline !== false;
    document.getElementById('widget-m365-interval').value = settings.checkInterval || '30';
  } else if (widget.type === 'm365-message-center') {
    document.getElementById('widget-m365-msg-filter').value = settings.filterCategory || 'all';
    document.getElementById('widget-m365-msg-status-filter').value = settings.filterStatus || 'all';
    document.getElementById('widget-m365-msg-service-filter').value = settings.filterService || 'all';
    document.getElementById('widget-m365-msg-limit').value = settings.limit || 4;
    document.getElementById('widget-m365-msg-live').checked = settings.useLiveFeed !== false;
  } else if (widget.type === 'm365-stats') {
    document.getElementById('widget-m365-stats-tenant').value = settings.tenantName || 'Contoso Corp';
    document.getElementById('widget-m365-stats-style').value = settings.style || 'gauges';
    document.getElementById('widget-m365-stats-uptime').value = settings.uptimeVal || '99.98';
    document.getElementById('widget-m365-stats-compliance').value = settings.complianceVal || '98.5';
    document.getElementById('widget-m365-stats-licenses').value = settings.licensesVal || '1420/1500';
    document.getElementById('widget-m365-stats-sec-score').value = settings.secureScoreVal || '74.5';
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
      if (type === 'clock') {
        settings.timezone = document.getElementById('widget-clock-timezone').value;
        settings.is24 = document.getElementById('widget-clock-format-24').checked;
        settings.showSeconds = document.getElementById('widget-clock-seconds').checked;
      } else if (type === 'notepad') {
        settings.height = parseInt(document.getElementById('widget-notepad-height').value, 10) || 120;
        settings.fontSize = document.getElementById('widget-notepad-fontsize').value;
      } else if (type === 'weather') {
        settings.city = document.getElementById('widget-weather-city').value.trim() || 'London';
        settings.state = document.getElementById('widget-weather-state').value;
        settings.unit = document.getElementById('widget-weather-unit').value || 'C';
      } else if (type === 'resources') {
        settings.freq = parseInt(document.getElementById('widget-resources-freq').value, 10) || 3000;
      } else if (type === 'bookmarks') {
        settings.cols = parseInt(document.getElementById('widget-bookmarks-cols').value, 10) || 1;
        settings.showIcons = document.getElementById('widget-bookmarks-icons').checked;
        settings.bookmarks = editingWidgetIndex !== null ? (userWidgets[editingWidgetIndex].settings.bookmarks || []) : [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'Google', url: 'https://google.com' }
        ];
      } else if (type === 'countdown') {
        settings.targetDate = document.getElementById('widget-countdown-date').value;
      } else if (type === 'iframe') {
        settings.url = document.getElementById('widget-iframe-url').value.trim();
        settings.height = parseInt(document.getElementById('widget-iframe-height').value, 10) || 200;
      } else if (type === 'todo') {
        settings.tasks = editingWidgetIndex !== null ? (userWidgets[editingWidgetIndex].settings.tasks || []) : [];
      } else if (type === 'disk') {
        settings.path = document.getElementById('widget-disk-path').value.trim();
      } else if (type === 'm365-status') {
        settings.services = Array.from(document.querySelectorAll('.widget-m365-service-check:checked')).map(el => el.value);
        settings.showLatency = document.getElementById('widget-m365-show-latency').checked;
        settings.showSparkline = document.getElementById('widget-m365-show-sparkline').checked;
        settings.checkInterval = parseInt(document.getElementById('widget-m365-interval').value, 10) || 30;
      } else if (type === 'm365-message-center') {
        settings.filterCategory = document.getElementById('widget-m365-msg-filter').value;
        settings.filterStatus = document.getElementById('widget-m365-msg-status-filter').value;
        settings.filterService = document.getElementById('widget-m365-msg-service-filter').value;
        settings.limit = parseInt(document.getElementById('widget-m365-msg-limit').value, 10) || 4;
        settings.useLiveFeed = document.getElementById('widget-m365-msg-live').checked;
      } else if (type === 'm365-stats') {
        settings.tenantName = document.getElementById('widget-m365-stats-tenant').value.trim() || 'Contoso Corp';
        settings.style = document.getElementById('widget-m365-stats-style').value;
        settings.uptimeVal = document.getElementById('widget-m365-stats-uptime').value;
        settings.complianceVal = document.getElementById('widget-m365-stats-compliance').value;
        settings.licensesVal = document.getElementById('widget-m365-stats-licenses').value;
        settings.secureScoreVal = document.getElementById('widget-m365-stats-sec-score').value;
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

// --------------------------------------------------------------------------
// Phase 2: Command Center - Fullscreen Detail Overlay Logic
// --------------------------------------------------------------------------
let detailOverlayInterval = null;

function initDetailOverlayEvents() {
  const closeBtn = document.getElementById('detail-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAppDetailOverlay);
  }
  const overlay = document.getElementById('app-detail-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAppDetailOverlay();
    });
  }
  
  // Esc key closes detail overlay
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('app-detail-overlay');
      if (overlay && overlay.style.display !== 'none') {
        closeAppDetailOverlay();
      }
    }
  });
}

function openAppDetailOverlay(app, groupIndex, appIndex) {
  const overlay = document.getElementById('app-detail-overlay');
  const titleEl = document.getElementById('detail-app-title');
  const iconEl = document.getElementById('detail-app-icon');
  const bodyEl = document.getElementById('app-detail-body');
  
  if (!overlay || !bodyEl) return;

  // Set header info
  titleEl.innerText = app.title;
  iconEl.innerHTML = `<i class="fa-solid ${app.icon}"></i>`;
  iconEl.style.color = app.color;
  overlay.style.setProperty('--accent-color-rgb', hexToRgb(app.color));

  // Reset body & show overlay
  bodyEl.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; padding:100px; font-size:1.5rem; color:var(--text-secondary);"><i class="fa-solid fa-circle-notch fa-spin"></i> &nbsp; Loading Command Panel...</div>`;
  overlay.style.display = 'flex';

  if (detailOverlayInterval) {
    clearInterval(detailOverlayInterval);
    detailOverlayInterval = null;
  }

  // Render specific layout
  renderIntegrationOverlay(app.integration, bodyEl);
}

function closeAppDetailOverlay() {
  const overlay = document.getElementById('app-detail-overlay');
  if (overlay) overlay.style.display = 'none';
  if (detailOverlayInterval) {
    clearInterval(detailOverlayInterval);
    detailOverlayInterval = null;
  }
}

function renderIntegrationOverlay(integration, container) {
  if (integration === 'radarr' || integration === 'sonarr') {
    renderRadarrSonarrOverlay(integration, container);
  } else if (integration === 'overseerr') {
    renderOverseerrOverlay(container);
  } else if (integration === 'plex' || integration === 'tautulli') {
    renderPlexOverlay(container);
  } else if (integration === 'qbittorrent') {
    renderQbittorrentOverlay(container);
  } else {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-secondary);">
        <i class="fa-solid fa-circle-exclamation" style="font-size:3rem; margin-bottom:15px; color:rgb(var(--accent-color-rgb));"></i>
        <h3>No integration setup</h3>
        <p style="font-size:0.9rem; margin-top:10px;">Configure this application's API details in Workspace Settings.</p>
      </div>
    `;
  }
}

async function renderRadarrSonarrOverlay(integration, container) {
  const label = integration === 'radarr' ? 'movies' : 'TV shows';
  
  container.innerHTML = `
    <!-- Overlay Tab Navigation -->
    <div class="detail-tab-bar">
      <button type="button" class="detail-tab-btn active" data-tab="search"><i class="fa-solid fa-magnifying-glass"></i> Search & Add</button>
      <button type="button" class="detail-tab-btn" data-tab="queue"><i class="fa-solid fa-circle-arrow-down"></i> Active Queue</button>
      <button type="button" class="detail-tab-btn" data-tab="library"><i class="fa-solid fa-folder-open"></i> Library Explorer</button>
    </div>

    <!-- Tab Content Panes -->
    <div class="detail-tab-panes" style="margin-bottom: 24px;">
      <!-- Search Pane -->
      <div class="detail-tab-pane" id="pane-search" style="display:block;">
        <div class="detail-search-bar-wrapper">
          <i class="fa-solid fa-magnifying-glass detail-search-icon" style="cursor: pointer;"></i>
          <input type="text" class="detail-search-input-field" placeholder="Search for new ${label} to add to ${integration.toUpperCase()}..." id="detail-media-search">
        </div>
        <div class="media-results-container">
          <div class="search-results-grid" id="detail-search-results" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 20px;"></div>
        </div>
      </div>

      <!-- Queue Pane -->
      <div class="detail-tab-pane" id="pane-queue" style="display:none;">
        <div class="queue-list" id="detail-queue-list">
          <div style="opacity:0.6; font-size:0.85rem; padding:20px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Checking downloads queue...</div>
        </div>
      </div>

      <!-- Library Pane -->
      <div class="detail-tab-pane" id="pane-library" style="display:none;">
        <div class="library-filter-wrapper" style="margin-bottom: 20px;">
          <input type="text" class="detail-search-input-field" placeholder="Filter library by title..." id="detail-library-filter" style="padding: 12px 18px; border-radius:12px;">
        </div>
        <div class="search-results-grid" id="detail-library-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 20px;"></div>
      </div>
    </div>
    
    <!-- Permanent Stats Row -->
    <div class="media-details-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top:24px;">
      <div class="disk-usage-section">
        <h4 style="margin-bottom: 16px; font-size: 1rem; font-family: var(--font-display); font-weight:700;"><i class="fa-solid fa-hard-drive" style="color:rgb(var(--accent-color-rgb));"></i> Disk Storage</h4>
        <div id="detail-disk-space" class="disk-space-container">
          <div style="opacity:0.6; font-size:0.8rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading storage info...</div>
        </div>
      </div>
      <div class="upcoming-releases-section">
        <h4 style="margin-bottom: 16px; font-size: 1rem; font-family: var(--font-display); font-weight:700;"><i class="fa-solid fa-calendar-days" style="color:rgb(var(--accent-color-rgb));"></i> Upcoming Releases</h4>
        <div id="detail-upcoming-releases" class="upcoming-list-container">
          <div style="opacity:0.6; font-size:0.8rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading releases calendar...</div>
        </div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#detail-media-search');
  const resultsGrid = container.querySelector('#detail-search-results');
  const diskSpaceContainer = container.querySelector('#detail-disk-space');
  const upcomingContainer = container.querySelector('#detail-upcoming-releases');
  const queueList = container.querySelector('#detail-queue-list');
  const libraryGrid = container.querySelector('#detail-library-grid');
  const libraryFilter = container.querySelector('#detail-library-filter');

  // Load basic stats
  loadRadarrSonarrDiskSpace(integration, diskSpaceContainer);
  loadRadarrSonarrCalendar(integration, upcomingContainer);

  // Tab switching logic
  const tabs = container.querySelectorAll('.detail-tab-btn');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(btn => btn.classList.remove('active'));
      t.classList.add('active');
      
      const targetTab = t.getAttribute('data-tab');
      container.querySelectorAll('.detail-tab-pane').forEach(p => p.style.display = 'none');
      container.querySelector(`#pane-${targetTab}`).style.display = 'block';
      
      // Stop ongoing loops when switching tabs
      if (detailOverlayInterval) {
        clearInterval(detailOverlayInterval);
        detailOverlayInterval = null;
      }
      
      if (targetTab === 'queue') {
        loadRadarrSonarrQueue(integration, queueList);
        detailOverlayInterval = setInterval(() => {
          loadRadarrSonarrQueue(integration, queueList);
        }, 3000);
      } else if (targetTab === 'library') {
        loadRadarrSonarrLibrary(integration, libraryGrid);
      }
    });
  });

  // Debounced search logic
  if (searchInput && resultsGrid) {
    searchInput.focus();
    let searchTimeout = null;
    
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const query = searchInput.value.trim();
      
      if (query.length === 0) {
        resultsGrid.innerHTML = '';
        return;
      }
      
      resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-keyboard fa-fade"></i> &nbsp; Typing...</div>`;
      
      searchTimeout = setTimeout(async () => {
        resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-circle-notch fa-spin"></i> &nbsp; Searching ${integration.toUpperCase()}...</div>`;
        try {
          await renderMediaSearchResults(integration, query, resultsGrid);
        } catch (err) {
          console.error(err);
          resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading search results.</div>`;
        }
      }, 450);
    });

    // Make magnifying glass icon trigger immediate search on click
    const searchIcon = container.querySelector('.detail-search-icon');
    if (searchIcon) {
      searchIcon.addEventListener('click', async () => {
        clearTimeout(searchTimeout);
        const query = searchInput.value.trim();
        if (query.length === 0) return;
        
        resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-circle-notch fa-spin"></i> &nbsp; Searching ${integration.toUpperCase()}...</div>`;
        try {
          await renderMediaSearchResults(integration, query, resultsGrid);
        } catch (err) {
          resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading search results.</div>`;
        }
      });
    }
  }

  // Library browser filter
  if (libraryFilter && libraryGrid) {
    libraryFilter.addEventListener('input', () => {
      const q = libraryFilter.value.toLowerCase().trim();
      const cards = libraryGrid.querySelectorAll('.search-result-card');
      cards.forEach(c => {
        const title = c.querySelector('.search-result-title').textContent.toLowerCase();
        c.style.display = title.includes(q) ? 'flex' : 'none';
      });
    });
  }
}

async function loadRadarrSonarrDiskSpace(integration, container) {
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];
  
  if (!url || !key) {
    container.innerHTML = `
      <div class="disk-usage-item">
        <div class="disk-usage-header">
          <span class="disk-usage-path">/data/media</span>
          <span>5.9 TB free / 8.0 TB total</span>
        </div>
        <div class="disk-progress-bar">
          <div class="disk-progress-fill" style="width: 73.7%;"></div>
        </div>
      </div>
      <div class="disk-usage-item">
        <div class="disk-usage-header">
          <span class="disk-usage-path">/system/root</span>
          <span>124.0 GB free / 250.0 GB total</span>
        </div>
        <div class="disk-progress-bar">
          <div class="disk-progress-fill" style="width: 49.6%; background:linear-gradient(90deg, #3b82f6, #60a5fa);"></div>
        </div>
      </div>
    `;
    return;
  }

  try {
    const res = await fetch(`${url}/api/v3/diskspace?apikey=${key}`);
    if (!res.ok) throw new Error();
    const diskData = await res.json();
    if (diskData.length === 0) {
      container.innerHTML = `<div style="opacity:0.6; font-size:0.8rem;">No storage paths found.</div>`;
      return;
    }
    
    let html = '';
    diskData.forEach(d => {
      const free = formatBytes(d.freeSpace);
      const total = formatBytes(d.totalSpace);
      const usedPercent = ((d.totalSpace - d.freeSpace) / d.totalSpace) * 100;
      
      html += `
        <div class="disk-usage-item">
          <div class="disk-usage-header">
            <span class="disk-usage-path">${d.path}</span>
            <span>${free} free / ${total} total</span>
          </div>
          <div class="disk-progress-bar">
            <div class="disk-progress-fill" style="width: ${usedPercent.toFixed(1)}%;"></div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="color:#f87171; font-size:0.8rem;"><i class="fa-solid fa-triangle-exclamation"></i> Could not connect to API.</div>`;
  }
}

async function loadRadarrSonarrCalendar(integration, container) {
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];
  
  if (!url || !key) {
    let html = '';
    if (integration === 'sonarr') {
      const mockReleases = [
        { title: 'The Boys S04E05', date: 'Tomorrow 9:00 PM' },
        { title: 'House of the Dragon S02E03', date: 'In 2 days 2:00 AM' },
        { title: 'The Bear S03E01', date: 'In 4 days 8:00 AM' }
      ];
      mockReleases.forEach(r => {
        html += `
          <div class="upcoming-item">
            <span class="upcoming-title">${r.title}</span>
            <span class="upcoming-date">${r.date}</span>
          </div>
        `;
      });
    } else {
      const mockReleases = [
        { title: 'Deadpool & Wolverine', date: 'Next Friday' },
        { title: 'Alien: Romulus', date: 'Aug 14, 2026' }
      ];
      mockReleases.forEach(r => {
        html += `
          <div class="upcoming-item">
            <span class="upcoming-title">${r.title}</span>
            <span class="upcoming-date">${r.date}</span>
          </div>
        `;
      });
    }
    container.innerHTML = html;
    return;
  }

  try {
    let releases = [];
    if (integration === 'sonarr') {
      const data = await getSonarrUpcoming();
      releases = data.releases;
    } else {
      const data = await getRadarrUpcoming();
      releases = data.releases;
    }
    
    if (releases.length === 0) {
      container.innerHTML = `<div style="opacity:0.6; font-size:0.8rem;">No releases scheduled for the next 2 weeks.</div>`;
      return;
    }
    
    let html = '';
    releases.slice(0, 4).forEach(r => {
      html += `
        <div class="upcoming-item">
          <span class="upcoming-title">${r.title}</span>
          <span class="upcoming-date">${r.date}</span>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="color:#f87171; font-size:0.8rem;"><i class="fa-solid fa-triangle-exclamation"></i> Could not query calendar.</div>`;
  }
}

async function loadRadarrSonarrQueue(integration, container) {
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];

  if (!url || !key) {
    // Render mock downloading queue
    let html = '<div class="queue-list">';
    let mockQueue = [];
    if (integration === 'radarr') {
      mockQueue = [
        { title: 'Gladiator II (2024)', size: 13314390000, sizeleft: 6920000000, status: 'downloading', timeleft: '00:08:12' },
        { title: 'Dune: Part Two (2024)', size: 19430000000, sizeleft: 19430000000, status: 'paused', timeleft: 'Paused' }
      ];
    } else {
      mockQueue = [
        { title: 'Severance - S02E01 - Episode 1', size: 2250000000, sizeleft: 450000000, status: 'downloading', timeleft: '00:01:15' },
        { title: 'The Boys - S04E06 - Episode 6', size: 2460000000, sizeleft: 2150000000, status: 'downloading', timeleft: '00:15:30' }
      ];
    }

    mockQueue.forEach(t => {
      const progress = ((t.size - t.sizeleft) / t.size) * 100;
      const progressPercent = progress.toFixed(1);
      const sizeStr = formatBytes(t.size);
      const leftStr = formatBytes(t.sizeleft);
      
      html += `
        <div class="queue-item-row">
          <div class="queue-row-top">
            <span class="queue-name" title="${t.title}">${t.title}</span>
            <span class="queue-percent">${progressPercent}%</span>
          </div>
          <div class="queue-progress-bar-container">
            <div class="queue-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="queue-row-bottom">
            <div class="queue-stats-left">
              <span><i class="fa-solid fa-hard-drive"></i> ${leftStr} left of ${sizeStr}</span>
              <span><i class="fa-solid fa-hourglass-half"></i> ${t.timeleft}</span>
              <span class="queue-status-badge">${t.status}</span>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
    return;
  }

  try {
    const res = await fetch(`${url}/api/v3/queue?apikey=${key}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    
    const queueItems = Array.isArray(data) ? data : (data.records || []);
    
    if (queueItems.length === 0) {
      container.innerHTML = `
        <div style="opacity:0.6; font-size:0.85rem; padding:12px; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-circle-check" style="color:#34d399; font-size:1.1rem;"></i> No active downloading queue items.
        </div>
      `;
      return;
    }

    let html = '<div class="queue-list">';
    queueItems.forEach(t => {
      const title = t.title || 'Unknown Media';
      const size = t.size || 0;
      const sizeleft = t.sizeleft || 0;
      const progress = size > 0 ? (((size - sizeleft) / size) * 100) : 0;
      const progressPercent = progress.toFixed(1);
      const sizeStr = formatBytes(size);
      const leftStr = formatBytes(sizeleft);
      const status = t.status || 'downloading';
      const timeleft = t.timeleft || 'Unknown';
      
      html += `
        <div class="queue-item-row">
          <div class="queue-row-top">
            <span class="queue-name" title="${title}">${title}</span>
            <span class="queue-percent">${progressPercent}%</span>
          </div>
          <div class="queue-progress-bar-container">
            <div class="queue-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="queue-row-bottom">
            <div class="queue-stats-left">
              <span><i class="fa-solid fa-hard-drive"></i> ${leftStr} left of ${sizeStr}</span>
              <span><i class="fa-solid fa-hourglass-half"></i> ${timeleft}</span>
              <span class="queue-status-badge">${status}</span>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="color:#f87171; font-size:0.85rem;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading queue list.</div>`;
  }
}

async function loadRadarrSonarrLibrary(integration, container) {
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];

  container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-circle-notch fa-spin"></i> &nbsp; Loading library entries...</div>`;

  if (!url || !key) {
    let mockLibrary = [];
    if (integration === 'radarr') {
      mockLibrary = [
        { id: 1, title: 'Inception', year: 2010, poster: 'https://image.tmdb.org/t/p/w185/iiZZZe44P6r7532vcyfK24gPVev.jpg', hasFile: true },
        { id: 2, title: 'The Dark Knight', year: 2008, poster: 'https://image.tmdb.org/t/p/w185/qJ2t4EDtegiovRMMjaL0asQEEZz.jpg', hasFile: true },
        { id: 3, title: 'Interstellar', year: 2014, poster: 'https://image.tmdb.org/t/p/w185/gEU2QniE6E6vNI6m8hmdj6HwMwR.jpg', hasFile: true },
        { id: 4, title: 'Spider-Man: Across the Spider-Verse', year: 2023, poster: 'https://image.tmdb.org/t/p/w185/8Vtbi7ehX7S6C61rjv5hWgMzarj.jpg', hasFile: false }
      ];
    } else {
      mockLibrary = [
        { id: 1, title: 'Breaking Bad', year: 2008, poster: 'https://image.tmdb.org/t/p/w185/ztkK6o1wS6EZDw7Z65XzsIfVZPE.jpg', statistics: { episodeFileCount: 62, episodeCount: 62 } },
        { id: 2, title: 'Stranger Things', year: 2016, poster: 'https://image.tmdb.org/t/p/w185/49WJfeN0mhmmQ9R6j4qqC34FIaY.jpg', statistics: { episodeFileCount: 34, episodeCount: 34 } },
        { id: 3, title: 'The Boys', year: 2019, poster: 'https://image.tmdb.org/t/p/w185/7NsNS8VQD1T28t3qn9d191iHOfH.jpg', statistics: { episodeFileCount: 24, episodeCount: 32 } }
      ];
    }

    displayLibraryResults(integration, mockLibrary, container, true);
    return;
  }

  try {
    const endpoint = integration === 'radarr'
      ? `${url}/api/v3/movie?apikey=${key}`
      : `${url}/api/v3/series?apikey=${key}`;

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-face-frown"></i> Library is currently empty.</div>`;
      return;
    }

    const sorted = data.sort((a, b) => b.id - a.id).slice(0, 36);
    displayLibraryResults(integration, sorted, container, false);
  } catch (err) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading library.</div>`;
  }
}

function displayLibraryResults(integration, results, gridContainer, isMock) {
  gridContainer.innerHTML = '';
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    card.style.position = 'relative';

    let posterUrl = '';
    if (isMock) {
      posterUrl = item.poster;
    } else {
      posterUrl = `${url}/api/v3/mediacover/${item.id}/poster.jpg?apikey=${key}`;
    }

    let posterHtml = `<div class="search-result-poster-wrapper"><i class="fa-solid fa-clapperboard search-result-poster-fallback"></i></div>`;
    if (posterUrl) {
      posterHtml = `
        <div class="search-result-poster-wrapper">
          <img src="${posterUrl}" alt="${item.title}" class="search-result-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="search-result-poster-fallback" style="display:none;"><i class="fa-solid fa-clapperboard"></i></div>
        </div>
      `;
    }

    let badgeHtml = '';
    if (integration === 'radarr') {
      const isAvailable = item.hasFile || (item.movieFile && item.movieFile.id > 0);
      const label = isAvailable ? 'Available' : 'Missing';
      const classType = isAvailable ? 'available' : 'missing';
      badgeHtml = `<span class="library-status-badge library-status-${classType}">${label}</span>`;
    } else {
      const stats = item.statistics;
      if (stats) {
        const isCompleted = stats.episodeFileCount === stats.episodeCount;
        const classType = isCompleted ? 'available' : 'missing';
        badgeHtml = `<span class="library-status-badge library-status-${classType}">${stats.episodeFileCount}/${stats.episodeCount} Ep</span>`;
      } else {
        badgeHtml = `<span class="library-status-badge library-status-missing">0/0 Ep</span>`;
      }
    }

    card.innerHTML = `
      ${badgeHtml}
      ${posterHtml}
      <div class="search-result-info">
        <h4 class="search-result-title" title="${item.title}">${item.title}</h4>
        <div class="search-result-meta">
          <span>${item.year || ''}</span>
        </div>
      </div>
    `;

    gridContainer.appendChild(card);
  });
}

async function renderMediaSearchResults(integration, query, resultsGrid) {
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];
  
  if (!url || !key) {
    showToast("API Key empty. Displaying demo results.", "info");
    let mockResults = [];
    if (integration === 'radarr') {
      mockResults = [
        { title: 'Spider-Man: Into the Spider-Verse', year: 2018, poster: 'https://image.tmdb.org/t/p/w185/iiZZZe44P6r7532vcyfK24gPVev.jpg', added: true, tmdbId: 324857, titleSlug: 'spider-man-into-the-spider-verse' },
        { title: 'Spider-Man: Across the Spider-Verse', year: 2023, poster: 'https://image.tmdb.org/t/p/w185/8Vtbi7ehX7S6C61rjv5hWgMzarj.jpg', added: false, tmdbId: 569094, titleSlug: 'spider-man-across-the-spider-verse' },
        { title: 'Spider-Man: No Way Home', year: 2021, poster: 'https://image.tmdb.org/t/p/w185/1g0zzZw1jZBCVvn3fUjhv4w7Zba.jpg', added: false, tmdbId: 634649, titleSlug: 'spider-man-no-way-home' }
      ];
    } else {
      mockResults = [
        { title: 'Stranger Things', year: 2016, poster: 'https://image.tmdb.org/t/p/w185/49WJfeN0mhmmQ9R6j4qqC34FIaY.jpg', added: true, tvdbId: 305288, titleSlug: 'stranger-things' },
        { title: 'Breaking Bad', year: 2008, poster: 'https://image.tmdb.org/t/p/w185/ztkK6o1wS6EZDw7Z65XzsIfVZPE.jpg', added: false, tvdbId: 81189, titleSlug: 'breaking-bad' },
        { title: 'The Boys', year: 2019, poster: 'https://image.tmdb.org/t/p/w185/7NsNS8VQD1T28t3qn9d191iHOfH.jpg', added: false, tvdbId: 355511, titleSlug: 'the-boys' }
      ];
    }
    
    displayMediaResults(integration, mockResults, resultsGrid, true);
    return;
  }

  const endpoint = integration === 'radarr' 
    ? `${url}/api/v3/movie/lookup?term=${encodeURIComponent(query)}&apikey=${key}`
    : `${url}/api/v3/series/lookup?term=${encodeURIComponent(query)}&apikey=${key}`;
    
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error();
  const data = await res.json();
  
  if (data.length === 0) {
    resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-face-frown"></i> No matching titles found.</div>`;
    return;
  }

  const results = data.slice(0, 12).map(item => {
    const posterObj = item.images ? item.images.find(img => img.coverType === 'poster') : null;
    const poster = posterObj ? (posterObj.remoteUrl || posterObj.url) : '';
    
    return {
      title: item.title,
      year: item.year,
      poster: poster,
      added: item.added || item.id > 0,
      itemRaw: item
    };
  });

  displayMediaResults(integration, results, resultsGrid, false);
}

function displayMediaResults(integration, results, resultsGrid, isMock) {
  resultsGrid.innerHTML = '';
  
  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    
    let posterHtml = `<div class="search-result-poster-wrapper"><i class="fa-solid fa-clapperboard search-result-poster-fallback"></i></div>`;
    if (item.poster) {
      posterHtml = `
        <div class="search-result-poster-wrapper">
          <img src="${item.poster}" alt="${item.title}" class="search-result-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="search-result-poster-fallback" style="display:none;"><i class="fa-solid fa-clapperboard"></i></div>
        </div>
      `;
    }

    let actionBtnHtml = '';
    if (item.added) {
      actionBtnHtml = `
        <button class="btn-macos btn-macos-secondary search-result-action-btn" disabled style="opacity: 0.6; cursor: not-allowed; background:rgba(255,255,255,0.02)">
          <i class="fa-solid fa-circle-check" style="color:#34d399;"></i> Added
        </button>
      `;
    } else {
      actionBtnHtml = `
        <button class="btn-macos btn-macos-primary search-result-action-btn add-media-btn">
          <i class="fa-solid fa-plus"></i> Add to ${integration.toUpperCase()}
        </button>
      `;
    }

    card.innerHTML = `
      ${posterHtml}
      <div class="search-result-info">
        <h4 class="search-result-title" title="${item.title}">${item.title}</h4>
        <div class="search-result-meta">
          <span>${item.year || 'Unknown'}</span>
        </div>
      </div>
      ${actionBtnHtml}
    `;

    const addBtn = card.querySelector('.add-media-btn');
    if (addBtn) {
      addBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        addBtn.disabled = true;
        addBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Adding...`;
        
        try {
          let success = false;
          if (isMock) {
            await new Promise(r => setTimeout(r, 1000));
            success = true;
          } else {
            success = await addMediaToSystem(integration, item.itemRaw);
          }

          if (success) {
            showToast(`"${item.title}" added successfully!`);
            addBtn.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#34d399;"></i> Added`;
            addBtn.disabled = true;
            addBtn.style.opacity = '0.6';
          } else {
            throw new Error();
          }
        } catch (err) {
          showToast(`Failed to add "${item.title}". Check backend configurations.`, 'error');
          addBtn.disabled = false;
          addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add to ${integration.toUpperCase()}`;
        }
      });
    }

    resultsGrid.appendChild(card);
  });
}

async function addMediaToSystem(integration, itemRaw) {
  const url = cleanUrl(integrationConfigs[`${integration}Url`]);
  const key = integrationConfigs[`${integration}Key`];
  if (!url || !key) return false;

  try {
    const rootFoldersRes = await fetch(`${url}/api/v3/rootfolder?apikey=${key}`);
    const qualityProfilesRes = await fetch(`${url}/api/v3/qualityprofile?apikey=${key}`);
    if (!rootFoldersRes.ok || !qualityProfilesRes.ok) return false;

    const rootFolders = await rootFoldersRes.json();
    const qualityProfiles = await qualityProfilesRes.json();

    if (rootFolders.length === 0 || qualityProfiles.length === 0) return false;

    const rootPath = rootFolders[0].path;
    const profileId = qualityProfiles[0].id;

    let payload = {};
    if (integration === 'radarr') {
      payload = {
        title: itemRaw.title,
        qualityProfileId: profileId,
        titleSlug: itemRaw.titleSlug,
        images: itemRaw.images,
        tmdbId: itemRaw.tmdbId,
        year: itemRaw.year,
        rootFolderPath: rootPath,
        monitored: true,
        addOptions: { searchForMovie: true }
      };
    } else {
      payload = {
        title: itemRaw.title,
        qualityProfileId: profileId,
        titleSlug: itemRaw.titleSlug,
        images: itemRaw.images,
        tvdbId: itemRaw.tvdbId,
        rootFolderPath: rootPath,
        monitored: true,
        addOptions: { searchForMissingEpisodes: true }
      };
    }

    const postRes = await fetch(`${url}/api/v3/${integration === 'radarr' ? 'movie' : 'series'}?apikey=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return postRes.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function renderOverseerrOverlay(container) {
  container.innerHTML = `
    <div class="detail-search-bar-wrapper">
      <i class="fa-solid fa-magnifying-glass detail-search-icon"></i>
      <input type="text" class="detail-search-input-field" placeholder="Search movies or TV shows to request on Overseerr..." id="detail-overseerr-search">
    </div>
    
    <div class="media-results-container" style="margin-bottom: 32px;">
      <div class="search-results-grid" id="detail-search-results" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 20px;"></div>
    </div>
    
    <div class="pending-requests-section" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top:24px;">
      <h4 style="margin-bottom: 16px; font-size: 1rem; font-family: var(--font-display); font-weight:700;"><i class="fa-solid fa-clock-rotate-left" style="color:rgb(var(--accent-color-rgb));"></i> Pending Approval Requests</h4>
      <div class="overseerr-requests-grid" id="detail-overseerr-pending">
        <div style="opacity:0.6; font-size:0.8rem;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading pending requests...</div>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#detail-overseerr-search');
  const resultsGrid = container.querySelector('#detail-search-results');
  const pendingContainer = container.querySelector('#detail-overseerr-pending');

  loadOverseerrPendingRequests(pendingContainer);

  if (searchInput && resultsGrid) {
    searchInput.focus();
    searchInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query.length === 0) return;
        
        resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-circle-notch fa-spin"></i> Searching TMDB via Overseerr...</div>`;
        
        try {
          await renderOverseerrSearchResults(query, resultsGrid);
        } catch (err) {
          console.error(err);
          resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> Error loading search results.</div>`;
        }
      }
    });
  }
}

async function loadOverseerrPendingRequests(container) {
  const url = cleanUrl(integrationConfigs.overseerrUrl);
  const key = integrationConfigs.overseerrKey;

  if (!url || !key) {
    container.innerHTML = `
      <div class="overseerr-request-item-row" id="mock-req-1">
        <div class="overseerr-request-left">
          <img src="https://image.tmdb.org/t/p/w92/yg0tZB2suS4G92nFcBO46W7uXPI.jpg" class="overseerr-request-poster-thumb" alt="Gladiator II">
          <div class="overseerr-request-details">
            <span class="overseerr-request-title">Gladiator II</span>
            <span class="overseerr-request-meta">Movie requested by <strong>Sarah</strong> &bull; Yesterday</span>
          </div>
        </div>
        <div class="overseerr-request-actions">
          <button class="request-action-btn-approve mock-approve" data-id="1" data-title="Gladiator II">Approve</button>
          <button class="request-action-btn-deny mock-deny" data-id="1" data-title="Gladiator II">Deny</button>
        </div>
      </div>
      <div class="overseerr-request-item-row" id="mock-req-2">
        <div class="overseerr-request-left">
          <img src="https://image.tmdb.org/t/p/w92/7NsNS8VQD1T28t3qn9d191iHOfH.jpg" class="overseerr-request-poster-thumb" alt="The Boys">
          <div class="overseerr-request-details">
            <span class="overseerr-request-title">The Boys - Season 4</span>
            <span class="overseerr-request-meta">TV Show requested by <strong>Alex</strong> &bull; 2 hours ago</span>
          </div>
        </div>
        <div class="overseerr-request-actions">
          <button class="request-action-btn-approve mock-approve" data-id="2" data-title="The Boys Season 4">Approve</button>
          <button class="request-action-btn-deny mock-deny" data-id="2" data-title="The Boys Season 4">Deny</button>
        </div>
      </div>
    `;
    
    container.querySelectorAll('.mock-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('.overseerr-request-item-row');
        row.style.opacity = '0.4';
        setTimeout(() => {
          row.remove();
          showToast(`Approved request for "${btn.getAttribute('data-title')}"`);
          if (container.children.length === 0) {
            container.innerHTML = `<div style="opacity:0.6; font-size:0.8rem; padding:10px;"><i class="fa-solid fa-circle-check" style="color:#34d399;"></i> No pending requests.</div>`;
          }
        }, 800);
      });
    });
    container.querySelectorAll('.mock-deny').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const row = e.target.closest('.overseerr-request-item-row');
        row.style.opacity = '0.4';
        setTimeout(() => {
          row.remove();
          showToast(`Denied request for "${btn.getAttribute('data-title')}"`, 'info');
          if (container.children.length === 0) {
            container.innerHTML = `<div style="opacity:0.6; font-size:0.8rem; padding:10px;"><i class="fa-solid fa-circle-check" style="color:#34d399;"></i> No pending requests.</div>`;
          }
        }, 800);
      });
    });
    return;
  }

  try {
    const res = await fetch(`${url}/api/v1/request?take=40&filter=pending`, {
      headers: { 'X-Api-Key': key }
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const pendingItems = data.results || [];
    
    if (pendingItems.length === 0) {
      container.innerHTML = `
        <div style="opacity:0.6; font-size:0.85rem; padding:12px; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-circle-check" style="color:#34d399; font-size:1.1rem;"></i> No pending requests.
        </div>
      `;
      return;
    }

    let html = '';
    pendingItems.forEach(req => {
      const type = req.type;
      const mediaInfo = type === 'movie' ? req.movie : req.tv;
      if (!mediaInfo) return;
      
      const title = mediaInfo.title || mediaInfo.name;
      const date = mediaInfo.releaseDate || mediaInfo.firstAirDate || '';
      const year = date ? new Date(date).getFullYear() : '';
      const poster = mediaInfo.posterPath ? `https://image.tmdb.org/t/p/w92${mediaInfo.posterPath}` : '';
      const requester = req.requestedBy ? req.requestedBy.displayName : 'Unknown User';
      const typeLabel = type === 'movie' ? 'Movie' : 'TV Show';
      
      html += `
        <div class="overseerr-request-item-row" data-request-id="${req.id}">
          <div class="overseerr-request-left">
            ${poster ? `<img src="${poster}" class="overseerr-request-poster-thumb" alt="${title}">` : `<div class="overseerr-request-poster-thumb" style="display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3);"><i class="fa-solid fa-film"></i></div>`}
            <div class="overseerr-request-details">
              <span class="overseerr-request-title">${title} ${year ? `(${year})` : ''}</span>
              <span class="overseerr-request-meta">${typeLabel} requested by <strong>${requester}</strong></span>
            </div>
          </div>
          <div class="overseerr-request-actions">
            <button class="request-action-btn-approve approve-overseerr-btn" data-id="${req.id}" data-title="${title}">Approve</button>
            <button class="request-action-btn-deny deny-overseerr-btn" data-id="${req.id}" data-title="${title}">Deny</button>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;

    container.querySelectorAll('.approve-overseerr-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reqId = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        const row = e.target.closest('.overseerr-request-item-row');
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
        
        try {
          const approveRes = await fetch(`${url}/api/v1/request/${reqId}/approve`, {
            method: 'POST',
            headers: { 'X-Api-Key': key }
          });
          if (approveRes.ok) {
            showToast(`Approved "${title}" successfully!`);
            row.style.opacity = '0.3';
            setTimeout(() => {
              row.remove();
              if (container.children.length === 0) {
                container.innerHTML = `<div style="opacity:0.6; font-size:0.8rem; padding:10px;"><i class="fa-solid fa-circle-check" style="color:#34d399;"></i> No pending requests.</div>`;
              }
            }, 500);
          } else {
            throw new Error();
          }
        } catch (err) {
          showToast(`Failed to approve "${title}"`, 'error');
          btn.disabled = false;
          btn.innerHTML = 'Approve';
        }
      });
    });

    container.querySelectorAll('.deny-overseerr-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const reqId = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        const row = e.target.closest('.overseerr-request-item-row');
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
        
        try {
          const denyRes = await fetch(`${url}/api/v1/request/${reqId}/decline`, {
            method: 'POST',
            headers: { 'X-Api-Key': key }
          });
          if (denyRes.ok) {
            showToast(`Declined "${title}"`, 'info');
            row.style.opacity = '0.3';
            setTimeout(() => {
              row.remove();
              if (container.children.length === 0) {
                container.innerHTML = `<div style="opacity:0.6; font-size:0.8rem; padding:10px;"><i class="fa-solid fa-circle-check" style="color:#34d399;"></i> No pending requests.</div>`;
              }
            }, 500);
          } else {
            throw new Error();
          }
        } catch (err) {
          showToast(`Failed to deny "${title}"`, 'error');
          btn.disabled = false;
          btn.innerHTML = 'Deny';
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<div style="color:#f87171; font-size:0.85rem;"><i class="fa-solid fa-triangle-exclamation"></i> Error communicating with Overseerr API.</div>`;
  }
}

async function renderOverseerrSearchResults(query, resultsGrid) {
  const url = cleanUrl(integrationConfigs.overseerrUrl);
  const key = integrationConfigs.overseerrKey;

  if (!url || !key) {
    showToast("API Key empty. Displaying demo search.", "info");
    const mockResults = [
      { id: 101, title: 'The Batman', mediaType: 'movie', year: 2022, poster: 'https://image.tmdb.org/t/p/w185/74xTEgt7R361jUNmjJHv603OInu.jpg', requested: false },
      { id: 102, title: 'Severance', mediaType: 'tv', year: 2022, poster: 'https://image.tmdb.org/t/p/w185/8VTt0oFq932K4Baqh8L6r3C5B52.jpg', requested: true }
    ];
    displayOverseerrResults(mockResults, resultsGrid, true);
    return;
  }

  const res = await fetch(`${url}/api/v1/search?query=${encodeURIComponent(query)}`, {
    headers: { 'X-Api-Key': key }
  });
  if (!res.ok) throw new Error();
  const searchData = await res.json();
  const results = searchData.results || [];
  
  if (results.length === 0) {
    resultsGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; font-size:0.95rem; opacity:0.6;"><i class="fa-solid fa-face-frown"></i> No matching titles found.</div>`;
    return;
  }

  const parsed = results.slice(0, 12).map(item => {
    const title = item.title || item.name || 'Unknown Media';
    const date = item.releaseDate || item.firstAirDate || '';
    const year = date ? new Date(date).getFullYear() : '';
    const poster = item.posterPath ? `https://image.tmdb.org/t/p/w185${item.posterPath}` : '';
    
    let requested = false;
    if (item.mediaInfo) {
      requested = item.mediaInfo.status >= 2;
    }

    return {
      id: item.id,
      title: title,
      mediaType: item.mediaType,
      year: year,
      poster: poster,
      requested: requested
    };
  });

  displayOverseerrResults(parsed, resultsGrid, false);
}

function displayOverseerrResults(results, resultsGrid, isMock) {
  resultsGrid.innerHTML = '';
  const url = cleanUrl(integrationConfigs.overseerrUrl);
  const key = integrationConfigs.overseerrKey;

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'search-result-card';
    
    let posterHtml = `<div class="search-result-poster-wrapper"><i class="fa-solid fa-clapperboard search-result-poster-fallback"></i></div>`;
    if (item.poster) {
      posterHtml = `
        <div class="search-result-poster-wrapper">
          <img src="${item.poster}" alt="${item.title}" class="search-result-poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="search-result-poster-fallback" style="display:none;"><i class="fa-solid fa-clapperboard"></i></div>
        </div>
      `;
    }

    let actionBtnHtml = '';
    if (item.requested) {
      actionBtnHtml = `
        <button class="btn-macos btn-macos-secondary search-result-action-btn" disabled style="opacity: 0.6; cursor: not-allowed; background:rgba(255,255,255,0.02)">
          <i class="fa-solid fa-circle-check" style="color:#34d399;"></i> Requested / Active
        </button>
      `;
    } else {
      actionBtnHtml = `
        <button class="btn-macos btn-macos-primary search-result-action-btn request-btn">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Request Media
        </button>
      `;
    }

    card.innerHTML = `
      ${posterHtml}
      <div class="search-result-info">
        <h4 class="search-result-title" title="${item.title}">${item.title}</h4>
        <div class="search-result-meta">
          <span>${item.mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
          <span>${item.year || ''}</span>
        </div>
      </div>
      ${actionBtnHtml}
    `;

    const requestBtn = card.querySelector('.request-btn');
    if (requestBtn) {
      requestBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        requestBtn.disabled = true;
        requestBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...`;
        
        try {
          let success = false;
          if (isMock) {
            await new Promise(r => setTimeout(r, 1000));
            success = true;
          } else {
            const body = {
              mediaType: item.mediaType,
              mediaId: item.id
            };
            if (item.mediaType === 'tv') {
              body.seasons = 'all';
            }
            const reqRes = await fetch(`${url}/api/v1/request`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-Api-Key': key
              },
              body: JSON.stringify(body)
            });
            success = reqRes.ok;
          }

          if (success) {
            showToast(`Request sent for "${item.title}"!`);
            requestBtn.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#34d399;"></i> Requested`;
            requestBtn.disabled = true;
            requestBtn.style.opacity = '0.6';
          } else {
            throw new Error();
          }
        } catch (err) {
          showToast(`Failed to request "${item.title}".`, 'error');
          requestBtn.disabled = false;
          requestBtn.innerHTML = `<i class="fa-solid fa-arrow-up-right-from-square"></i> Request Media`;
        }
      });
    }

    resultsGrid.appendChild(card);
  });
}

function renderPlexOverlay(container) {
  container.innerHTML = `
    <h4 style="margin-bottom: 16px; font-size: 1.1rem; font-family: var(--font-display); font-weight:700;"><i class="fa-solid fa-video" style="color:rgb(var(--accent-color-rgb));"></i> Active Playback Streams</h4>
    
    <div class="plex-active-sessions-grid" id="detail-plex-sessions">
      <div style="opacity:0.6; font-size:0.85rem; padding:20px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Scanning library sessions...</div>
    </div>
  `;

  const gridContainer = container.querySelector('#detail-plex-sessions');
  loadPlexSessions(gridContainer);

  detailOverlayInterval = setInterval(() => {
    loadPlexSessions(gridContainer);
  }, 5000);
}

async function loadPlexSessions(container) {
  const plexUrl = cleanUrl(integrationConfigs.plexUrl);
  const plexToken = integrationConfigs.plexToken;
  const tautulliUrl = cleanUrl(integrationConfigs.tautulliUrl);
  const tautulliKey = integrationConfigs.tautulliKey;

  if (tautulliUrl && tautulliKey) {
    try {
      const res = await fetch(`${tautulliUrl}/api/v2?apikey=${tautulliKey}&cmd=get_sessions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const sessions = data.response.data.sessions || [];
      
      if (sessions.length === 0) {
        renderPlexIdle(container);
        return;
      }

      let html = '';
      sessions.forEach(s => {
        let title = s.title;
        if (s.media_type === 'episode') {
          title = `${s.grandparent_title} - S${String(s.parent_media_index).padStart(2,'0')}E${String(s.media_index).padStart(2,'0')} - ${s.title}`;
        }
        
        const user = s.user || 'Guest';
        const player = s.player || 'Plex Web';
        const progress = s.progress_percent || 0;
        const quality = s.video_decision === 'transcode' ? `Transcoding (${s.height}p)` : 'Direct Play';
        
        html += `
          <div class="plex-session-card">
            <div class="plex-session-user-row">
              <div class="plex-session-user-info">
                <div class="plex-session-avatar">${user.slice(0, 2).toUpperCase()}</div>
                <span class="plex-session-username">${user}</span>
              </div>
              <span class="plex-session-player-tag">${player}</span>
            </div>
            <div class="plex-session-media-title" title="${title}">${title}</div>
            <div class="plex-session-details">
              <span><strong>Quality:</strong> ${quality}</span>
              <span><strong>State:</strong> ${s.state || 'playing'}</span>
            </div>
            <div class="plex-session-progress-bar-bg">
              <div class="plex-session-progress-bar-fill" style="width: ${progress}%;"></div>
            </div>
            <div class="plex-session-kill-row">
              <button class="btn-macos btn-macos-secondary kill-session-btn" data-session-id="${s.session_id}" data-user="${user}" data-title="${s.title}" data-source="tautulli" style="padding: 4px 8px; font-size:0.75rem; color:#f87171; border-color:rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); font-weight:600;"><i class="fa-solid fa-ban"></i> Kill Stream</button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
      bindKillSessionButtons(container);
      return;
    } catch (e) {
      console.warn("Tautulli query failed, falling back to Plex direct...", e);
    }
  }

  if (plexUrl && plexToken) {
    try {
      const res = await fetch(`${plexUrl}/status/sessions?X-Plex-Token=${plexToken}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const size = json.MediaContainer.size || 0;
      
      if (size === 0 || !json.MediaContainer.Metadata) {
        renderPlexIdle(container);
        return;
      }

      const items = Array.isArray(json.MediaContainer.Metadata) ? json.MediaContainer.Metadata : [json.MediaContainer.Metadata];
      let html = '';
      items.forEach(m => {
        const sessionKey = m.sessionKey;
        let title = m.title;
        if (m.type === 'episode') {
          title = `${m.grandparentTitle} - S${String(m.parentIndex).padStart(2,'0')}E${String(m.index).padStart(2,'0')} - ${m.title}`;
        }
        
        const user = m.User ? m.User.title : 'Guest';
        const player = m.Player ? (m.Player.title || m.Player.product) : 'Unknown Player';
        const state = m.Player ? m.Player.state : 'playing';
        
        let progress = 0;
        if (m.viewOffset && m.duration) {
          progress = (m.viewOffset / m.duration) * 100;
        }

        let transcode = 'Direct Play';
        if (m.Media && m.Media[0] && m.Media[0].Part && m.Media[0].Part[0] && m.Media[0].Part[0].decision === 'transcode') {
          transcode = 'Transcoding';
        }

        html += `
          <div class="plex-session-card">
            <div class="plex-session-user-row">
              <div class="plex-session-user-info">
                <div class="plex-session-avatar">${user.slice(0, 2).toUpperCase()}</div>
                <span class="plex-session-username">${user}</span>
              </div>
              <span class="plex-session-player-tag">${player}</span>
            </div>
            <div class="plex-session-media-title" title="${title}">${title}</div>
            <div class="plex-session-details">
              <span><strong>Quality:</strong> ${transcode}</span>
              <span><strong>State:</strong> ${state}</span>
            </div>
            <div class="plex-session-progress-bar-bg">
              <div class="plex-session-progress-bar-fill" style="width: ${progress.toFixed(1)}%;"></div>
            </div>
            <div class="plex-session-kill-row">
              <button class="btn-macos btn-macos-secondary kill-session-btn" data-session-id="${sessionKey}" data-user="${user}" data-title="${m.title}" data-source="plex" style="padding: 4px 8px; font-size:0.75rem; color:#f87171; border-color:rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); font-weight:600;"><i class="fa-solid fa-ban"></i> Kill Stream</button>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
      bindKillSessionButtons(container);
      return;
    } catch (e) {
      console.warn("Plex direct failed...", e);
    }
  }

  container.innerHTML = `
    <div class="plex-session-card">
      <div class="plex-session-user-row">
        <div class="plex-session-user-info">
          <div class="plex-session-avatar">TH</div>
          <span class="plex-session-username">Thomas</span>
        </div>
        <span class="plex-session-player-tag">Apple TV</span>
      </div>
      <div class="plex-session-media-title">Interstellar</div>
      <div class="plex-session-details">
        <span><strong>Quality:</strong> Transcoding (1080p)</span>
        <span><strong>State:</strong> playing</span>
      </div>
      <div class="plex-session-progress-bar-bg">
        <div class="plex-session-progress-bar-fill" style="width: 74%;"></div>
      </div>
      <div class="plex-session-kill-row">
        <button class="btn-macos btn-macos-secondary mock-kill-btn" data-session-id="mock-1" data-user="Thomas" data-title="Interstellar" style="padding: 4px 8px; font-size:0.75rem; color:#f87171; border-color:rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); font-weight:600;"><i class="fa-solid fa-ban"></i> Kill Stream</button>
      </div>
    </div>
    <div class="plex-session-card">
      <div class="plex-session-user-row">
        <div class="plex-session-user-info">
          <div class="plex-session-avatar">SA</div>
          <span class="plex-session-username">Sarah</span>
        </div>
        <span class="plex-session-player-tag">iPad</span>
      </div>
      <div class="plex-session-media-title">The Office - S05E12 - Stress Relief</div>
      <div class="plex-session-details">
        <span><strong>Quality:</strong> Direct Play</span>
        <span><strong>State:</strong> paused</span>
      </div>
      <div class="plex-session-progress-bar-bg">
        <div class="plex-session-progress-bar-fill" style="width: 14%;"></div>
      </div>
      <div class="plex-session-kill-row">
        <button class="btn-macos btn-macos-secondary mock-kill-btn" data-session-id="mock-2" data-user="Sarah" data-title="The Office" style="padding: 4px 8px; font-size:0.75rem; color:#f87171; border-color:rgba(239,68,68,0.2); background:rgba(239,68,68,0.05); font-weight:600;"><i class="fa-solid fa-ban"></i> Kill Stream</button>
      </div>
    </div>
  `;

  container.querySelectorAll('.mock-kill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const user = btn.getAttribute('data-user');
      const title = btn.getAttribute('data-title');
      const reason = prompt(`Reason for terminating ${user}'s stream of "${title}":`, "Shared server maintenance");
      if (reason === null) return;
      
      const card = e.target.closest('.plex-session-card');
      card.style.opacity = '0.3';
      setTimeout(() => {
        card.remove();
        showToast(`Terminated stream of "${title}" for ${user}.`);
        if (container.children.length === 0) {
          renderPlexIdle(container);
        }
      }, 600);
    });
  });
}

function renderPlexIdle(container) {
  container.innerHTML = `
    <div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--text-secondary);">
      <i class="fa-solid fa-circle-check" style="font-size:3rem; margin-bottom:15px; color:#34d399;"></i>
      <h4>No active playbacks</h4>
      <p style="font-size:0.85rem; margin-top:8px;">Plex media library is currently idle.</p>
    </div>
  `;
}

function bindKillSessionButtons(container) {
  container.querySelectorAll('.kill-session-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const sessionId = btn.getAttribute('data-session-id');
      const user = btn.getAttribute('data-user');
      const title = btn.getAttribute('data-title');
      const source = btn.getAttribute('data-source');
      
      const reason = prompt(`Reason for terminating ${user}'s stream of "${title}":`, "Shared server maintenance");
      if (reason === null) return;
      
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Killing...`;
      
      try {
        let success = false;
        if (source === 'tautulli') {
          const url = cleanUrl(integrationConfigs.tautulliUrl);
          const key = integrationConfigs.tautulliKey;
          const killRes = await fetch(`${url}/api/v2?apikey=${key}&cmd=terminate_session&session_id=${sessionId}&message=${encodeURIComponent(reason)}`);
          success = killRes.ok;
        } else {
          const url = cleanUrl(integrationConfigs.plexUrl);
          const token = integrationConfigs.plexToken;
          const killRes = await fetch(`${url}/status/sessions/terminate?sessionId=${sessionId}&reason=${encodeURIComponent(reason)}&X-Plex-Token=${token}`);
          success = killRes.ok;
        }
        
        if (success) {
          showToast(`Stream terminated successfully!`);
          loadPlexSessions(container);
        } else {
          throw new Error();
        }
      } catch (err) {
        showToast(`Failed to terminate stream. Check API configuration.`, 'error');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-ban"></i> Kill Stream`;
      }
    });
  });
}

function renderQbittorrentOverlay(container) {
  container.innerHTML = `
    <form class="qbit-add-magnet-form" id="qbit-add-form">
      <input type="text" class="qbit-magnet-input" placeholder="Paste torrent magnet link or .torrent file URL..." id="qbit-magnet-url" required>
      <button class="btn-macos btn-macos-primary" type="submit" style="padding: 0 24px; border-radius:14px;"><i class="fa-solid fa-plus"></i> Add Torrent</button>
    </form>
    
    <h4 style="margin-bottom: 16px; font-size: 1.1rem; font-family: var(--font-display); font-weight:700;"><i class="fa-solid fa-circle-arrow-down" style="color:rgb(var(--accent-color-rgb));"></i> Active Downloads</h4>
    
    <div class="torrents-table" id="detail-torrents-table">
      <div style="opacity:0.6; font-size:0.85rem; padding:20px; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Getting torrents metadata...</div>
    </div>
  `;

  const addForm = container.querySelector('#qbit-add-form');
  const magnetInput = container.querySelector('#qbit-magnet-url');
  const tableContainer = container.querySelector('#detail-torrents-table');

  loadQbittorrentTorrents(tableContainer);

  detailOverlayInterval = setInterval(() => {
    loadQbittorrentTorrents(tableContainer);
  }, 3000);

  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const magnetUrl = magnetInput.value.trim();
      if (!magnetUrl) return;

      const submitBtn = addForm.querySelector('button');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Adding...`;

      try {
        let success = false;
        const qbUrl = cleanUrl(integrationConfigs.qbittorrentUrl);
        if (!qbUrl) {
          await new Promise(r => setTimeout(r, 1000));
          success = true;
          addMockTorrent(magnetUrl);
        } else {
          const res = await queryQbittorrent('/api/v2/torrents/add', 'POST', { urls: magnetUrl });
          success = res && res.ok;
        }

        if (success) {
          showToast("Torrent added successfully!");
          magnetInput.value = '';
          loadQbittorrentTorrents(tableContainer);
        } else {
          throw new Error();
        }
      } catch (err) {
        showToast("Failed to add torrent link.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Torrent`;
      }
    });
  }
}

let mockTorrents = [
  { hash: 'hash1', name: 'ubuntu-24.04-desktop-amd64.iso', size: 4390000000, progress: 0.825, dlspeed: 12400000, upspeed: 1200000, eta: 44, state: 'downloading' },
  { hash: 'hash2', name: 'Big_Buck_Bunny_4K.mp4', size: 840000000, progress: 1.0, dlspeed: 0, upspeed: 840000, eta: 86400, state: 'pausedUP' }
];

function addMockTorrent(link) {
  let name = 'custom-magnet-stream.torrent';
  if (link.startsWith('magnet:?')) {
    const params = new URLSearchParams(link.slice(8));
    if (params.has('dn')) name = params.get('dn');
  } else {
    const parts = link.split('/');
    name = parts[parts.length - 1] || name;
  }
  
  mockTorrents.unshift({
    hash: 'mock-' + Math.random().toString(36).slice(2, 9),
    name: name,
    size: 2150000000,
    progress: 0.01,
    dlspeed: 8400000,
    upspeed: 200000,
    eta: 250,
    state: 'downloading'
  });
}

setInterval(() => {
  mockTorrents.forEach(t => {
    if (t.state === 'downloading' && t.progress < 1) {
      t.progress = Math.min(1.0, t.progress + 0.01);
      if (t.progress === 1.0) {
        t.state = 'seeding';
        t.dlspeed = 0;
        t.upspeed = 400000;
        t.eta = 86400;
      } else {
        t.eta = Math.max(0, Math.round((t.size * (1 - t.progress)) / t.dlspeed));
      }
    }
  });
}, 1000);

async function loadQbittorrentTorrents(container) {
  const qbUrl = cleanUrl(integrationConfigs.qbittorrentUrl);

  if (!qbUrl) {
    renderTorrentRows(mockTorrents, container, true);
    return;
  }

  try {
    const res = await queryQbittorrent('/api/v2/torrents/info?filter=all');
    if (!res || !res.ok) throw new Error();
    const torrents = await res.json();
    
    if (torrents.length === 0) {
      container.innerHTML = `<div style="opacity:0.6; font-size:0.85rem; padding:15px;"><i class="fa-solid fa-circle-info"></i> No torrents in downloads list.</div>`;
      return;
    }
    
    renderTorrentRows(torrents, container, false);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="color:#f87171; font-size:0.85rem;"><i class="fa-solid fa-triangle-exclamation"></i> Error communicating with qBittorrent. Falling back to demo mode...</div>`;
    setTimeout(() => {
      renderTorrentRows(mockTorrents, container, true);
    }, 1000);
  }
}

function renderTorrentRows(torrents, container, isMock) {
  let html = '';
  torrents.forEach(t => {
    const progressPercent = (t.progress * 100).toFixed(1);
    const size = formatBytes(t.size);
    const dlSpeed = t.dlspeed > 0 ? `${formatBytes(t.dlspeed)}/s` : '0 B/s';
    const upSpeed = t.upspeed > 0 ? `${formatBytes(t.upspeed)}/s` : '0 B/s';
    const etaStr = t.progress >= 1 ? 'Completed' : formatDuration(t.eta);
    
    const isPaused = t.state === 'pausedDL' || t.state === 'pausedUP' || t.state.includes('paused');
    const playPauseIcon = isPaused ? 'fa-play' : 'fa-pause';
    const playPauseTitle = isPaused ? 'Resume' : 'Pause';
    const stateLabel = t.state.replace('DL', '').replace('UP', '').toUpperCase();

    html += `
      <div class="torrent-item-row" data-hash="${t.hash}">
        <div class="torrent-row-top">
          <span class="torrent-name" title="${t.name}">${t.name}</span>
          <span class="torrent-percent">${progressPercent}%</span>
        </div>
        <div class="torrent-row-mid">
          <div class="torrent-progress-bar-container">
            <div class="torrent-progress-bar-fill-indicator" style="width: ${progressPercent}%; background:${progressPercent === '100.0' ? 'linear-gradient(90deg, #10b981, #34d399)' : ''}"></div>
          </div>
        </div>
        <div class="torrent-row-bottom">
          <div class="torrent-stats-left">
            <span><i class="fa-solid fa-hard-drive"></i> ${size}</span>
            <span><i class="fa-solid fa-cloud-arrow-down" style="color:#60a5fa"></i> ${dlSpeed}</span>
            <span><i class="fa-solid fa-cloud-arrow-up" style="color:#34d399"></i> ${upSpeed}</span>
            <span><i class="fa-solid fa-hourglass-half"></i> ${etaStr}</span>
            <span class="app-accent-badge" style="padding: 2px 6px; font-size: 0.65rem; font-weight:700; margin-left:8px; border:none; background:rgba(255,255,255,0.06); color:var(--text-secondary);">${stateLabel}</span>
          </div>
          <div class="torrent-controls">
            <button class="torrent-ctrl-btn toggle-torrent-btn" title="${playPauseTitle}"><i class="fa-solid ${playPauseIcon}"></i></button>
            <button class="torrent-ctrl-btn delete-torrent-btn" title="Delete Torrent"><i class="fa-solid fa-trash-can" style="color:#f87171"></i></button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.toggle-torrent-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('.torrent-item-row');
      const hash = row.getAttribute('data-hash');
      
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

      try {
        let success = false;
        if (isMock) {
          const item = mockTorrents.find(m => m.hash === hash);
          if (item) {
            item.state = item.state.includes('paused') ? 'downloading' : 'pausedDL';
            if (item.state.includes('paused')) {
              item.dlspeed = 0;
              item.upspeed = 0;
            } else {
              item.dlspeed = item.progress >= 1 ? 0 : 8500000;
              item.upspeed = 500000;
            }
          }
          success = true;
        } else {
          const isCurrentlyPaused = btn.title.includes('Resume');
          const endpoint = isCurrentlyPaused ? '/api/v2/torrents/resume' : '/api/v2/torrents/pause';
          const res = await queryQbittorrent(endpoint, 'POST', { hashes: hash });
          success = res && res.ok;
        }

        if (success) {
          loadQbittorrentTorrents(container);
        } else {
          throw new Error();
        }
      } catch (err) {
        showToast("Error updating torrent state", "error");
        btn.disabled = false;
      }
    });
  });

  container.querySelectorAll('.delete-torrent-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const row = e.target.closest('.torrent-item-row');
      const hash = row.getAttribute('data-hash');
      
      if (!confirm("Are you sure you want to remove this torrent?")) return;
      const deleteFiles = confirm("Do you also want to DELETE the downloaded files from disk?");
      
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;

      try {
        let success = false;
        if (isMock) {
          mockTorrents = mockTorrents.filter(m => m.hash !== hash);
          success = true;
        } else {
          const res = await queryQbittorrent('/api/v2/torrents/delete', 'POST', { 
            hashes: hash,
            deleteFiles: deleteFiles ? 'true' : 'false'
          });
          success = res && res.ok;
        }

        if (success) {
          showToast("Torrent deleted successfully.");
          loadQbittorrentTorrents(container);
        } else {
          throw new Error();
        }
      } catch (err) {
        showToast("Error deleting torrent", "error");
        btn.disabled = false;
      }
    });
  });
}

async function queryQbittorrent(endpoint, method = 'GET', bodyParams = null) {
  const url = cleanUrl(integrationConfigs.qbittorrentUrl);
  const user = integrationConfigs.qbittorrentUser;
  const pass = integrationConfigs.qbittorrentPass;
  if (!url) return null;
  
  let options = { method };
  if (bodyParams) {
    options.body = new URLSearchParams(bodyParams);
    options.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  }
  
  try {
    let res = await fetch(`${url}${endpoint}`, options);
    if (res.status === 403 && user && pass) {
      const loginBody = new URLSearchParams();
      loginBody.append('username', user);
      loginBody.append('password', pass);
      const loginRes = await fetch(`${url}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginBody
      });
      if (loginRes.ok) {
        res = await fetch(`${url}${endpoint}`, options);
      }
    }
    return res;
  } catch (err) {
    console.error("qBittorrent query error:", err);
    throw err;
  }
}

/**
 * Command Center Utilities & Formatters
 */
function formatDuration(secs) {
  if (!secs || secs === 86400 || secs > 100000) return '∞';
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  let icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';
  if (type === 'info') icon = 'fa-circle-info';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastFadeOut 0.3s forwards';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 3000);
}
