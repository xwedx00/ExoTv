//@ts-nocheck
import { WatchPlayerProps } from "@/components/features/anime/WatchPlayer";
import Button from "@/components/shared/Button";
import Description from "@/components/shared/Description";
import Head from "@/components/shared/Head";
import Loading from "@/components/shared/Loading";
import Portal from "@/components/shared/Portal";
import useDevice from "@/hooks/useDevice";
import useEventListener from "@/hooks/useEventListener";
import { useFetchSource } from "@/hooks/useFetchSource";
import useMediaDetails from "@/hooks/useMediaDetails";
import useSavedWatched from "@/hooks/useSavedWatched";
import useSaveWatched from "@/hooks/useSaveWatched";
import { Episode } from "@/types";
import { getEpisodes } from "@/lib/sources/anime";
import { parseNumberFromString } from "@/utils";
import { getDescription, getTitle, sortMediaUnit } from "@/utils/data";
import { GetServerSideProps, NextPage } from "next";
import { useTranslation } from "@/lib/i18n";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const WatchPlayer = dynamic(
  () => import("@/components/features/anime/WatchPlayer"),
  {
    ssr: false,
  }
);

const blankVideo = [
  {
    file: "https://cdn.plyr.io/static/blank.mp4",
  },
];

const ForwardRefPlayer = React.memo(
  React.forwardRef<HTMLVideoElement, WatchPlayerProps>((props, ref) => (
    <WatchPlayer {...props} videoRef={ref} />
  ))
);

ForwardRefPlayer.displayName = "ForwardRefPlayer";

interface WatchPageProps {
  episodes: Episode[];
}

const WatchPage: NextPage<WatchPageProps> = ({ episodes }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { isMobile } = useDevice();
  const [showInfoOverlay, setShowInfoOverlay] = useState(false);
  const [showWatchedOverlay, setShowWatchedOverlay] = useState(false);
  const [declinedRewatch, setDeclinedRewatch] = useState(false);

  const showInfoTimeout = useRef<NodeJS.Timeout>(null);
  const saveWatchedInterval = useRef<NodeJS.Timer>(null);
  const saveWatchedMutation = useSaveWatched();
  const { t } = useTranslation("anime_watch");

  const { params } = router.query;

  useEventListener("visibilitychange", () => {
    if (isMobile) return;

    if (showInfoTimeout.current) {
      clearTimeout(showInfoTimeout.current);
    }

    if (!document.hidden) return;

    showInfoTimeout.current = setTimeout(() => {
      setShowInfoOverlay(true);
    }, 5000);
  });

  const sortedEpisodes = useMemo(
    () => sortMediaUnit(episodes || []),
    [episodes]
  );

  const [
    animeId,
    sourceId = sortedEpisodes[0]?.sourceId,
    episodeId = sortedEpisodes[0]?.sourceEpisodeId,
  ] = params as string[];

  const { data: anime, isLoading: animeLoading } = useMediaDetails({
    id: Number(animeId),
  });

  const {
    data: watchedEpisodeData,
    isLoading: isSavedDataLoading,
    isError: isSavedDataError,
    refetch: refetchWatchedData,
  } = useSavedWatched(Number(animeId));

  const watchedEpisode = useMemo(
    () =>
      isSavedDataError
        ? null
        : sortedEpisodes.find(
            (episode) =>
              episode.sourceEpisodeId ===
              watchedEpisodeData?.episode?.sourceEpisodeId
          ),
    [
      isSavedDataError,
      sortedEpisodes,
      watchedEpisodeData?.episode?.sourceEpisodeId,
    ]
  );

  const sourceEpisodes = useMemo(
    () => episodes.filter((episode) => episode.sourceId === sourceId),
    [episodes, sourceId]
  );

  const currentEpisode = useMemo(
    () =>
      sourceEpisodes.find((episode) => episode.sourceEpisodeId === episodeId),
    [sourceEpisodes, episodeId]
  );

  const currentEpisodeIndex = useMemo(
    () =>
      sourceEpisodes.findIndex(
        (episode) => episode.sourceEpisodeId === episodeId
      ),
    [episodeId, sourceEpisodes]
  );

  const nextEpisode = useMemo(
    () => sourceEpisodes[currentEpisodeIndex + 1],
    [currentEpisodeIndex, sourceEpisodes]
  );

  const handleNavigateEpisode = useCallback(
    (episode: Episode) => {
      if (!episode) return;

      router.replace(
        `/anime/watch/${animeId}/${episode.sourceId}/${episode.sourceEpisodeId}`,
        null,
        {
          shallow: true,
        }
      );
    },
    [animeId, router]
  );

  const { data, isLoading, isError, error } = useFetchSource(
    currentEpisode,
    nextEpisode
  );

  // Show watched overlay
  useEffect(() => {
    if (!currentEpisode?.sourceEpisodeId) return;

    if (
      !watchedEpisode ||
      isSavedDataLoading ||
      isSavedDataError ||
      declinedRewatch
    )
      return;

    if (currentEpisode.sourceEpisodeId === watchedEpisode?.sourceEpisodeId) {
      setDeclinedRewatch(true);

      return;
    }

    setShowWatchedOverlay(true);
  }, [
    currentEpisode?.sourceEpisodeId,
    declinedRewatch,
    isSavedDataError,
    isSavedDataLoading,
    watchedEpisode,
  ]);

  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl) return;
    if (!currentEpisode) return;

    const handleSaveTime = () => {
      if (saveWatchedInterval.current) {
        clearInterval(saveWatchedInterval.current);
      }
      saveWatchedInterval.current = setInterval(() => {
        saveWatchedMutation.mutate({
          media_id: Number(animeId),
          episode_id: `${currentEpisode.sourceId}-${currentEpisode.sourceEpisodeId}`,
          watched_time: videoRef.current?.currentTime,
          episode_number: parseNumberFromString(currentEpisode?.name, 0),
        });
      }, 30000);
    };

    videoEl.addEventListener("canplay", handleSaveTime);

    return () => {
      clearInterval(saveWatchedInterval.current);
      videoEl.removeEventListener("canplay", handleSaveTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, currentEpisode, videoRef.current]);

  useEffect(() => {
    const videoEl = videoRef.current;

    if (!videoEl) return;
    if (isSavedDataLoading) return;
    if (!watchedEpisodeData?.watchedTime) return;
    if (!currentEpisode?.name) return;

    const currentEpisodeNumber = parseNumberFromString(currentEpisode.name, 0);

    if (currentEpisodeNumber !== watchedEpisodeData.episodeNumber) return;

    const handleVideoPlay = () => {
      videoEl.currentTime = watchedEpisodeData.watchedTime;

      videoEl.removeEventListener("canplay", handleVideoPlay);
      videoEl.removeEventListener("timeupdate", handleVideoPlay);
    };

    // Only set the video time if the video is ready
    videoEl.addEventListener("canplay", handleVideoPlay);
    // Just in case the video is already played.
    videoEl.addEventListener("timeupdate", handleVideoPlay);

    return () => {
      videoEl.removeEventListener("canplay", handleVideoPlay);
      videoEl.removeEventListener("timeupdate", handleVideoPlay);
    };
  }, [
    watchedEpisode?.sourceEpisodeId,
    watchedEpisodeData?.watchedTime,
    currentEpisode?.name,
    isSavedDataLoading,
    watchedEpisodeData?.episodeNumber,
  ]);

  // Refetch watched data when episode changes
  useEffect(() => {
    refetchWatchedData();
  }, [currentEpisode?.slug, refetchWatchedData]);

  const title = useMemo(
    () => getTitle(anime, router.locale),
    [anime, router.locale]
  );
  const description = useMemo(
    () => getDescription(anime, router.locale),
    [anime, router.locale]
  );

  const sources = useMemo(
    () => (!data?.sources?.length ? blankVideo : data.sources),
    [data?.sources]
  );

  const subtitles = useMemo(
    () => (!data?.subtitles?.length ? [] : data.subtitles),
    [data?.subtitles]
  );

  const fonts = useMemo(
    () => (!data?.fonts?.length ? [] : data.fonts),
    [data?.fonts]
  );

  // Player is rendered directly in the page below (no persistent-player indirection).

  useEffect(() => {
    if (!anime || !currentEpisode) return;

    const syncDataScript = document.querySelector("#syncData");
    if (!syncDataScript) return;

    syncDataScript.textContent = JSON.stringify({
      title: anime.title.userPreferred,
      aniId: Number(animeId),
      episode: parseNumberFromString(currentEpisode.name),
      id: animeId,
      nextEpUrl: nextEpisode
        ? `/anime/watch/${animeId}/${nextEpisode.sourceId}/${nextEpisode.sourceEpisodeId}`
        : null,
    });
  }, [anime, animeId, currentEpisode?.name, nextEpisode]);

  if (animeLoading) {
    return (
      <div className="relative w-full min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!episodes?.length || !currentEpisode) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 px-4 text-center">
        <Head title={`${title} - ExoTv`} />
        <h1 className="text-2xl font-semibold">No streamable source found</h1>
        <p className="max-w-md text-gray-400">
          We couldn&apos;t find any episodes for &ldquo;{title}&rdquo; from the
          available providers. Some titles (e.g. adult works) aren&apos;t carried by
          the current anime sources.
        </p>
        <Button primary onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <React.Fragment>
      <Head
        title={`${title} (${currentEpisode.name}) - ExoTv`}
        description={`Watch ${title} (${currentEpisode.name}) on ExoTv — free, no ads.`}
        image={anime.bannerImage}
      />

      <div className="netplayer-container relative h-screen w-screen bg-black">
        <ForwardRefPlayer
          ref={videoRef}
          sources={sources}
          subtitles={subtitles}
          fonts={fonts}
          thumbnail={data?.thumbnail}
          intro={data?.intro}
          outro={data?.outro}
          onNext={
            nextEpisode ? () => handleNavigateEpisode(nextEpisode) : undefined
          }
          className="h-full w-full"
        />
      </div>

      {isLoading && (
        <Portal selector=".netplayer-container">
          <Loading />
        </Portal>
      )}

      {isError ? (
        <Portal selector=".netplayer-container">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 space-y-4">
            <p className="text-4xl font-semibold text-center">｡゜(｀Д´)゜｡</p>
            <p className="text-xl text-center">
              Something went wrong ({error?.response?.data?.error})
            </p>
            <p className="text-lg text-center">
              Try another server or come back later.
            </p>
          </div>
        </Portal>
      ) : (
        !isLoading &&
        !data?.sources?.length && (
          <Portal selector=".netplayer-container">
            <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 space-y-4">
              <p className="text-4xl font-semibold text-center">｡゜(｀Д´)゜｡</p>
              <p className="text-xl text-center">No sources found</p>
              <p className="text-lg text-center">
                Try another server or come back later.
              </p>
            </div>
          </Portal>
        )
      )}

      {showInfoOverlay && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] flex items-center bg-black/70"
            onMouseMove={() => setShowInfoOverlay(false)}
          >
            <div className="w-11/12 px-40">
              <p className="mb-2 text-xl text-gray-200">{t("blur_heading")}</p>
              <p className="mb-8 text-5xl font-semibold">
                {title} - {currentEpisode.name}
              </p>

              <Description
                description={description || t("common:updating") + "..."}
                className="text-lg text-gray-300 line-clamp-6"
              />
            </div>
          </div>
        </Portal>
      )}

      {showWatchedOverlay && !declinedRewatch && (
        <Portal selector=".netplayer-container">
          <div
            className="fixed inset-0 z-40 bg-black/70"
            onClick={() => {
              setShowWatchedOverlay(false);
              setDeclinedRewatch(true);
            }}
          />

          <div className="fixed left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 w-2/3 p-8 rounded-md bg-background-900">
            <h1 className="text-4xl font-bold mb-4">
              {t("rewatch_heading", { episodeName: watchedEpisode.name })}
            </h1>
            <p className="">
              {t("rewatch_description", { episodeName: watchedEpisode.name })}
            </p>
            <p className="mb-4">
              {t("rewatch_question", { episodeName: watchedEpisode.name })}
            </p>
            <div className="flex items-center justify-end space-x-4">
              <Button
                onClick={() => {
                  setShowWatchedOverlay(false), setDeclinedRewatch(true);
                }}
                className="!bg-transparent hover:!bg-white/20 transition duration-300"
              >
                <p>{t("rewatch_no")}</p>
              </Button>
              <Button
                onClick={() =>
                  handleNavigateEpisode(watchedEpisodeData?.episode)
                }
                primary
              >
                <p>{t("rewatch_yes")}</p>
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </React.Fragment>
  );
};

export const getServerSideProps: GetServerSideProps<WatchPageProps> = async ({
  params,
}) => {
  const parts = (params?.params as string[]) || [];
  const animeId = parts[0];
  const preferredProvider = parts[1];

  if (!animeId) return { notFound: true };

  const episodes = await getEpisodes(animeId, preferredProvider);

  // getServerSideProps props must be JSON-serializable (no `undefined`).
  return { props: { episodes: JSON.parse(JSON.stringify(episodes)) } };
};

// @ts-ignore
WatchPage.getLayout = (page) => page;

export default WatchPage;
