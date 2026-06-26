//@ts-nocheck
import { Chapter, ImageSource } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ReturnSuccessType {
  success: true;
  images: ImageSource[];
}

const useFetchImages = (currentChapter: Chapter, nextChapter?: Chapter) => {
  const fetchImages = async (
    chapter: Chapter
  ): Promise<ReturnSuccessType> => {
    const res = await fetch(
      `/api/manga/images?chapterId=${encodeURIComponent(
        chapter.sourceChapterId
      )}`
    );
    const data = await res.json();
    return { success: true, images: data?.images || [] };
  };

  const getQueryKey = (chapter?: Chapter) =>
    chapter
      ? `images-${chapter.sourceId}-${chapter.sourceChapterId}`
      : "images-none";

  return useQuery({
    queryKey: [getQueryKey(currentChapter)],
    queryFn: () => fetchImages(currentChapter),
    enabled: !!currentChapter,
  });
};

export default useFetchImages;
