//@ts-nocheck
import { favoritesStore } from "@/lib/storage";

import { Media, MediaType } from "@/types/anilist";
import { useQuery } from "@tanstack/react-query";

const useIsSubscribed = <T extends MediaType>(type: T, source: Media) => {
  const favoriteType = type === MediaType.Anime ? "anime" : "manga";
  const queryKey = ["is_subscribed", favoriteType, source.id];

  return useQuery({
    queryKey: queryKey,

    queryFn: async () => {
      return favoritesStore.has(favoriteType, source.id);
    }
  });
};

export default useIsSubscribed;
