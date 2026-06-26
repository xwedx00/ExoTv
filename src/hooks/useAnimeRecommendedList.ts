//@ts-nocheck
import { getMediaDetails } from "@/services/anilist";
import { mediaDefaultFields } from "@/services/anilist/queries";
import { Watched } from "@/types";
import { watchedStore } from "@/lib/storage";
import { isMobile } from "react-device-detect";
import { useQuery } from "@tanstack/react-query";

const useAnimeRecommendedList = () => {
  return useQuery({
    queryKey: ["anime", "recommended"],

    queryFn: async () => {
      const data = watchedStore.recent(1)[0];

      if (!data?.mediaId) return null;

      const media = await getMediaDetails(
        {
          id: data.mediaId,
          perPage: 1,
        },
        `
          title {
            romaji
            english
            native
            userPreferred
          }
          recommendations(sort: [RATING_DESC, ID], perPage: ${
            isMobile ? 5 : 10
          }) {
            nodes {
              mediaRecommendation {
                ${mediaDefaultFields}
              }
            }
          }
          `
      );

      return {
        ...data,
        media,
      };
    }
  });
};

export default useAnimeRecommendedList;
