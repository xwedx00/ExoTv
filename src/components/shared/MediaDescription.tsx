//@ts-nocheck
import classNames from "classnames";
import { useTranslation } from "@/lib/i18n";
import React from "react";
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
  const { t } = useTranslation("common");

  // Always show the full synopsis — no clamp, no "Read more" gate.
  return (
    <div className={classNames("group relative", containerClassName)}>
      <Description
        description={description || t("updating") + "..."}
        className={classNames("line-clamp-none", className)}
        {...props}
      />
    </div>
  );
};

export default MediaDescription;
