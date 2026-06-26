//@ts-nocheck
import { getPageMedia } from "@/services/anilist";
import {
  MediaFormat,
  MediaSort,
  MediaStatus,
  MediaType,
} from "@/types/anilist";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseBrowseOptions {
  keyword?: string;
  genres?: string[];
  format?: MediaFormat;
  limit?: number;
  tags?: string[];
  sort?: MediaSort;
  country?: string;
  status?: MediaStatus;
  isAdult?: boolean;
}

const useBrowse = (options: UseBrowseOptions) => {
  const {
    format,
    genres,
    keyword,
    sort,
    limit = 30,
    tags,
    country,
    status,
    isAdult,
  } = options;

  return useInfiniteQuery({
    queryKey: ["browse-manga", options],
    queryFn: async ({ pageParam = 1 }) => {
      const searchData = await getPageMedia({
        type: MediaType.Manga,
        format,
        perPage: limit,
        countryOfOrigin: country,
        sort: [sort],
        status,
        page: pageParam,
        ...(tags?.length && { tag_in: tags }),
        ...(genres?.length && { genre_in: genres }),
        ...(keyword && { search: keyword }),
        isAdult:
          isAdult || genres.includes("Hentai") || genres.includes("Ecchi"),
      });

      return searchData;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? lastPage.pageInfo.currentPage + 1
        : undefined,
  });
};

export default useBrowse;
