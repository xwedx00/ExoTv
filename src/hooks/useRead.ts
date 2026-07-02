//@ts-nocheck
import { readStore } from "@/lib/storage";

import { Read } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getMedia } from "@/services/anilist";
import { MediaType } from "@/types/anilist";
import { isMobile } from "react-device-detect";

const useRead = () => {
  return useQuery({
    queryKey: ["read"],

    queryFn: async () => {
      const data = readStore.recent(isMobile ? 5 : 10);

      const anilistMedia = await getMedia({
        id_in: data.map((read) => read.mediaId),
        type: MediaType.Manga,
      });

      return data.map((read) => {
        const media = anilistMedia.find((media) => media.id === read.mediaId);

        return {
          ...read,
          media,
        };
      });
    }
  });
};

export default useRead;
