//@ts-nocheck
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { createProxyUrl } from "@/utils";
import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
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
  className?: string;
}

const resolveUrl = (item: any) =>
  item?.useProxy ? createProxyUrl(item.file, item.proxy) : item?.file;

const WatchPlayer: React.FC<WatchPlayerProps> = ({
  videoRef,
  sources = [],
  subtitles = [],
  thumbnail,
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
    </MediaPlayer>
  );
};

WatchPlayer.displayName = "WatchPlayer";

export default React.memo(WatchPlayer);
