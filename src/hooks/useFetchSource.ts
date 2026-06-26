//@ts-nocheck
import { Episode, Font, Subtitle, VideoSource } from "@/types";
import { createProxyUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";

interface ReturnSuccessType {
  success: true;
  sources: VideoSource[];
  subtitles?: Subtitle[];
  fonts?: Font[];
  thumbnail?: string;
}

interface ReturnFailType {
  success: false;
  error: string;
  errorMessage: string;
}

const convertSources = (sources: VideoSource[]) =>
  sources.map((source) => {
    if (source.useProxy) {
      source.file = createProxyUrl(source.file, source.proxy);
    }

    return source;
  });

export const useFetchSource = (
  currentEpisode: Episode,
  nextEpisode?: Episode
) => {
  const fetchSource = async (
    episode: Episode
  ): Promise<ReturnSuccessType | ReturnFailType> => {
    const res = await fetch(
      `/api/anime/sources?episodeId=${encodeURIComponent(
        episode.sourceEpisodeId
      )}&provider=${encodeURIComponent(episode.sourceId)}`
    );
    const data = await res.json();

    if (!data?.success || !data.sources?.length) {
      return {
        success: false,
        error: data?.error || "no_sources",
        errorMessage: "No sources found",
      };
    }

    return {
      success: true,
      sources: convertSources(data.sources),
      subtitles: data.subtitles || [],
      fonts: data.fonts || [],
      thumbnail: data.thumbnail,
    };
  };

  const getQueryKey = (episode?: Episode) =>
    episode
      ? `source-${episode.sourceId}-${episode.sourceEpisodeId}`
      : "source-none";

  return useQuery({
    queryKey: [getQueryKey(currentEpisode)],
    queryFn: () => fetchSource(currentEpisode),
    enabled: !!currentEpisode,
  });
};
