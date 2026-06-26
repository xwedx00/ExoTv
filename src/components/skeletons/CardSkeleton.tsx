//@ts-nocheck
import React from "react";
import Skeleton, { SkeletonItem } from "@/components/shared/Skeleton";

const CardSkeleton = () => {
  return (
    <Skeleton>
      <SkeletonItem className="relative aspect-[9/16]"></SkeletonItem>
    </Skeleton>
  );
};

export default CardSkeleton;
