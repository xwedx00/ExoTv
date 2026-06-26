//@ts-nocheck
import { watchedStore } from "@/lib/storage";

import { getMedia } from "@/services/anilist";
import { Watched } from "@/types";
import { isMobile } from "react-device-detect";
import { useQuery } from "@tanstack/react-query";

const useWatched = () => {
  return useQuery({
    queryKey: "watched",

    queryFn: async () => {
      const watchedEntries = watchedStore.recent(isMobile ? 5 : 10);

      if (!watchedEntries.length) return [];

      const anilistMedia = await getMedia({
        id_in: watchedEntries.map((watched) => watched.mediaId),
      });

      return watchedEntries.map((watched) => {
        const media = anilistMedia.find((media) => media.id === watched.mediaId);

        return {
          ...watched,
          media,
        };
      });
    }
  });
};

export default useWatched;
