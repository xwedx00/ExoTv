//@ts-nocheck
import { Chapter, ImageSource } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ReturnSuccessType {
  success: true;
  images: ImageSource[];
}

// Exported so the details-page Chapters guide can prefetch into the SAME cache
// (so opening a chapter reads instantly — no page-image wait).
export const imagesQueryKey = (sourceId: string, sourceChapterId: string) =>
  `images-${sourceId}-${sourceChapterId}`;

export const fetchImagesData = async (
  sourceChapterId: string
): Promise<ReturnSuccessType> => {
  const res = await fetch(
    `/api/manga/images?chapterId=${encodeURIComponent(sourceChapterId)}`
  );
  const data = await res.json();
  return { success: true, images: data?.images || [] };
};

const useFetchImages = (currentChapter: Chapter, nextChapter?: Chapter) => {
  return useQuery({
    queryKey: [
      currentChapter
        ? imagesQueryKey(currentChapter.sourceId, currentChapter.sourceChapterId)
        : "images-none",
    ],
    queryFn: () => fetchImagesData(currentChapter.sourceChapterId),
    enabled: !!currentChapter,
  });
};

export default useFetchImages;
