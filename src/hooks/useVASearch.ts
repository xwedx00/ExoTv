//@ts-nocheck
import { getPageStaff } from "@/services/anilist";
import { StaffSort } from "@/types/anilist";
import { useInfiniteQuery } from "@tanstack/react-query";

const useVASearch = (keyword: string) => {
  return useInfiniteQuery({
    queryKey: ["va", keyword],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getPageStaff({
        search: keyword,
        page: pageParam,
        perPage: 30,
        sort: [StaffSort.Favourites_desc],
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

export default useVASearch;
