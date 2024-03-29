//@ts-nocheck
import { AnimeSourceConnection } from "@/types";
import { sortMediaUnit } from "@/utils/data";
import supabaseClient from "@/lib/supabase";
import { useQuery } from "react-query";

const query = `
  *,
  episodes:kaguya_episodes(
      *,
      source:kaguya_sources(
          *
      )
  )
`;

const useEpisodes = (mediaId: number) => {
  return useQuery(["episodes", mediaId], async () => {
    const { data, error } = await supabaseClient
      .from<AnimeSourceConnection>("kaguya_anime_source")
      .select(query)
      .eq("mediaId", mediaId);

    if (error) throw error;

    const episodes = data?.flatMap((connection) => connection.episodes);

    const sortedEpisodes = sortMediaUnit(
      episodes.filter((episode) => episode.published)
    );

    return sortedEpisodes;
  });
};

export default useEpisodes;