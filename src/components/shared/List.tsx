//@ts-nocheck
import { ArrayElement } from "@/utils/types";
import classNames from "classnames";
import { motion } from "motion/react";
import React, { useMemo } from "react";

// 2026 entrance: items reveal when they scroll into the viewport, cascading
// right-to-left across each row (rightmost first), rows top-to-bottom. The grid
// is at most 7 columns (2xl), so we stagger within groups of 7.
const REVEAL_EASE = [0.33, 1, 0.68, 1];
const REVEAL_COLS = 7;

interface ListProps<T extends any[]>
  extends React.HTMLAttributes<HTMLDivElement> {
  data: T;
  children: (data: ArrayElement<T>) => React.ReactNode;
  noListMessage?: React.ReactNode;
}

const defaultClassName =
  "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";

const List = <T extends any[]>({
  data,
  children,
  className = "",
  noListMessage = "No data.",
  ...props
}: ListProps<T>) => {
  const validClassName = useMemo(
    () => (className.includes("grid-cols") ? className : defaultClassName),
    [className]
  );

  return (
    <div
      className={classNames(
        data.length ? "grid gap-4" : "text-center",
        validClassName
      )}
      {...props}
    >
      {data.length ? (
        data.map((item, index) => (
          <motion.div
            className="col-span-1"
            key={index}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{
              duration: 0.5,
              ease: REVEAL_EASE,
              delay: ((REVEAL_COLS - 1 - (index % REVEAL_COLS)) * 0.05),
            }}
          >
            {children(item)}
          </motion.div>
        ))
      ) : (
        <p className="text-2xl">{noListMessage}</p>
      )}
    </div>
  );
};

export default React.memo(List) as typeof List;
