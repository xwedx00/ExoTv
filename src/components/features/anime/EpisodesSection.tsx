//@ts-nocheck
import Image from "@/components/shared/Image";
import { fetchSourceData, sourceQueryKey } from "@/hooks/useFetchSource";
import { Media } from "@/types/anilist";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";

const PROVIDER = "megaplay";

const cleanTitle = (t: string | undefined, n: number) =>
  (t || "").replace(/^\s*episode\s*\d+\s*[-:.]?\s*/i, "").trim() || `Episode ${n}`;

/**
 * Episode guide on the anime details page (above the Character Section).
 *
 * The LIST is built from AniList (`streamingEpisodes` for title+thumbnail, plus
 * the canonical `episodes` count) — reliable and rich, independent of the stream
 * provider. Hovering an episode prefetches its stream sources into the SAME
 * react-query cache the watch page reads, so clicking plays instantly.
 */
const EpisodesSection: React.FC<{ anime: Media }> = ({ anime }) => {
  const queryClient = useQueryClient();
  const id = anime?.id;

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

  const prefetch = (num: number) => {
    const sourceEpisodeId = `${id}:${num}`;
    queryClient.prefetchQuery({
      queryKey: [sourceQueryKey(PROVIDER, sourceEpisodeId)],
      queryFn: () => fetchSourceData(sourceEpisodeId, PROVIDER),
      staleTime: 1000 * 60,
    });
  };

  // Warm episode 1 (the "Watch Now" target) as soon as the page is idle, so the
  // primary watch path is instant without needing a hover.
  useEffect(() => {
    if (!id || !episodes.length) return;
    const t = setTimeout(() => prefetch(1), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, episodes.length]);

  if (!episodes.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">
        Episodes <span className="text-lg text-gray-500">({episodes.length})</span>
      </h2>

      <div className="grid max-h-[640px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
        {episodes.map((ep) => (
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
  );
};

export default React.memo(EpisodesSection);
