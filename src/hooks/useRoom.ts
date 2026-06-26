//@ts-nocheck
import { Room } from "@/types";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

const useRoom = (roomId: number, initialData: Room) => {
  const queryKey = useMemo(() => ["room", roomId], [roomId]);

  return useQuery({
    queryKey,
    // TODO(Phase 4/5): wire to in-app API route / socket server
    // Real impl will fetch the room (host/users/episodes) + AniList media.
    // For now resolve to the passed-in room shape so callers stay typed.
    queryFn: async (): Promise<Room> => initialData ?? null,
    initialData,
    enabled: false,
  });
};

export default useRoom;
