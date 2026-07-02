//@ts-nocheck
import { favoritesStore, FavoriteType } from "@/lib/storage";

import { Media, MediaType } from "@/types/anilist";
import { getTitle } from "@/utils/data";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const useSubscribe = <T extends MediaType>(type: T, source: Media) => {
  const queryClient = useQueryClient();
  const { locale } = useRouter();
  const { t } = useTranslation("notification");

  const mediaTitle = useMemo(() => getTitle(source, locale), [locale, source]);

  const favoriteType: FavoriteType =
    type === MediaType.Anime ? "anime" : "manga";
  const queryKey = ["is_subscribed", favoriteType, source.id];

  return useMutation({
    mutationFn: async () => {
      favoritesStore.add(favoriteType, source.id);

      return true;
    },

    onMutate: () => {
      queryClient.setQueryData(queryKey, true);
    },

    onSuccess: () => {
      toast.success(t("subscribed_msg", { mediaTitle }));
    },

    onError: (error) => {
      toast.error(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey
      });
    }
  });
};

export default useSubscribe;
