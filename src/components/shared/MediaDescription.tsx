//@ts-nocheck
import useDevice from "@/hooks/useDevice";
import classNames from "classnames";
import { useTranslation } from "@/lib/i18n";
import React, { useCallback, useEffect, useRef } from "react";
import Description from "./Description";

interface MediaDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  description: string;
  className?: string;
  containerClassName?: string;
}

const MediaDescription: React.FC<MediaDescriptionProps> = ({
  description,
  className,
  containerClassName,
  ...props
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    React.useState(false);
  const { t } = useTranslation("common");
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile } = useDevice();

  useEffect(() => {
    if (!ref.current) return;

    const isClamped = ref.current.scrollHeight > ref.current.clientHeight;

    if (!isClamped) {
      setIsDescriptionExpanded(true);
    }
  }, [description]);

  const handleClick = useCallback(() => {
    setIsDescriptionExpanded(true);
  }, []);

  return (
    <div className={classNames("group relative", containerClassName)}>
      <Description
        ref={ref}
        description={description || t("updating") + "..."}
        onClick={isMobile ? handleClick : undefined}
        className={classNames(
          isDescriptionExpanded ? "line-clamp-none" : "line-clamp-6",
          className
        )}
        {...props}
      />

      {!isDescriptionExpanded && !isMobile && (
        <button
          onClick={handleClick}
          className="bg-gradient-to-t from-background-900 via-background-900/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 absolute bottom-0 w-full h-12 text-center"
        >
          {t("Read More")}
        </button>
      )}
    </div>
  );
};

export default MediaDescription;
