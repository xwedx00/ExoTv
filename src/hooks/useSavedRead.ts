//@ts-nocheck
import { readStore } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";

const useSavedRead = (mangaId: number) => {
  return useQuery({
    queryKey: ["read", mangaId],
    queryFn: () => {
      const entry = readStore.get(mangaId);
      // Mirror the old joined shape the read page expects (savedReadData.chapter.*)
      return entry ? { ...entry, chapter: entry } : null;
    },
    retry: 0
  });
};

export default useSavedRead;
