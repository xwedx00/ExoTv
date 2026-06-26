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
  // TODO(Phase 4/5): wire to in-app API route / socket server
  const fetchSource = async (
    _episode: Episode
  ): Promise<ReturnSuccessType> => ({
    success: true,
    sources: convertSources([] as VideoSource[]),
    subtitles: [] as Subtitle[],
    fonts: [] as Font[],
  });

  const getQueryKey = (episode: Episode) =>
    `source-${episode.sourceId}-${episode.sourceEpisodeId}`;

  return useQuery({
    queryKey: [getQueryKey(currentEpisode)],
    queryFn: () => fetchSource(currentEpisode),
  });
};
