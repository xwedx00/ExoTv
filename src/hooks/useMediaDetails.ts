//@ts-nocheck
import { getMediaDetails } from "@/services/anilist";
import { Media, MediaArgs } from "@/types/anilist";
import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const useMediaDetails = (
  args: MediaArgs,
  options?: Omit<
    UseQueryOptions<Media, AxiosError, Media>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["media-details", { args }],
    queryFn: () => getMediaDetails(args),
    ...options
  });
};

export default useMediaDetails;
