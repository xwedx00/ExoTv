//@ts-nocheck
import Image from "@/components/shared/Image";
import RangePicker from "@/components/shared/RangePicker";
import { fetchSourceData, sourceQueryKey } from "@/hooks/useFetchSource";
import { Media } from "@/types/anilist";
import { createMediaDetailsUrl } from "@/utils";
import { getTitle } from "@/utils/data";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const PROVIDER = "megaplay";
const CHUNK = 100;
const SEASON_FORMATS = ["TV", "TV_SHORT", "ONA", "OVA"];

const cleanTitle = (t: string | undefined, n: number) =>
  (t || "").replace(/^\s*episode\s*\d+\s*[-:.]?\s*/i, "").trim() || `Episode ${n}`;

/**
 * Episode guide on the anime details page (above the Character Section).
 *
 * - LIST from AniList (`streamingEpisodes` + episode count), keyed by number;
 *   JustAnime is used only for the per-number stream in getSources.
 * - SEASONS: prequel/sequel TV relations (+ the current entry) as a selector.
 * - RANGE picker chunks long shows so the list is never one infinite scroll.
 * - Hovering an episode prefetches its sources into the watch page's cache.
 */
const EpisodesSection: React.FC<{ anime: Media }> = ({ anime }) => {
  const queryClient = useQueryClient();
  const { locale } = useRouter();
  const id = anime?.id;
  const [range, setRange] = useState(0);

  const episodes = useMemo(() => {
    const streamEps = (anime as any)?.streamingEpisodes || [];
    const count = Math.max(anime?.episodes || 0, streamEps.length);
    if (!count) return [];
    return Array.from({ length: count }, (_, i) => {
      const num = i + 1;
      const se = streamEps[i];
      return {
        number: num,
        title: cleanTitle(se?.title, num),
        thumbnail: se?.thumbnail || anime?.coverImage?.extraLarge || null,
      };
    });
  }, [anime]);

  // Seasons from prequel/sequel TV relations, plus the current entry, ordered by year.
  const seasons = useMemo(() => {
    const edges = (anime as any)?.relations?.edges || [];
    const related = edges
      .filter(
        (e: any) =>
          ["PREQUEL", "SEQUEL"].includes(e.relationType) &&
          e.node?.type === "ANIME" &&
          SEASON_FORMATS.includes(e.node?.format)
      )
      .map((e: any) => ({ ...e.node, isCurrent: false }));
    if (!related.length) return [];
    const current = {
      id: anime.id,
      type: "ANIME",
      title: anime.title,
      format: anime.format,
      seasonYear: anime.seasonYear,
      coverImage: anime.coverImage,
      isCurrent: true,
    };
    return [...related, current].sort(
      (a, b) => (a.seasonYear || 9999) - (b.seasonYear || 9999)
    );
  }, [anime]);

  const prefetch = (num: number) => {
    const sourceEpisodeId = `${id}:${num}`;
    queryClient.prefetchQuery({
      queryKey: [sourceQueryKey(PROVIDER, sourceEpisodeId)],
      queryFn: () => fetchSourceData(sourceEpisodeId, PROVIDER),
      staleTime: 1000 * 60,
    });
  };

  // Warm episode 1 (the "Watch Now" target) once idle, so the primary path is instant.
  useEffect(() => {
    if (!id || !episodes.length) return;
    const t = setTimeout(() => prefetch(1), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, episodes.length]);

  useEffect(() => setRange(0), [id]);

  const visibleEpisodes = useMemo(
    () => episodes.slice(range * CHUNK, range * CHUNK + CHUNK),
    [episodes, range]
  );

  if (!episodes.length && !seasons.length) return null;

  return (
    <div className="space-y-5">
      {seasons.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Seasons
          </h3>
          <div className="flex flex-wrap gap-2">
            {seasons.map((s: any) => (
              <Link
                key={s.id}
                href={createMediaDetailsUrl(s)}
                className={classNames(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                  s.isCurrent
                    ? "bg-primary-600 text-white"
                    : "bg-white/5 text-gray-200 ring-1 ring-white/10 hover:bg-white/10"
                )}
              >
                <span className="line-clamp-1 max-w-[200px]">
                  {getTitle(s, locale)}
                </span>
                {s.seasonYear ? (
                  <span className="text-xs opacity-70">{s.seasonYear}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      )}

      {episodes.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">
              Episodes{" "}
              <span className="text-lg text-gray-500">({episodes.length})</span>
            </h2>
            <RangePicker
              total={episodes.length}
              chunkSize={CHUNK}
              value={range}
              onChange={setRange}
            />
          </div>

          <div className="grid max-h-[660px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {visibleEpisodes.map((ep) => (
              <Link
                key={ep.number}
                href={`/anime/watch/${id}/${PROVIDER}/${id}:${ep.number}`}
                onMouseEnter={() => prefetch(ep.number)}
                onFocus={() => prefetch(ep.number)}
                className="group flex gap-3 rounded-xl bg-background-800 p-2 ring-1 ring-white/5 transition hover:bg-background-700 hover:ring-primary-500/40"
              >
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-background-900">
                  {ep.thumbnail && (
                    <Image
                      src={ep.thumbnail}
                      layout="fill"
                      objectFit="cover"
                      alt={ep.title}
                    />
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-bold leading-none">
                    EP {ep.number}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="line-clamp-2 text-sm font-semibold text-gray-100 transition group-hover:text-primary-300">
                    {ep.title}
                  </p>
                  <span className="mt-1 text-xs text-gray-500 opacity-0 transition group-hover:opacity-100">
                    ▶ Play episode {ep.number}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EpisodesSection);
