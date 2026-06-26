//@ts-nocheck
import { useReadSettings } from "@/contexts/ReadSettingsContext";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { ImageSource } from "@/types";
import { createProxyUrl } from "@/utils";
import classNames from "classnames";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BsFillImageFill } from "react-icons/bs";

interface ReadImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  onVisible?: () => void;
  image: ImageSource;
  loadingClassName?: string;
  containerClassName?: string;
}

const ReadImage: React.FC<ReadImageProps> = ({
  image,
  className,
  loadingClassName,
  onLoad,
  onVisible,
  containerClassName,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const { fitMode } = useReadSettings();
  const ref = useRef<HTMLImageElement>(null);

  const entry = useIntersectionObserver(ref, {
    rootMargin: "0px 0px 10px 0px",
  });

  useEffect(() => {
    setLoaded(false);
  }, [image]);

  useEffect(() => {
    if (!entry?.isIntersecting) return;
    if (!ref.current) return;
    if (!ref.current.complete) return;

    onVisible?.();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.isIntersecting]);

  const src = useMemo(
    () =>
      image.useProxy ? createProxyUrl(image.image, image.proxy) : image.image,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [image.image]
  );

  // I have to use img instead of Next/Image because I want to image calculate the height itself
  return (
    <React.Fragment>
      {!loaded && (
        <div
          className={classNames(
            "flex h-72 w-full items-center justify-center bg-gradient-to-r from-white/[0.03] via-white/[0.09] to-white/[0.03] bg-[length:200%_100%] text-white/25 animate-[shimmer_1.4s_infinite_linear]",
            loadingClassName
          )}
        >
          <BsFillImageFill className="h-8 w-8" />
        </div>
      )}

      <motion.div
        animate={loaded ? "animate" : "initial"}
        initial="initial"
        exit="exit"
        variants={{
          animate: { opacity: 1, display: "block" },
          initial: { opacity: 0, display: "none" },
        }}
        className={containerClassName}
      >
        {/* eslint-disable-next-line */}
        <img
          ref={ref}
          className={classNames(
            fitMode === "auto" && "w-auto h-auto",
            fitMode === "width" && "w-full h-auto",
            fitMode === "height" && "w-auto h-screen",
            className
          )}
          alt="Manga page"
          src={src}
          onLoad={(e) => {
            setLoaded(true);

            onLoad?.(e);
          }}
          onError={() => {
            setLoaded(true);
          }}
          {...props}
        />
      </motion.div>
    </React.Fragment>
  );
};

export default React.memo(ReadImage);
