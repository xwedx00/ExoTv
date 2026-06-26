import type { NextApiRequest, NextApiResponse } from "next";
import { getSources } from "@/lib/sources/anime";

/** GET /api/anime/sources?episodeId=<providerEpisodeId>&provider=<providerId> */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { episodeId, provider } = req.query;
  if (!episodeId || Array.isArray(episodeId) || typeof provider !== "string") {
    res
      .status(400)
      .json({ success: false, error: "Missing episodeId or provider" });
    return;
  }

  try {
    const data = await getSources(episodeId, provider);
    // Stream URLs carry expiring tokens — never long-cache them.
    res.setHeader("Cache-Control", "private, max-age=60");
    res.status(200).json({ success: true, ...data });
  } catch (err: any) {
    res.status(200).json({
      success: false,
      sources: [],
      subtitles: [],
      fonts: [],
      error: String(err?.message ?? err),
    });
  }
}
