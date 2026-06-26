import type { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";

/**
 * In-app CORS / HLS proxy (replaces the former external requests-proxy).
 *
 * - Adds permissive CORS so the browser player can read cross-origin streams.
 * - Injects upstream headers (Referer/Origin/User-Agent) to bypass hotlink checks.
 * - For .m3u8 playlists, rewrites segment + key + variant URIs to route back
 *   through this proxy so every sub-request carries the same headers.
 *
 * Query: ?url=<encoded absolute url>&headers=<encoded JSON of request headers>
 */
export const config = {
  api: { responseLimit: false, bodyParser: false },
};

function parseHeaders(raw: unknown): Record<string, string> {
  if (typeof raw !== "string" || !raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const toAbsolute = (u: string, base: URL): string => {
  try {
    return new URL(u, base).toString();
  } catch {
    return u;
  }
};

const proxify = (u: string, headers: Record<string, string>): string =>
  `/api/proxy?url=${encodeURIComponent(u)}&headers=${encodeURIComponent(
    JSON.stringify(headers)
  )}`;

function rewriteM3U8(
  body: string,
  sourceUrl: string,
  headers: Record<string, string>
): string {
  const base = new URL(sourceUrl);
  return body
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return line;
      if (trimmed.startsWith("#")) {
        // rewrite URI="..." inside tags (EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP)
        return line.replace(
          /URI="([^"]+)"/g,
          (_m, uri) => `URI="${proxify(toAbsolute(uri, base), headers)}"`
        );
      }
      // a segment or variant playlist line
      return proxify(toAbsolute(trimmed, base), headers);
    })
    .join("\n");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  let url = req.query.url;
  // hls.js can re-resolve our already-proxied URLs into double-proxied requests
  // (/api/proxy?url=/api/proxy?url=...). Unwrap to the real upstream target.
  while (typeof url === "string" && url.startsWith("/api/proxy")) {
    const qs = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
    const inner = new URLSearchParams(qs).get("url");
    if (!inner) break;
    url = inner;
  }
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    res.status(400).json({ error: "Invalid or missing url" });
    return;
  }
  const headers = parseHeaders(req.query.headers);

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          headers["User-Agent"] ??
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        ...headers,
      },
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const isPlaylist =
      url.split("?")[0].endsWith(".m3u8") ||
      contentType.includes("mpegurl") ||
      contentType.includes("vnd.apple");

    if (isPlaylist) {
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "no-store");
      res.send(rewriteM3U8(text, url, headers));
      return;
    }

    res.status(upstream.status);
    if (contentType) res.setHeader("Content-Type", contentType);
    const len = upstream.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);
    res.setHeader("Cache-Control", "public, max-age=86400");

    if (upstream.body) {
      Readable.fromWeb(upstream.body as any).pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    res.status(502).json({ error: "Proxy fetch failed", detail: String(err?.message ?? err) });
  }
}
