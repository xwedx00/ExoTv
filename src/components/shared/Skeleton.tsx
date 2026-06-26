//@ts-nocheck
import classNames from "classnames";
import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={classNames(className)} {...props}>
        {props.children}
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";

interface SkeletonItemProps extends React.HTMLProps<HTMLDivElement> {
  container?: boolean;
  className?: string;
}

export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  container,
  className,
  ...props
}) => {
  return (
    <div
      className={classNames(
        !container &&
          "animate-[shimmer_1.4s_infinite_linear] rounded-md bg-gradient-to-r from-white/[0.04] via-white/[0.12] to-white/[0.04] bg-[length:200%_100%]",
        className
      )}
      {...props}
    ></div>
  );
};

export default Skeleton;
