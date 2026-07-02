//@ts-nocheck
import { Episode } from "@/types";
import { sortMediaUnit } from "@/utils/data";
import { useQuery } from "@tanstack/react-query";

const useEpisodes = (mediaId: number) => {
  return useQuery({
    queryKey: ["episodes", mediaId],

    queryFn: async () => {
      const res = await fetch(`/api/anime/episodes?id=${mediaId}`);
      const data = await res.json();
      const episodes: Episode[] = data?.episodes || [];

      const sortedEpisodes = sortMediaUnit(
        episodes.filter((episode) => episode.published)
      );

      return sortedEpisodes;
    }
  });
};

export default useEpisodes;
