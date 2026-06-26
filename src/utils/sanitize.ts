/**
 * Minimal HTML sanitizer for rendering AniList descriptions (which contain basic
 * HTML like <br>, <i>, <b>, <a>, spoiler <span>). It is SSR-safe (pure string ops,
 * no DOM access). User-generated HTML no longer exists in the app (comments removed),
 * so the trust surface is AniList's API output.
 *
 * NOTE: hardened with DOMPurify in the lint/type-safety phase; this allowlist-strip is
 * intentionally conservative in the meantime.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return (html
    // remove dangerous element blocks entirely
    .replace(
      /<\/?(?:script|style|iframe|object|embed|link|meta|base|form)\b[^>]*>/gi,
      ""
    )
    // strip inline event handlers (onclick=, onerror=, ...)
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // neutralize javascript:/data: URLs in href/src
    .replace(
    /\b(href|src)\s*=\s*(["'])\s*(?:javascript|data|vbscript):[^"']*\2/gi,
    '$1="#"'
  ));
}
