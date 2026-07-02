//@ts-nocheck
import { watchedStore, watchStatusStore } from "@/lib/storage";
import { getMedia } from "@/services/anilist";
import { AdditionalUser } from "@/types";
import { Media, MediaType } from "@/types/anilist";
import { getPagination, parseNumberFromString } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

export const STATUS = {
  All: "ALL",
  Watching: "WATCHING",
  Completed: "COMPLETED",
  Planning: "PLANNING",
} as const;
export type StatusKey = keyof typeof STATUS;
export type Status = typeof STATUS[StatusKey];

interface MediaWithWatchedTime extends Media {
  watchedTime: number;
  watchedEpisode: number;
}

const LIST_LIMIT = 30;

const useWatchList = (sourceType: Status, user: AdditionalUser) => {
  return useInfiniteQuery({
    queryKey: ["watch-list", user?.id, sourceType],
    queryFn: async ({ pageParam = 1 }) => {
      // All media ids that match the status filter (newest-first is preserved by
      // sorting on the locally-stored "updatedAt" of the watched entry below).
      const allIds = watchStatusStore.byStatus(sourceType);

      // Page through the ids using the AniList page/perPage params. We slice the
      // ids for the current page locally, then request exactly that slice.
      const { from } = getPagination(pageParam, LIST_LIMIT);
      const pageIds = allIds.slice(from, from + LIST_LIMIT);

      const media = pageIds.length
        ? await getMedia({
            type: MediaType.Anime,
            id_in: pageIds,
            page: pageParam,
            perPage: LIST_LIMIT,
          })
        : [];

      const hasNextPage = allIds.length > from + LIST_LIMIT;

      const list: MediaWithWatchedTime[] = media
        .sort((mediaA, mediaB) => {
          const watchedA = watchedStore.get(mediaA.id);
          const watchedB = watchedStore.get(mediaB.id);

          const watchedUpdatedATime = watchedA?.updatedAt || 0;
          const watchedUpdatedBTime = watchedB?.updatedAt || 0;

          return watchedUpdatedBTime - watchedUpdatedATime;
        })
        .map((m) => {
          const watchedData = watchedStore.get(m.id);

          return {
            ...m,
            watchedTime: watchedData?.watchedTime || 0,
            watchedEpisode:
              watchedData?.episodeNumber ??
              parseNumberFromString(watchedData?.episodeName || "0"),
          };
        });

      return {
        data: list,
        nextPage: hasNextPage ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export default useWatchList;
