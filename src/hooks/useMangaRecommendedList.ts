//@ts-nocheck
import { getMediaDetails } from "@/services/anilist";
import { mediaDefaultFields } from "@/services/anilist/queries";
import { readStore } from "@/lib/storage";
import { Read } from "@/types";
import { MediaType } from "@/types/anilist";

import { isMobile } from "react-device-detect";
import { useQuery } from "@tanstack/react-query";

const useMangaRecommendedList = () => {
  return useQuery({
    queryKey: ["manga", "recommended"],

    queryFn: async () => {
      const mediaId = readStore.recent(1)[0]?.mediaId;

      if (!mediaId) return null;

      const media = await getMediaDetails(
        {
          id: mediaId,
          perPage: 1,
          type: MediaType.Manga,
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
        mediaId,
        media,
      };
    }
  });
};

export default useMangaRecommendedList;
