//@ts-nocheck
import { getPageStudios, getStudioDetails } from "@/services/anilist";
import { Studio } from "@/types/anilist";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useStudio = (studioId: number, initialData: Studio) => {
  return useInfiniteQuery<Studio>({
    queryKey: ["studio", studioId],
    queryFn: async ({ pageParam = 1 }) => {
      return getStudioDetails({
        id: studioId,
        page: pageParam,
        perPage: 50,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.media?.pageInfo?.hasNextPage
        ? lastPage?.media?.pageInfo?.currentPage + 1
        : undefined,
    initialData: {
      pages: [initialData],
      pageParams: [1],
    },
  });
};
