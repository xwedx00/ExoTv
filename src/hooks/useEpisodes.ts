//@ts-nocheck
import { Episode } from "@/types";
import { sortMediaUnit } from "@/utils/data";
import { useQuery } from "@tanstack/react-query";

const useEpisodes = (mediaId: number) => {
  return useQuery({
    queryKey: ["episodes", mediaId],

    queryFn: async () => {
      // TODO(Phase 4/5): wire to in-app API route / socket server
      const episodes: Episode[] = [];

      const sortedEpisodes = sortMediaUnit(
        episodes.filter((episode) => episode.published)
      );

      return sortedEpisodes;
    }
  });
};

export default useEpisodes;
