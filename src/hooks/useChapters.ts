//@ts-nocheck
import { Chapter } from "@/types";
import { sortMediaUnit } from "@/utils/data";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useChapters = (mediaId: number) => {
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ["chapters", mediaId],
    // TODO(Phase 4/5): wire to in-app API route / socket server
    queryFn: async (): Promise<Chapter[]> => [],
  });

  const chapters = useMemo(() => data ?? [], [data]);

  const sortedChapters = useMemo(
    () => (isLoading ? [] : sortMediaUnit(chapters)),
    [chapters, isLoading]
  );

  return { data: sortedChapters, isLoading, ...rest };
};

export default useChapters;
