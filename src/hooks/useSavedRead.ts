//@ts-nocheck
import { readStore } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";

const useSavedRead = (mangaId: number) => {
  return useQuery({
    queryKey: ["read", mangaId],
    queryFn: () => readStore.get(mangaId) ?? null,
    retry: 0
  });
};

export default useSavedRead;
