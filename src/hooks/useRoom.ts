//@ts-nocheck
import { getMediaDetails } from "@/services/anilist";
import { mediaDefaultFields } from "@/services/anilist/queries";
import { AnimeSourceConnection, Room } from "@/types";
import { MediaType } from "@/types/anilist";
import supabaseClient from "@/lib/supabase";

import { useMemo } from "react";
import { useQuery } from "react-query";
import { toast } from "react-toastify";

const useRoom = (roomId: number, initialData: Room) => {
  const queryKey = useMemo(() => ["room", roomId], [roomId]);

  return useQuery(
    queryKey,
    async () => {
      const { data: room, error } = await supabaseClient
        .from<Room>("kaguya_rooms")
        .select(
          `
            *,
            episode:episodeId(*),
            users:kaguya_room_users(*),
            hostUser:hostUserId(*)
          `
        )
        .eq("id", roomId)
        .limit(1)
        .single();

      if (error) throw error;

      const sourceConnectionPromise = supabaseClient
        .from<AnimeSourceConnection>("kaguya_anime_source")
        .select(
          `
            episodes:kaguya_episodes(*, source:kaguya_sources(*))
          `
        )
        .eq("mediaId", room.mediaId);

      const mediaPromise = getMediaDetails(
        {
          id: room.mediaId,
          type: MediaType.Anime,
        },
        mediaDefaultFields
      );

      const [
        { data: sourceConnectionData, error: sourceConnectionError },
        media,
      ] = await Promise.all([sourceConnectionPromise, mediaPromise]);

      if (sourceConnectionError) {
        throw sourceConnectionError;
      }

      const episodes = sourceConnectionData
        .flatMap((connection) => connection.episodes)
        .filter((episode) => episode.published);

      return { ...room, media, episodes };
    },

    {
      onError: (error: Error) => {
        toast.error(error.message);
      },
      initialData,
      enabled: false,
    }
  );
};

export default useRoom;
