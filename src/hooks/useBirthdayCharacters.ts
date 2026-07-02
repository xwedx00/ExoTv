//@ts-nocheck
import { getCharacters } from "@/services/anilist";
import { CharacterSort } from "@/types/anilist";
import { useQuery } from "@tanstack/react-query";

const useBirthdayCharacters = () => {
  return useQuery({
    queryKey: ["characters birthday"],

    queryFn: async () => {
      const data = await getCharacters({
        isBirthday: true,
        perPage: 30,
        sort: [CharacterSort.Favourites_desc],
      });

      return data;
    }
  });
};

export default useBirthdayCharacters;
