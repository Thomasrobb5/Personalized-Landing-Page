# Cloudflare Worker Caching Proxy Setup

This Cloudflare Worker fetches the Microsoft 365 Roadmap RSS feed and the Azure Status RSS feed, caches them inside a Cloudflare KV namespace, and exposes CORS-enabled endpoints for the Landing Page dashboard.

A Cron Trigger is configured to automatically refresh the cache **every 4 hours**, bypassing CDN rate-limits and Akamai blocks, while maximizing load speed for the frontend.

## Prerequisites

1. Install Node.js if you haven't already.
2. Sign in to your Cloudflare account.

## Setup Instructions

### 1. Install Wrangler CLI
Run the following command to install the Cloudflare Wrangler CLI globally (or run using `npx`):
```bash
npm install -g wrangler
```

### 2. Log in to Cloudflare
Authenticate Wrangler with your Cloudflare account:
```bash
wrangler login
```

### 3. Create the KV Namespace
Create the KV database namespace required for caching the feeds:
```bash
wrangler kv:namespace create M365_CACHE
```
This command will output details resembling the following:
```toml
[[kv_namespaces]]
binding = "M365_CACHE"
id = "a1b2c3d4e5f6g7h8i9j0"
```

### 4. Configure wrangler.toml
Open `wrangler.toml` inside this directory and replace the KV namespace ID with the ID returned in the previous step:
```toml
[[kv_namespaces]]
binding = "M365_CACHE"
id = "PASTE_YOUR_KV_NAMESPACE_ID_HERE"
```

### 5. Deploy the Worker
Run the deployment command:
```bash
wrangler deploy
```
Once deployed, Cloudflare will output the live URL of your worker, for example:
`https://m365-status-proxy.your-subdomain.workers.dev`

### 6. Integrate with Landing Page
1. Copy the deployed worker URL.
2. Open your Landing Page, click **Workspace Settings** (gear icon) -> **Integrations** tab.
3. Paste the URL into the **Cloudflare Worker Proxy** input field.
4. Click **Test Connection** to confirm a successful connection.
5. Click **Save Settings**. Your widgets will now query the worker and load instantly!
