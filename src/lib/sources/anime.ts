import type { Episode, Subtitle, VideoSource } from "@/types";
import { anilistFetcher } from "@/services/anilist";
import { cached } from "./cache";

/**
 * In-app anime source backend — JustAnime's backend (core.justanime.to).
 *
 * ⚠️  HONEST CAVEAT: this rides JustAnime's PRIVATE backend + the AnimePahe
 * (owocdn/kwik) and mewstream CDNs. It works only because we send the `Origin`
 * header their allowlist expects (done server-side here). It is FRAGILE — if
 * they rotate the allowlist or add auth, it breaks and the watch page shows
 * "no source". Self-host / personal use only.
 *
 * core.justanime.to is AniList-keyed, and ExoTv's metadata is AniList, so the
 * `anilistId` passed in maps directly — no id translation needed.
 *   GET /api/anime/{anilistId}/episodes              -> episode list (by number)
 *   GET /api/watch/{anilistId}/episode/{n}/{provider} -> { sub, dub } HLS sources
 * Raw m3u8 (owocdn/mewstream) is Referer-walled, so each VideoSource carries the
 * provider's Referer in `proxy.appendReqHeaders` and is served via /api/proxy.
 */

const CORE = "https://core.justanime.to/api";
const ORIGIN = "https://justanime.to";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export type ProviderId = "megaplay" | "animepahe" | "miruro";

const LABELS: Record<ProviderId, string> = {
  megaplay: "MegaPlay",
  animepahe: "AnimePahe",
  miruro: "Miruro",
};

// Referer each provider's CDN requires to serve the raw m3u8/segments.
const PROVIDER_REFERER: Record<string, string> = {
  megaplay: "https://megaplay.buzz/",
  animepahe: "https://kwik.cx/",
  miruro: "https://kwik.cx/",
};

/** Priority order; megaplay first (carries soft subs + intro/outro skip). */
export const PROVIDER_ORDER: ProviderId[] =
  (process.env.ANIME_PROVIDERS?.split(",").map((s) => s.trim()) as ProviderId[])?.filter(
    (p) => p in LABELS
  ) ?? ["megaplay", "animepahe", "miruro"];

export const providers = (Object.keys(LABELS) as ProviderId[]).map((id) => ({
  id,
  name: LABELS[id],
}));

const isProvider = (p: string): p is ProviderId => p in LABELS;

const isValidUrl = (u: unknown): u is string =>
  typeof u === "string" && /^https?:\/\//.test(u);

async function coreFetch(path: string) {
  const res = await fetch(`${CORE}${path}`, {
    headers: { Origin: ORIGIN, Referer: `${ORIGIN}/`, "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`core.justanime ${res.status} for ${path}`);
  return res.json();
}

// Build the /api/proxy url for a referer-walled asset (same shape proxy.ts emits).
const proxify = (url: string, headers: Record<string, string>) =>
  `/api/proxy?url=${encodeURIComponent(url)}&headers=${encodeURIComponent(
    JSON.stringify(headers)
  )}`;

// Strip a leading "Episode N - " / "Episode N: " from AniList streamingEpisodes
// titles so the card shows the actual episode name.
const cleanEpTitle = (t: string | undefined, n: number) =>
  (t || "").replace(/^\s*episode\s*\d+\s*[-:.]?\s*/i, "").trim() || `Episode ${n}`;

// Episode LIST comes from AniList (reliable + rich: title + thumbnail), keyed by
// number; the streaming SOURCE for a number is fetched from JustAnime later in
// getSources. So the guide stays intact even when the stream provider is down.
const EPISODES_QUERY = `query($id:Int){Media(id:$id,type:ANIME){episodes streamingEpisodes{title thumbnail}}}`;

/** Episode list for an AniList id (provider baked into each episode's sourceId). */
export async function getEpisodes(
  anilistId: string | number,
  preferred?: string
): Promise<Episode[]> {
  const provider: ProviderId =
    preferred && isProvider(preferred) ? preferred : "megaplay";
  return cached(
    `eps:${anilistId}:${provider}`,
    60 * 60 * 1000,
    async () => {
      const data = await anilistFetcher<any>(EPISODES_QUERY, {
        id: Number(anilistId),
      }).catch(() => null);
      const media = data?.Media;
      const streamEps: any[] = media?.streamingEpisodes || [];
      const count = Math.max(media?.episodes || 0, streamEps.length);
      if (!count) return [];
      return Array.from({ length: count }, (_, i): Episode => {
        const num = i + 1;
        const se = streamEps[i];
        return {
          name: String(num),
          title: cleanEpTitle(se?.title, num),
          thumbnail: se?.thumbnail || undefined,
          sourceId: provider,
          sourceEpisodeId: `${anilistId}:${num}`,
          sourceMediaId: String(anilistId),
          slug: `${provider}__${anilistId}_${num}`,
          section: "",
          published: true,
          source: {
            id: provider,
            name: LABELS[provider],
            locales: [],
            isCustomSource: false,
          },
        };
      });
    },
    (episodes) => episodes.length > 0
  );
}

const seg = (s: any) =>
  s && typeof s.start === "number" && typeof s.end === "number" && s.end > s.start
    ? { start: s.start, end: s.end }
    : null;

function toSources(block: any, provider: ProviderId) {
  const referer = PROVIDER_REFERER[provider] || "";
  const headers = referer ? { Referer: referer } : {};

  const sources: VideoSource[] = (block?.sources ?? [])
    .filter((s: any) => isValidUrl(s?.url))
    .map((s: any) => ({
      file: s.url,
      label: s.quality ?? "default",
      // Raw m3u8 is Referer-walled → always proxy with the provider's Referer.
      useProxy: true,
      proxy: { appendReqHeaders: headers },
    }));

  const subtitles: Subtitle[] = (block?.subtitles ?? [])
    .filter(
      (s: any) =>
        isValidUrl(s?.file) && (s.kind ?? "").toLowerCase() !== "thumbnails"
    )
    .map((s: any) => ({
      // subtitle files can be hotlink-walled too → serve them via the proxy.
      file: proxify(s.file, headers),
      lang: s.label ?? s.lang ?? "English",
      language: s.label ?? s.lang ?? "English",
    }));

  return {
    sources,
    subtitles,
    fonts: [] as never[],
    intro: seg(block?.intro),
    outro: seg(block?.outro),
  };
}

/** Stream sources for a "{anilistId}:{episodeNumber}" id on a given provider. */
export async function getSources(episodeId: string, provider: string) {
  const empty = {
    sources: [],
    subtitles: [],
    fonts: [] as never[],
    intro: null,
    outro: null,
  };
  if (!isProvider(provider)) return empty;
  const [anilistId, number] = String(episodeId).split(":");
  if (!anilistId || !number) return empty;

  const data = await coreFetch(
    `/watch/${anilistId}/episode/${number}/${provider}`
  ).catch(() => null);
  // default to sub; dub can be wired later via a type param.
  const block = data?.sub || data;
  if (!block?.sources?.length) return empty;
  return toSources(block, provider);
}
