//@ts-nocheck
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { createProxyUrl } from "@/utils";
import {
  MediaPlayer,
  MediaProvider,
  Track,
  useMediaPlayer,
  useMediaState,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";

export interface WatchPlayerProps {
  videoRef?: React.ForwardedRef<HTMLVideoElement>;
  sources?: any[];
  subtitles?: any[];
  fonts?: any[];
  thumbnail?: string;
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onNext?: () => void;
  className?: string;
}

const resolveUrl = (item: any) =>
  item?.useProxy ? createProxyUrl(item.file, item.proxy) : item?.file;

/**
 * Anime-specific overlay controls layered on top of the Vidstack player:
 * Skip Intro / Skip Outro (from the source's AniSkip-style intro/outro times)
 * and a Next Episode button near the end. Uses Vidstack media state so it tracks
 * playback live. Rendered inside <MediaPlayer> so the hooks have player context.
 */
const SkipControls: React.FC<{
  intro?: { start: number; end: number } | null;
  outro?: { start: number; end: number } | null;
  onNext?: () => void;
}> = ({ intro, outro, onNext }) => {
  const player = useMediaPlayer();
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");

  const seekTo = useCallback(
    (t: number) => {
      if (player && Number.isFinite(t)) player.currentTime = t;
    },
    [player]
  );

  const inIntro =
    intro && currentTime >= intro.start && currentTime < intro.end - 0.4;
  const inOutro =
    outro && currentTime >= outro.start && currentTime < outro.end - 0.4;
  const nearEnd = !!onNext && duration > 0 && currentTime >= duration - 80;

  if (!inIntro && !inOutro && !nearEnd) return null;

  const btn =
    "pointer-events-auto rounded-full glass-regular px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:border-white/20";

  return (
    <div className="pointer-events-none absolute bottom-20 right-4 z-30 flex flex-col items-end gap-2 md:bottom-28 md:right-8">
      {inIntro && (
        <button className={btn} onClick={() => seekTo(intro!.end)}>
          Skip Intro
        </button>
      )}
      {inOutro && (
        <button className={btn} onClick={() => seekTo(outro!.end)}>
          Skip Outro
        </button>
      )}
      {(inOutro || nearEnd) && onNext && (
        <button
          className={classNames(
            btn,
            "border-primary-500/60 bg-primary-600/80 hover:bg-primary-500"
          )}
          onClick={onNext}
        >
          Next Episode ›
        </button>
      )}
    </div>
  );
};

const WatchPlayer: React.FC<WatchPlayerProps> = ({
  videoRef,
  sources = [],
  subtitles = [],
  thumbnail,
  intro,
  outro,
  onNext,
  className,
}) => {
  // Pick the best playable source (skip the blank placeholder, prefer highest quality).
  const src = useMemo(() => {
    const real = sources.filter(
      (s) => s?.file && !s.file.includes("blank.mp4")
    );
    if (!real.length) return undefined;

    const best = [...real].sort(
      (a, b) => (parseInt(b.label, 10) || 0) - (parseInt(a.label, 10) || 0)
    )[0];

    return { src: resolveUrl(best), type: "application/x-mpegurl" };
  }, [sources]);

  const tracks = useMemo(
    () =>
      subtitles
        .filter((s) => s?.file)
        .map((s, i) => ({
          src: resolveUrl(s),
          kind: "subtitles",
          label: s.language || s.lang || `Track ${i + 1}`,
          language: s.lang || "en",
          default: i === 0,
        })),
    [subtitles]
  );

  // Expose the underlying <video> element to the watch page's videoRef so its
  // progress-save / resume logic keeps working.
  const attachPlayer = useCallback(
    (player: any) => {
      if (!player || !videoRef || !("current" in videoRef)) return;
      const grab = () => {
        const v = player.el?.querySelector?.("video");
        if (v) (videoRef as any).current = v;
      };
      grab();
      player.addEventListener?.("can-play", grab);
      player.addEventListener?.("provider-change", grab);
    },
    [videoRef]
  );

  if (!src) return null;

  return (
    <MediaPlayer
      ref={attachPlayer}
      src={src}
      title=""
      crossOrigin
      playsInline
      autoPlay
      logLevel="silent"
      className={classNames(
        "h-full w-full bg-black [--media-brand:theme(colors.primary.500)]",
        className
      )}
    >
      <MediaProvider>
        {tracks.map((t, i) => (
          <Track key={`${t.src}-${i}`} {...t} />
        ))}
      </MediaProvider>

      <DefaultVideoLayout icons={defaultLayoutIcons} thumbnails={thumbnail} />

      {(intro || outro || onNext) && (
        <SkipControls intro={intro} outro={outro} onNext={onNext} />
      )}
    </MediaPlayer>
  );
};

WatchPlayer.displayName = "WatchPlayer";

export default React.memo(WatchPlayer);
