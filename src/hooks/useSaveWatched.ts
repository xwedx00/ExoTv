//@ts-nocheck
import { watchedStore, watchStatusStore } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MutationInput {
  media_id: number;
  episode_id: string;
  watched_time?: number;
  episode_number: number;
}

const useSaveWatched = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutationInput) => {
      const { episode_id, media_id, watched_time, episode_number } = data;

      watchedStore.set({
        mediaId: media_id,
        episodeId: episode_id,
        watchedTime: watched_time,
        episodeNumber: episode_number,
      });

      if (watchStatusStore.get(media_id) !== "COMPLETED") {
        watchStatusStore.set(media_id, "WATCHING");
      }

      return true;
    }
  });
};

export default useSaveWatched;
