//@ts-nocheck
import { getStaff } from "@/services/anilist";
import { StaffSort } from "@/types/anilist";
import { useQuery } from "@tanstack/react-query";

const useFavouriteVA = () => {
  return useQuery({
    queryKey: ["voice-actors favourites"],

    queryFn: async () => {
      const data = await getStaff({
        perPage: 30,
        sort: [StaffSort.Favourites_desc],
      });

      return data;
    },

    retry: 0
  });
};

export default useFavouriteVA;
