//@ts-nocheck
import { readStatusStore, readStore } from "@/lib/storage";
import { getMedia } from "@/services/anilist";
import { Media, MediaType } from "@/types/anilist";
import { getPagination, parseNumberFromString } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

export const STATUS = {
  All: "ALL",
  Reading: "READING",
  Completed: "COMPLETED",
  Planning: "PLANNING",
} as const;

export type StatusKey = keyof typeof STATUS;
export type Status = typeof STATUS[StatusKey];

interface MediaWithReadTime extends Media {
  readChapter: number;
}

const LIST_LIMIT = 30;

const useReadList = (sourceType: Status) => {
  return useInfiniteQuery(
    ["read-list", sourceType],
    async ({ pageParam = 1 }) => {
      const { from, to } = getPagination(pageParam, LIST_LIMIT);

      // All media ids matching the requested read status, newest mediaId first
      // (mirrors the previous `order("mediaId", { ascending: false })`).
      const allIds = readStatusStore
        .byStatus(sourceType)
        .sort((a, b) => b - a);

      const ids = allIds.slice(from, to + 1);

      const media = await getMedia({
        type: MediaType.Manga,
        id_in: ids,
      });

      // Local read history for the current page, newest first.
      const read = ids
        .map((id) => readStore.get(id))
        .filter(Boolean)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      const hasNextPage = ids.length === LIST_LIMIT;

      const list: MediaWithReadTime[] = media
        .sort((mediaA, mediaB) => {
          const readDataA = read.find((w) => w.mediaId === mediaA.id);
          const readDataB = read.find((w) => w.mediaId === mediaB.id);

          const readUpdatedATime = readDataA?.updatedAt || 0;
          const readUpdatedBTime = readDataB?.updatedAt || 0;

          return readUpdatedBTime - readUpdatedATime;
        })
        .map((m) => {
          const readData = read.find((w) => w.mediaId === m.id);

          return {
            ...m,
            readChapter: parseNumberFromString(readData?.chapterName || "0"),
          };
        });

      return {
        data: list,
        nextPage: hasNextPage ? pageParam + 1 : null,
      };
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );
};

export default useReadList;
