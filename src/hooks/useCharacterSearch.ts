//@ts-nocheck
import { getPageCharacters } from "@/services/anilist";
import { CharacterSort } from "@/types/anilist";
import { useInfiniteQuery } from "@tanstack/react-query";

const useCharacterSearch = (keyword: string) => {
  return useInfiniteQuery({
    queryKey: ["character", keyword],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getPageCharacters({
        search: keyword,
        page: pageParam,
        perPage: 30,
        sort: [CharacterSort.Favourites_desc],
      });

      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? lastPage.pageInfo.currentPage + 1
        : undefined,
  });
};

export default useCharacterSearch;
