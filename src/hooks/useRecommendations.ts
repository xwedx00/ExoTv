//@ts-nocheck
import { getRecommendations } from "@/services/anilist";
import { PageArgs, Recommendation, RecommendationArgs } from "@/types/anilist";
import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

const useRecommendations = (
  args: RecommendationArgs & PageArgs,
  options?: Omit<
    UseQueryOptions<Recommendation[], AxiosError, Recommendation[]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["recommendation", { args }],
    queryFn: () => getRecommendations(args),
    ...options
  });
};

export default useRecommendations;
