//@ts-nocheck
import dayjs from "@/lib/dayjs";

const START_YEAR = 1940;
const CURRENT_YEAR = dayjs().year();

export const WEBSITE_URL = "https://www.exoexs.com";
export const REVALIDATE_TIME = 86_400; // 24 hours
export const SKIP_TIME = 90; // 1m30s


export const supportedUploadImageFormats = ["jpg", "jpeg", "png"];

export const SEASON_YEARS = new Array(CURRENT_YEAR + 1 - START_YEAR)
  .fill(null)
  .map((_, index) => START_YEAR + index)
  .sort((a, b) => b - a);
