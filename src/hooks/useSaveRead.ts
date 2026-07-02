//@ts-nocheck
import { readStatusStore, readStore } from "@/lib/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MutationInput {
  media_id: number;
  chapter_id: string;
}

const useSaveRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MutationInput) => {
      const { chapter_id, media_id } = data;

      readStore.set({
        mediaId: media_id,
        chapterId: chapter_id,
      });

      if (readStatusStore.get(media_id) !== "COMPLETED") {
        readStatusStore.set(media_id, "READING");
      }

      return true;
    },

    onSuccess: (_, { media_id }) => {
      queryClient.invalidateQueries({
        queryKey: ["read", media_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["kaguya_read_status", media_id]
      });
    }
  });
};

export default useSaveRead;
