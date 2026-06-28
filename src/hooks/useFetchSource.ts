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
      // Already proxied here — clear the flag so the player doesn't double-proxy
      // it (`/api/proxy?url=/api/proxy?url=...`).
      source.useProxy = false;
    }

    return source;
  });

// Exported so the details-page Episodes guide can prefetch into the SAME cache
// (so clicking an episode plays instantly — no source wait).
export const sourceQueryKey = (sourceId: string, sourceEpisodeId: string) =>
  `source-${sourceId}-${sourceEpisodeId}`;

export const fetchSourceData = async (
  sourceEpisodeId: string,
  sourceId: string
): Promise<ReturnSuccessType | ReturnFailType> => {
  const res = await fetch(
    `/api/anime/sources?episodeId=${encodeURIComponent(
      sourceEpisodeId
    )}&provider=${encodeURIComponent(sourceId)}`
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

export const useFetchSource = (
  currentEpisode: Episode,
  nextEpisode?: Episode
) => {
  return useQuery({
    queryKey: [
      currentEpisode
        ? sourceQueryKey(currentEpisode.sourceId, currentEpisode.sourceEpisodeId)
        : "source-none",
    ],
    queryFn: () =>
      fetchSourceData(
        currentEpisode.sourceEpisodeId,
        currentEpisode.sourceId
      ),
    enabled: !!currentEpisode,
  });
};
