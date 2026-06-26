//@ts-nocheck
import { Room } from "@/types";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface CreateRoomBody {
  mediaId: number;
  episodeId: string;
  title?: string;
  visibility: "public" | "private";
}

const useCreateRoom = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (body: CreateRoomBody): Promise<Room | null> => {
      // TODO(Phase 4/5): wire to in-app API route / socket server
      return null;
    },

    onSuccess: (room) => {
      if (!room) return;

      router.replace(`/wwf/${room.id}`);
    },

    onError: (error) => {
      toast.error(error);
    },
  });
};

export default useCreateRoom;
