import type { NextApiRequest, NextApiResponse } from "next";
import { getEpisodes } from "@/lib/sources/anime";

/** GET /api/anime/episodes?id=<anilistId>&provider=<optional preferred provider> */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, provider } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ success: false, error: "Missing anilist id" });
    return;
  }

  try {
    const episodes = await getEpisodes(
      id,
      typeof provider === "string" ? provider : undefined
    );
    // Episode lists are fairly stable — cache at the edge, revalidate in background.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.status(200).json({ success: true, episodes });
  } catch (err: any) {
    res
      .status(200)
      .json({ success: true, episodes: [], error: String(err?.message ?? err) });
  }
}
