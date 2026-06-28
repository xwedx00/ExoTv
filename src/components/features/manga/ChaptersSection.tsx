//@ts-nocheck
import useChapters from "@/hooks/useChapters";
import { fetchImagesData, imagesQueryKey } from "@/hooks/useFetchImages";
import { Media } from "@/types/anilist";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

/**
 * Chapters guide on the manga details page (above the Characters section).
 *
 * The chapter LIST comes from the in-app MangaDex source (resolved from the
 * AniList title). Hovering a chapter prefetches its page images into the SAME
 * react-query cache the reader reads, so opening a chapter is instant.
 */
const ChaptersSection: React.FC<{ manga: Media }> = ({ manga }) => {
  const queryClient = useQueryClient();
  const id = manga?.id;
  const { data: chapters, isLoading } = useChapters(id);

  const prefetch = (chapter: any) => {
    queryClient.prefetchQuery({
      queryKey: [imagesQueryKey(chapter.sourceId, chapter.sourceChapterId)],
      queryFn: () => fetchImagesData(chapter.sourceChapterId),
      staleTime: 1000 * 60 * 10,
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">
        Chapters
        {!isLoading && chapters?.length ? (
          <span className="text-lg text-gray-500"> ({chapters.length})</span>
        ) : null}
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-lg bg-background-800"
            />
          ))}
        </div>
      ) : !chapters?.length ? (
        <p className="max-w-xl text-gray-400">
          No readable chapters found for this title (it may be a licensed /
          external-only series on MangaDex).
        </p>
      ) : (
        <div className="grid max-h-[640px] grid-cols-2 gap-2 overflow-y-auto pr-1 md:grid-cols-3">
          {chapters.map((ch: any) => (
            <Link
              key={ch.sourceChapterId}
              href={`/manga/read/${id}/${ch.sourceId}/${ch.sourceChapterId}`}
              onMouseEnter={() => prefetch(ch)}
              onFocus={() => prefetch(ch)}
              className="group flex items-center gap-2 rounded-lg bg-background-800 px-3 py-2.5 ring-1 ring-white/5 transition hover:bg-background-700 hover:ring-primary-500/40"
            >
              <span className="shrink-0 text-xs font-bold text-primary-400">
                #{ch.name}
              </span>
              <span className="line-clamp-1 text-sm text-gray-200 transition group-hover:text-primary-300">
                {ch.title || `Chapter ${ch.name}`}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChaptersSection);
