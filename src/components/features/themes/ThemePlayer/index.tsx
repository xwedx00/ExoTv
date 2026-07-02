//@ts-nocheck
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { useThemePlayer } from "@/contexts/ThemePlayerContext";
import { useThemeSettings } from "@/contexts/ThemeSettingsContext";
import { createProxyUrl } from "@/utils";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo } from "react";
import { AiOutlineReload } from "react-icons/ai";

interface ThemeSource {
  file: string;
  useProxy?: boolean;
  proxy?: Record<string, unknown>;
}

interface ThemePlayerProps {
  sources?: ThemeSource[];
  className?: string;
}

const resolveUrl = (item?: ThemeSource) =>
  item?.useProxy ? createProxyUrl(item.file, item.proxy) : item?.file;

/**
 * Themes (anime OP/ED) player. Unified onto the SAME Vidstack player as the
 * watch page (replacing the abandoned `netplayer`, which froze on React 19 and
 * emitted nested-<button> markup). Plays the direct OP/ED video file, autoplays,
 * loops or auto-advances based on the user's end-mode setting, and exposes a
 * "New theme" control (also Shift+N) that pulls a fresh random theme.
 */
const ThemePlayer: React.FC<ThemePlayerProps> = ({ sources = [], className }) => {
  const { endMode } = useThemeSettings();
  const { refresh } = useThemePlayer();

  const src = useMemo(() => {
    const real = sources.filter(
      (s) => s?.file && !s.file.includes("blank.mp4")
    );
    if (!real.length) return undefined;
    const url = resolveUrl(real[0]);
    // Give Vidstack an explicit type so it selects the video provider for these
    // direct OP/ED files (animethemes serves .webm, occasionally .mp4) instead
    // of leaving the source unresolved.
    const type = /\.webm(\?|$)/i.test(url)
      ? "video/webm"
      : /\.mp4(\?|$)/i.test(url)
        ? "video/mp4"
        : undefined;
    return type ? { src: url, type } : url;
  }, [sources]);

  const srcKey = typeof src === "string" ? src : src?.src;

  const handleEnded = useCallback(() => {
    if (endMode === "refresh") refresh();
  }, [endMode, refresh]);

  // Shift+N -> play a new random theme (parity with the old netplayer hotkey).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        refresh();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [refresh]);

  if (!src) return null;

  return (
    <div className={classNames("relative bg-black", className)}>
      <MediaPlayer
        key={srcKey}
        src={src}
        title=""
        autoPlay
        playsInline
        load="eager"
        preload="auto"
        loop={endMode === "repeat"}
        logLevel="silent"
        onEnded={handleEnded}
        className="h-full w-full bg-black [--media-brand:theme(colors.primary.500)]"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      <button
        onClick={refresh}
        title="Play a new theme (Shift+N)"
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-primary-600"
      >
        <AiOutlineReload className="h-5 w-5" />
        New theme
      </button>
    </div>
  );
};

ThemePlayer.displayName = "ThemePlayer";

export default ThemePlayer;
