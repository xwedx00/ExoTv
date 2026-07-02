import { MANGA } from "@consumet/extensions";
import type { Chapter, ImageSource } from "@/types";
import { cached } from "./cache";

/**
 * In-app manga source backend — MangaDex (official, reliable, CORS-friendly).
 * AniList provides the catalog/metadata; we resolve the matching MangaDex entry
 * by title, then read chapters/pages from it.
 */
const client = () => new MANGA.MangaDex();

async function getAniListTitle(id: string | number): Promise<string> {
  try {
    const query = `query($id:Int){Media(id:$id,type:MANGA){title{english romaji userPreferred}}}`;
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ query, variables: { id: Number(id) } }),
    });
    const json = await res.json();
    const t = json?.data?.Media?.title;
    return t?.english || t?.romaji || t?.userPreferred || "";
  } catch {
    return "";
  }
}

function toChapters(info: any, mangaId: string): Chapter[] {
  return (info?.chapters ?? []).map(
    (ch: any): Chapter => ({
      name: String(ch.chapterNumber ?? ch.title ?? ""),
      title: ch.title ?? undefined,
      sourceId: "mangadex",
      sourceChapterId: String(ch.id),
      sourceMediaId: mangaId,
      slug: `mangadex__${ch.id}`,
      source: {
        id: "mangadex",
        name: "MangaDex",
        locales: [],
        isCustomSource: false,
      },
      published: true,
      images: [],
    })
  );
}

/** Resolve an AniList manga id (optionally with a known title) to its chapter list. */
export async function getChapters(
  anilistId: string | number,
  title?: string
): Promise<Chapter[]> {
  return cached(
    `ch:${anilistId}`,
    60 * 60 * 1000,
    async () => {
      const search = title || (await getAniListTitle(anilistId));
      if (!search) return [];

      const manga = client();
      const results = await manga.search(search);
      const best = results?.results?.[0];
      if (!best) return [];

      const info = await manga.fetchMangaInfo(best.id);
      // MangaDex returns newest-first; present ascending like the rest of the app.
      return toChapters(info, String(anilistId)).reverse();
    },
    (chapters) => chapters.length > 0
  );
}

/** Read the page images for a MangaDex chapter id. */
export async function getChapterImages(
  chapterId: string
): Promise<ImageSource[]> {
  const pages = await client().fetchChapterPages(chapterId);
  return (pages ?? [])
    .filter((p: any) => typeof p?.img === "string")
    .map((p: any): ImageSource => ({ image: p.img, useProxy: false }));
}
