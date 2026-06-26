//@ts-nocheck
import classNames from "classnames";
import { motion } from "motion/react";
import NextImage from "next/image";
import React, { useCallback, useState } from "react";

/**
 * Shared image primitive.
 *
 * - Uses the modern `next/image` (the old `next/legacy/image` is deprecated and
 *   threw a "position: static parent" warning on every `layout="fill"` image).
 * - Accepts the legacy `layout` / `objectFit` / `objectPosition` props the rest
 *   of the codebase already passes and translates them to the modern API, so no
 *   caller has to change.
 * - Shows a shimmer skeleton until the bytes decode, then reveals the image with
 *   a smooth fade + settle (motion). Whichever image decodes first reveals first.
 */

const REVEAL_EASE = [0.33, 1, 0.68, 1];

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  /** legacy next/image prop — kept for call-site compatibility */
  layout?: "fill" | "responsive" | "intrinsic" | "fixed";
  objectFit?: React.CSSProperties["objectFit"];
  objectPosition?: React.CSSProperties["objectPosition"];
  width?: number | string;
  height?: number | string;
  /** eager-load this image (use for above-the-fold / in-viewport content) */
  priority?: boolean;
  sizes?: string;
  onLoadingComplete?: (img: HTMLImageElement) => void;
  [key: string]: any;
}

const Image: React.FC<ImageProps> = ({
  containerClassName,
  className,
  layout,
  objectFit = "cover",
  objectPosition,
  width,
  height,
  priority = false,
  sizes,
  onLoadingComplete,
  alt = "",
  src,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(
    (img) => {
      setIsLoaded(true);
      onLoadingComplete?.(img);
    },
    [onLoadingComplete]
  );

  // Legacy `layout="fill"` (or no explicit dimensions) → modern `fill`.
  const isFill = layout === "fill" || (width == null && height == null);

  const imgStyle = {
    objectFit,
    ...(objectPosition ? { objectPosition } : {}),
  };

  const sizeProps = isFill
    ? { fill: true, sizes: sizes || "(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw" }
    : { width, height, sizes };

  return (
    <motion.div
      className={classNames(
        "exotv-img relative overflow-hidden",
        isFill && "h-full w-full",
        containerClassName
      )}
    >
      {/* Shimmer skeleton — visible until the image decodes, then fades out. */}
      <span
        aria-hidden="true"
        className={classNames(
          "exotv-img__shimmer pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ease-out",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      />

      {/* The image reveals (fade + settle) the instant its own bytes decode. */}
      <motion.div
        className="relative z-10 h-full w-full"
        initial={false}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.06 }}
        transition={{ duration: 0.55, ease: REVEAL_EASE }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <NextImage
          {...rest}
          src={src}
          alt={alt}
          unoptimized
          priority={priority}
          {...sizeProps}
          onLoad={handleLoad}
          className={className}
          style={imgStyle}
        />
      </motion.div>
    </motion.div>
  );
};

export default React.memo(Image);
