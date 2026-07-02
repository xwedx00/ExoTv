import type { NextApiRequest, NextApiResponse } from "next";
import { getChapters } from "@/lib/sources/manga";

/** GET /api/manga/chapters?id=<anilistId>&title=<optional known title> */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, title } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ success: false, error: "Missing anilist id" });
    return;
  }

  try {
    const chapters = await getChapters(
      id,
      typeof title === "string" ? title : undefined
    );
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.status(200).json({ success: true, chapters });
  } catch (err: any) {
    res
      .status(200)
      .json({ success: true, chapters: [], error: String(err?.message ?? err) });
  }
}
