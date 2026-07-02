//@ts-nocheck
import classNames from "classnames";
import React, { useMemo } from "react";

interface RangePickerProps {
  total: number;
  chunkSize?: number;
  value: number; // selected range index
  onChange: (index: number) => void;
  className?: string;
  /** Custom label per chunk (start, end are 0-based item indices). Defaults to "start+1 – end". */
  labelFor?: (start: number, end: number) => string;
}

/**
 * Compact "pick a range" selector so long episode/chapter lists never render as
 * one infinite scroll. Renders e.g. [1–100] [101–200] … pills.
 */
const RangePicker: React.FC<RangePickerProps> = ({
  total,
  chunkSize = 100,
  value,
  onChange,
  className,
  labelFor,
}) => {
  const ranges = useMemo(() => {
    const r: { start: number; end: number; label: string }[] = [];
    for (let start = 0; start < total; start += chunkSize) {
      const end = Math.min(start + chunkSize, total);
      r.push({
        start,
        end,
        label: labelFor ? labelFor(start, end) : `${start + 1} – ${end}`,
      });
    }
    return r;
  }, [total, chunkSize, labelFor]);

  if (ranges.length <= 1) return null;

  return (
    <div className={classNames("flex flex-wrap gap-2", className)}>
      {ranges.map((r, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={classNames(
            "rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums transition",
            i === value
              ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
              : "bg-white/5 text-gray-300 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
};

export const rangeBounds = (index: number, chunkSize: number) => ({
  start: index * chunkSize,
  end: (index + 1) * chunkSize,
});

export default RangePicker;
