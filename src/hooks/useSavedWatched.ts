//@ts-nocheck
import { watchedStore } from "@/lib/storage";

import { useQuery } from "@tanstack/react-query";

const useSavedWatched = (animeId: number) => {
  return useQuery({
    queryKey: ["watched", animeId],

    queryFn: () => {
      const entry = watchedStore.get(animeId);

      if (!entry) return null;

      // Reconstruct the previously-joined `episode` shape from the locally
      // stored fields so consumers reading `data?.episode?.sourceEpisodeId`
      // (and friends) keep working unchanged.
      return {
        episode: {
          id: entry.episodeId,
          sourceEpisodeId: entry.sourceEpisodeId,
          name: entry.episodeName,
          sourceId: entry.sourceId,
        },
        watchedTime: entry.watchedTime,
        episodeNumber: entry.episodeNumber,
      };
    },

    refetchOnMount: true
  });
};

export default useSavedWatched;
