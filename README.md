# 🌌 Premium Personalized Landing Page & Dashboard

A premium, glassmorphic launchpad and productivity dashboard designed for tracking personal projects, quick bookmarks, and system metrics. Built entirely with clean **Vanilla HTML5, CSS3, and JavaScript**, it mimics a high-end macOS top-bar menu and an iPadOS-style desktop widget environment with extensive live customization.

---

## ✨ Key Features

### 🖥️ macOS Top Bar & iPadOS Desktop
* **macOS Top Menu Bar**: Translucent blur-filtered menu bar with a live synchronized time and date indicator.
* **Apple Squircle Icon Design**: Generic application icons with a smooth 22% squircle radius, color-matching linear gradients, and radial cursor tracking reflection glows.
* **Interactive Mesh Gradients**: Three floating backdrop blobs that animate dynamically and shift based on the selected workspace style.
* **Dock Shortcuts**: Standard macOS-style bottom dock with interactive fisheye scaling and tooltips.

### ⚙️ Live Layout Customization Engine
* **Dynamic Grid Options**: Custom grid layout reflow configurations (Auto-fit, 2, 3, or 4 columns) and adjustable spacing gaps (Tight, Comfortable, Spacious).
* **Sidebar Layout Modes**: Reposition the widgets grid to the **Right**, **Left**, **Top**, or **Hide** it completely.
* **Individual Spanning & Sizing**: Override app card configurations individually to span **1 to 4 columns** wide and **1 to 2 rows** tall, along with card scale overrides (Compact, Balanced, Expanded).
* **HTML5 Drag-and-Drop Reordering**: Enter "Edit Workspace" mode to drag, drop, and rearrange app cards and widgets. All positions are saved in real-time.

### 🎛️ Dynamic Widget Catalog
Click **Add Widget** in Edit Mode to build a customized workspace with multiple instances of any widget:
1. **🕒 Clock**: Display current time (Hours:Mins:Secs) and long date formats.
2. **📝 Notepad**: Translucent textarea notes dashboard that auto-saves to LocalStorage.
3. **🎨 Workspace Style**: Swappable preset themes (Midnight Nebula, Aurora Borealis, Solar Eclipse, Cyberpunk).
4. **🌤️ Weather Forecast**: Morphs backgrounds and icons depending on the selected city and forecast conditions.
5. **🧠 Resource Monitor**: Mock animated gauges showing circular SVG metric rings for CPU, RAM, and Network traffic.
6. **🔖 Quick Bookmarks**: Bookmark manager with automatic Google favicon fetch and CRUD capability.
7. **✅ To-Do Checklist**: Checklist where clicking tasks toggles completion with a visual strike-through line.
8. **⏱️ Countdown Timer**: Counts down to a configured date/time in Days, Hours, Mins, and Secs.
9. **🖼️ Iframe Embed**: Embed internal dashboard tools or web links with custom heights.
10. **🧮 Calculator**: A fully operational, responsive glassmorphic iOS-style pocket calculator.

### ⌨️ Keyboard Accessibility
* Press `/` or `Ctrl + K` to focus the search bar.
* Use `Arrow Up` and `Arrow Down` keys to navigate search results.
* Press `Enter` to launch the highlighted application card.
* Press `Escape` to clear search filters and blur focus.

---

## 🛠️ Technology Stack
* **Markup**: Semantic HTML5
* **Styling**: Vanilla CSS3 (Custom variables, glassmorphism filters, grid systems, wiggling animations)
* **Logic**: Vanilla ES6+ JavaScript (State persistence, drag-and-drop API, timers, mathematical registers)
* **Assets**: FontAwesome Free Icons, Google Fonts (Outfit & Inter)

---

## 🚀 Getting Started & Local Setup

Since this dashboard is 100% self-contained and client-side, setup is instant:

1. Clone this repository:
   ```bash
   git clone https://github.com/Thomasrobb5/Personalized-Landing-Page.git
   ```
2. Open `index.html` in your favorite web browser, or launch it with a local server tool like Visual Studio Code's **Live Server** extension (`http://127.0.0.1:5500`).
3. Turn on **Edit Workspace** in the top menu bar to begin adding custom links, resizing items, or reordering widgets.

---

## 🌐 Deploying to Cloudflare Pages

To deploy this landing page as a live, secure private or public website:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Pages**.
2. Click **Connect to git** and select this repository.
3. Use the following build settings:
   * **Framework preset**: `None`
   * **Build command**: *Leave blank*
   * **Build output directory**: *Leave blank or use `./`*
4. Click **Save and Deploy**. Cloudflare will automatically build and sync the site whenever you push changes to your `main` branch.
