import { ANIME, META } from "@consumet/extensions";
import type { Episode, Subtitle, VideoSource } from "@/types";
import { cached } from "./cache";

/**
 * In-app anime source backend.
 *
 * Uses Consumet's META.Anilist (keeps AniList metadata + auto-maps to a streaming
 * provider). Providers are fragile/region-dependent (sites go down, get DMCA'd),
 * so we try a prioritized list until one responds — this is the "multi-server"
 * resilience. The chosen provider is encoded in each Episode's `sourceId` so the
 * matching provider is used when fetching that episode's stream.
 */

export type ProviderId =
  | "hianime"
  | "animeunity"
  | "animesaturn"
  | "animepahe"
  | "animekai";

const FACTORIES: Record<ProviderId, () => any> = {
  hianime: () => new ANIME.Hianime(),
  animeunity: () => new ANIME.AnimeUnity(),
  animesaturn: () => new ANIME.AnimeSaturn(),
  animepahe: () => new ANIME.AnimePahe(),
  animekai: () => new ANIME.AnimeKai(),
};

const LABELS: Record<ProviderId, string> = {
  hianime: "HiAnime",
  animeunity: "AnimeUnity",
  animesaturn: "AnimeSaturn",
  animepahe: "AnimePahe",
  animekai: "AnimeKai",
};

/** Priority order; override with env ANIME_PROVIDERS="animeunity,hianime,...". */
export const PROVIDER_ORDER: ProviderId[] =
  (process.env.ANIME_PROVIDERS?.split(",").map((s) => s.trim()) as ProviderId[])?.filter(
    (p) => p in FACTORIES
  ) ?? ["hianime", "animeunity", "animesaturn", "animepahe", "animekai"];

export const providers = (Object.keys(FACTORIES) as ProviderId[]).map((id) => ({
  id,
  name: LABELS[id],
}));

const isProvider = (p: string): p is ProviderId => p in FACTORIES;

function clientFor(provider: ProviderId) {
  return new META.Anilist(FACTORIES[provider]());
}

function withTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

function toEpisodes(info: any, provider: ProviderId): Episode[] {
  return (info?.episodes ?? []).map(
    (ep: any): Episode => ({
      name: String(ep.number ?? ep.title ?? ""),
      title: ep.title ?? undefined,
      thumbnail: ep.image ?? undefined,
      sourceId: provider,
      sourceEpisodeId: String(ep.id),
      sourceMediaId: String(info.id),
      slug: `${provider}__${ep.id}`,
      section: "",
      published: true,
      source: {
        id: provider,
        name: LABELS[provider],
        locales: [],
        isCustomSource: false,
      },
    })
  );
}

/** Try providers in order (preferred first) until one returns a non-empty episode list. */
export async function getEpisodes(
  anilistId: string | number,
  preferred?: string
): Promise<Episode[]> {
  return cached(
    `eps:${anilistId}:${preferred ?? "auto"}`,
    60 * 60 * 1000,
    async () => {
      const order =
        preferred && isProvider(preferred)
          ? [preferred, ...PROVIDER_ORDER.filter((p) => p !== preferred)]
          : PROVIDER_ORDER;

      for (const provider of order) {
        try {
          const info = await withTimeout(
            clientFor(provider).fetchAnimeInfo(String(anilistId))
          );
          const episodes = toEpisodes(info, provider);
          if (episodes.length) return episodes;
        } catch {
          // provider down / no match — try the next one
        }
      }
      return [];
    },
    (episodes) => episodes.length > 0
  );
}

const isValidUrl = (u: unknown): u is string =>
  typeof u === "string" && /^https?:\/\//.test(u) && !u.includes(".replace(");

function toSources(data: any): {
  sources: VideoSource[];
  subtitles: Subtitle[];
  fonts: never[];
  intro: { start: number; end: number } | null;
  outro: { start: number; end: number } | null;
} {
  const headers: Record<string, string> = data?.headers ?? {};
  const sources: VideoSource[] = (data?.sources ?? [])
    .filter((s: any) => isValidUrl(s?.url))
    .map((s: any) => ({
      file: s.url,
      label: s.quality ?? "default",
      // Always proxy: handles CORS + any hotlink Referer/Origin the source needs.
      useProxy: true,
      proxy: { appendReqHeaders: headers },
    }));

  const subtitles: Subtitle[] = (data?.subtitles ?? [])
    .filter(
      (s: any) =>
        isValidUrl(s?.url) && (s.lang ?? "").toLowerCase() !== "thumbnails"
    )
    .map((s: any) => ({
      file: s.url,
      lang: s.lang ?? "Unknown",
      language: s.lang ?? "Unknown",
    }));

  // AniSkip-style intro/outro times (e.g. from HiAnime/Zoro) drive the player's
  // Skip Intro / Skip Outro buttons. Not every provider returns them.
  const seg = (s: any) =>
    s && typeof s.start === "number" && typeof s.end === "number" && s.end > s.start
      ? { start: s.start, end: s.end }
      : null;

  return {
    sources,
    subtitles,
    fonts: [],
    intro: seg(data?.intro),
    outro: seg(data?.outro),
  };
}

/** Fetch the stream sources for a provider-specific episode id. */
export async function getSources(
  episodeId: string,
  provider: string
): Promise<{
  sources: VideoSource[];
  subtitles: Subtitle[];
  fonts: never[];
  intro: { start: number; end: number } | null;
  outro: { start: number; end: number } | null;
}> {
  if (!isProvider(provider))
    return { sources: [], subtitles: [], fonts: [], intro: null, outro: null };
  const data = await withTimeout(
    clientFor(provider).fetchEpisodeSources(episodeId),
    20000
  );
  return toSources(data);
}
