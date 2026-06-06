export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Standard CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    // Endpoint: GET /roadmap
    if (url.pathname === "/roadmap") {
      try {
        const cached = await env.M365_CACHE.get("roadmap");
        if (cached) {
          return new Response(cached, {
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
              "X-Cache": "HIT",
              ...corsHeaders
            }
          });
        }
        // Cache miss: fetch live, store it, and return
        return fetchAndCacheRoadmap(env, corsHeaders);
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // Endpoint: GET /azure-status
    if (url.pathname === "/azure-status") {
      try {
        const cached = await env.M365_CACHE.get("azure-status");
        if (cached) {
          return new Response(cached, {
            headers: {
              "Content-Type": "application/rss+xml; charset=utf-8",
              "X-Cache": "HIT",
              ...corsHeaders
            }
          });
        }
        // Cache miss: fetch live, store it, and return
        return fetchAndCacheAzureStatus(env, corsHeaders);
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    // Endpoint: GET /health
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "healthy", version: "1.0.0" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },

  // Triggered by the Cloudflare Cron Trigger (every 4 hours)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.all([
      fetchAndCacheRoadmap(env),
      fetchAndCacheAzureStatus(env)
    ]));
  }
};

async function fetchAndCacheRoadmap(env, corsHeaders = {}) {
  const feedUrl = 'https://www.microsoft.com/releasecommunications/api/v2/m365/rss';
  
  // Set standard browser User-Agent headers to bypass Akamai blocking cloud IPs
  const res = await fetch(feedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }
  });

  if (!res.ok) {
    throw new Error(`Microsoft Roadmap feed returned HTTP ${res.status}`);
  }

  const xml = await res.text();
  if (xml && xml.includes('<item>')) {
    await env.M365_CACHE.put("roadmap", xml);
  } else {
    throw new Error("Invalid or empty feed data received from Microsoft");
  }

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "X-Cache": "MISS",
      ...corsHeaders
    }
  });
}

async function fetchAndCacheAzureStatus(env, corsHeaders = {}) {
  const feedUrl = 'https://azure.status.microsoft/en-us/status/feed/';
  
  const res = await fetch(feedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!res.ok) {
    throw new Error(`Azure Status feed returned HTTP ${res.status}`);
  }

  const xml = await res.text();
  if (xml && xml.includes('<channel>')) {
    await env.M365_CACHE.put("azure-status", xml);
  } else {
    throw new Error("Invalid or empty feed data received from Azure Status");
  }

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "X-Cache": "MISS",
      ...corsHeaders
    }
  });
}
