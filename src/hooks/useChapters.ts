//@ts-nocheck
import { Chapter } from "@/types";
import { sortMediaUnit } from "@/utils/data";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useChapters = (mediaId: number) => {
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ["chapters", mediaId],
    queryFn: async (): Promise<Chapter[]> => {
      const res = await fetch(`/api/manga/chapters?id=${mediaId}`);
      const data = await res.json();
      return data?.chapters || [];
    },
  });

  const chapters = useMemo(() => data ?? [], [data]);

  const sortedChapters = useMemo(
    () => (isLoading ? [] : sortMediaUnit(chapters)),
    [chapters, isLoading]
  );

  return { data: sortedChapters, isLoading, ...rest };
};

export default useChapters;
