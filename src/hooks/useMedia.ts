//@ts-nocheck
import { getMedia } from "@/services/anilist";
import { Media, MediaArgs, PageArgs } from "@/types/anilist";
import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const useMedia = (
  args: MediaArgs & PageArgs,
  options?: Omit<
    UseQueryOptions<Media[], AxiosError, Media[]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["media", { args }],
    queryFn: () => getMedia(args),
    ...options
  });
};

export default useMedia;
