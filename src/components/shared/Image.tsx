//@ts-nocheck
import React, { useCallback, useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/legacy/image";
import { motion } from "motion/react";

const variants = {
  hidden: {
    opacity: 0,
    scale: 1.04,
  },

  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.33, 1, 0.68, 1] },
  },
};

interface ImageProps extends NextImageProps {
  containerClassName?: string;
}

const Image: React.FC<ImageProps> = ({ onLoadingComplete, ...props }) => {
  const { containerClassName } = props;

  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadingComplete: NextImageProps["onLoadingComplete"] =
    useCallback(
      (result) => {
        setIsLoaded(true);

        onLoadingComplete?.(result);
      },
      [onLoadingComplete]
    );

  return (
    <motion.div
      initial="hidden"
      variants={variants}
      animate={isLoaded ? "visible" : "hidden"}
      className={containerClassName}
    >
      <NextImage onLoadingComplete={handleLoadingComplete} {...props} />
    </motion.div>
  );
};

export default React.memo(Image);
