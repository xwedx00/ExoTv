import type { NextApiRequest, NextApiResponse } from "next";
import { getChapterImages } from "@/lib/sources/manga";

/** GET /api/manga/images?chapterId=<mangadexChapterId> */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chapterId } = req.query;
  if (!chapterId || Array.isArray(chapterId)) {
    res.status(400).json({ success: false, error: "Missing chapterId" });
    return;
  }

  try {
    const images = await getChapterImages(chapterId);
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    res.status(200).json({ success: true, images });
  } catch (err: any) {
    res
      .status(200)
      .json({ success: false, images: [], error: String(err?.message ?? err) });
  }
}
