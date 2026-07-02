//@ts-nocheck
import { Room } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],

    // TODO(Phase 4/5): wire to in-app API route / socket server
    queryFn: async (): Promise<Room[]> => {
      return [];
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export default useRooms;
