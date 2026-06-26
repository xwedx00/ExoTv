//@ts-nocheck
import React from "react";
import Skeleton, { SkeletonItem } from "@/components/shared/Skeleton";

const EpisodeCardSkeleton = () => {
  return (
    <Skeleton>
      <SkeletonItem className="relative aspect-video"></SkeletonItem>
    </Skeleton>
  );
};

export default EpisodeCardSkeleton;
