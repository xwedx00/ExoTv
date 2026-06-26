//@ts-nocheck
import { Chapter, ImageSource } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ReturnSuccessType {
  success: true;
  images: ImageSource[];
}

const useFetchImages = (currentChapter: Chapter, nextChapter?: Chapter) => {
  // TODO(Phase 4/5): wire to in-app API route / socket server
  const fetchImages = async (_chapter: Chapter): Promise<ReturnSuccessType> => ({
    success: true,
    images: [] as ImageSource[],
  });

  const getQueryKey = (chapter: Chapter) =>
    `images-${chapter.sourceId}-${chapter.sourceChapterId}`;

  return useQuery({
    queryKey: [getQueryKey(currentChapter)],
    queryFn: () => fetchImages(currentChapter),
  });
};

export default useFetchImages;
