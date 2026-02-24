/**
 * Minimal Node.js server (no deps) for HATA Humanitarian Inc. site.
 * - Serves static files from repo root
 * - Pretty routes for key pages
 * - Small JSON API for "Featured activities"
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;

const PAGE_ROUTES = new Map([
  ["/", "index.html"],
  ["/donate", "donate.html"],
  ["/contact", "Contact.html"],
  ["/partners", "Partners.html"],
  ["/podcasts", "podcasts.html"],
  ["/updates", "updates.html"],
  ["/programs/mental-health", "mental-health-support.html"],
  ["/programs/addiction-recovery", "addiction-recovery.html"],
  ["/programs/newcomer", "newcomer.html"],
  // Back-compat for sitemap / older links
  ["/new-comer", "newcomer.html"],
  ["/new-comer.html", "newcomer.html"],
  ["/partners.html", "Partners.html"],
  ["/contact.html", "Contact.html"],
  ["/podcasts.html", "podcasts.html"],
  ["/updates.html", "updates.html"],
]);

const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".mp4", "video/mp4"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".vtt", "text/vtt; charset=utf-8"],
]);

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(text),
    "Cache-Control": "no-store",
  });
  res.end(text);
}

function redirect(res, location, statusCode = 308) {
  res.writeHead(statusCode, {
    Location: location,
    "Cache-Control": "no-store",
  });
  res.end();
}

function applyBaseHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
}

function readBody(req, { limitBytes = 200_000 } = {}) {
  return new Promise((resolve, reject) => {
    let bytes = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > limitBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function safeResolvePath(urlPathname) {
  const decodedPath = decodeURIComponent(urlPathname);
  const normalized = path.normalize(decodedPath).replace(/^([/\\])+/, "");
  const resolved = path.resolve(ROOT_DIR, normalized);
  if (!resolved.startsWith(ROOT_DIR)) return null;
  return resolved;
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function serveFile(req, res, absoluteFilePath) {
  const ext = path.extname(absoluteFilePath).toLowerCase();
  const contentType = CONTENT_TYPES.get(ext) || "application/octet-stream";

  try {
    const stat = fs.statSync(absoluteFilePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      // Cache static assets a bit; HTML is kept no-cache by default elsewhere.
      "Cache-Control":
        ext === ".html" ? "no-store" : "public, max-age=3600, stale-while-revalidate=600",
    });
    fs.createReadStream(absoluteFilePath).pipe(res);
  } catch (err) {
    // Log the error for debugging
    console.error("Error serving file:", err);
    sendText(res, 500, "Server error");
  }
}

function getFeaturedActivities() {
  const dataPath = path.join(ROOT_DIR, "data", "featured-activities.json");
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const now = new Date();

    const withComputed = items
      .map((item) => {
        const date = item.date ? new Date(item.date) : null;
        const isValidDate = date && !Number.isNaN(date.valueOf());
        const isUpcoming = isValidDate ? date >= now : false;
        return {
          ...item,
          isUpcoming,
        };
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).valueOf() : 0;
        const db = b.date ? new Date(b.date).valueOf() : 0;
        return db - da;
      });

    return withComputed;
  } catch {
    return [];
  }
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { status: "ok" });
  }

  if (req.method === "GET" && url.pathname === "/api/featured-activities") {
    const type = url.searchParams.get("type");
    const items = getFeaturedActivities();
    const filtered = type ? items.filter((i) => String(i.type).toLowerCase() === String(type).toLowerCase()) : items;
    return sendJson(res, 200, { items: filtered.slice(0, 12) });
  }

  if (req.method === "POST" && url.pathname === "/api/contact") {
    try {
      const body = await readBody(req);
      const payload = JSON.parse(body || "{}");
      const name = String(payload.name || "").trim();
      const email = String(payload.email || "").trim();
      const message = String(payload.message || "").trim();

      if (!name || !email || !message) {
        return sendJson(res, 400, { status: "error", message: "Please provide name, email, and message." });
      }

      // For now: log the message. Swap this out for an email provider later.
      // eslint-disable-next-line no-console
      console.log("[contact]", { name, email, message });

      return sendJson(res, 200, { status: "success", message: "Thanks — we received your message." });
    } catch {
      return sendJson(res, 400, { status: "error", message: "Invalid request body." });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/donate/create-checkout-session") {
    return sendJson(res, 501, {
      status: "error",
      message: "Donations endpoint is not configured yet. Please use the Donate page options for now.",
    });
  }

  return sendJson(res, 404, { status: "error", message: "Not found" });
}

const server = http.createServer(async (req, res) => {
  applyBaseHeaders(res);

  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url);
  }

  // Normalize trailing slashes for page routes (e.g. /podcasts/ -> /podcasts)
  if (req.method === "GET" && url.pathname.length > 1 && url.pathname.endsWith("/")) {
    const normalized = url.pathname.replace(/\/+$/, "");
    if (PAGE_ROUTES.has(normalized)) {
      return redirect(res, normalized);
    }
  }

  // Pretty page routes
  if (req.method === "GET" && PAGE_ROUTES.has(url.pathname)) {
    const fileName = PAGE_ROUTES.get(url.pathname);
    return serveFile(req, res, path.join(ROOT_DIR, fileName));
  }

  // Extensionless convenience: /podcasts -> podcasts.html (if it exists on disk)
  if (req.method === "GET" && !path.extname(url.pathname)) {
    const asHtml = path.join(ROOT_DIR, `${url.pathname.replace(/^\/+/, "")}.html`);
    if (fileExists(asHtml)) {
      return serveFile(req, res, asHtml);
    }
  }

  // Serve static files from disk
  if (req.method === "GET") {
    const resolved = safeResolvePath(url.pathname);
    if (resolved && fileExists(resolved)) {
      return serveFile(req, res, resolved);
    }
  }

  // Fallback 404
  sendText(res, 404, "Not Found");
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    // eslint-disable-next-line no-console
    console.error(
      [
        `Port ${PORT} is already in use, so the website server cannot start.`,
        `Find what's using it: netstat -ano | findstr ":${PORT}"`,
        `Then stop that process/service and re-run: node server.js`,
      ].join("\n")
    );
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
