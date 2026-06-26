//@ts-nocheck
import { getPageMedia } from "@/services/anilist";
import {
  MediaFormat,
  MediaSeason,
  MediaSort,
  MediaStatus,
  MediaType,
} from "@/types/anilist";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseBrowseOptions {
  keyword?: string;
  genres?: string[];
  seasonYear?: number;
  season?: MediaSeason;
  format?: MediaFormat;
  select?: string;
  limit?: number;
  tags?: string[];
  sort?: MediaSort;
  country?: string;
  status?: MediaStatus;
  isAdult?: boolean;
}

const useBrowse = (options: UseBrowseOptions) => {
  const {
    format = undefined,
    genres = [],
    keyword = "",
    season = undefined,
    seasonYear = undefined,
    sort = MediaSort.Trending_desc,
    limit = 30,
    tags = [],
    country = undefined,
    status = undefined,
    isAdult = false,
  } = options;

  return useInfiniteQuery(
    ["browse", options],
    async ({ pageParam = 1 }) => {
      // Search anime from Anilist using provided options
      const searchData = await getPageMedia({
        format,
        season,
        seasonYear,
        perPage: limit,
        countryOfOrigin: country,
        sort: [sort],
        status,
        page: pageParam,
        type: MediaType.Anime,
        ...(tags?.length && { tag_in: tags }),
        ...(genres?.length && { genre_in: genres }),
        // If keyword is given, but there is no media ids found, search the media using keyword.
        ...(keyword && { search: keyword }),
        isAdult:
          isAdult || genres.includes("Hentai") || genres.includes("Ecchi"),
      });

      return searchData;
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.pageInfo.hasNextPage
          ? lastPage.pageInfo.currentPage + 1
          : null,
    }
  );
};

export default useBrowse;
