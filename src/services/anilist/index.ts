//@ts-nocheck
import {
  AiringSchedule,
  AiringScheduleArgs,
  CharacterArgs,
  MediaArgs,
  MediaType,
  PageArgs,
  RecommendationArgs,
  StaffArgs,
  StudioArgs,
} from "@/types/anilist";
import { removeArrayOfObjectDup } from "@/utils";
import axios from "axios";
import {
  airingSchedulesQuery,
  charactersDefaultFields,
  charactersQuery,
  mediaDefaultFields,
  mediaDetailsQuery,
  MediaDetailsQueryResponse,
  mediaQuery,
  PageQueryResponse,
  recommendationsQuery,
  staffDefaultFields,
  staffQuery,
  studioDetailsQuery,
  StudioDetailsQueryResponse,
  studiosQuery,
} from "./queries";

const GRAPHQL_URL = "https://graphql.anilist.co";

export const anilistFetcher = async <T>(query: string, variables: any): Promise<T> => {
  // Use native fetch, NOT axios: axios resolves to its Node http adapter inside
  // the Turbopack client bundle and hangs in the browser (every catalog/detail
  // query stalled forever). fetch works in both runtimes. Retry once on 429.
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("retry-after")) || 1;
      await new Promise((r) => setTimeout(r, (retryAfter + attempt) * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`AniList ${res.status} for query`);

    const json = await res.json();
    return json?.data as T;
  }
  throw new Error("AniList rate-limited");
};

export const getPageMedia = async (
  args: MediaArgs & PageArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    mediaQuery(fields),
    args
  );

  return response?.Page;
};

export const getMedia = async (args: MediaArgs & PageArgs, fields?: string) => {
  const response = await anilistFetcher<PageQueryResponse>(
    mediaQuery(fields),
    args
  );

  const mediaList = response?.Page?.media || [];

  return mediaList;
};

export const getMediaDetails = async (
  args: MediaArgs & PageArgs,
  fields?: string
) => {
  const response = await anilistFetcher<MediaDetailsQueryResponse>(
    mediaDetailsQuery(fields),
    args
  );

  return response?.Media;
};


export const getAiringSchedules = async (
  args: AiringScheduleArgs & PageArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    airingSchedulesQuery(fields),
    args
  );

  return response?.Page.airingSchedules;
};

export const getRecommendations = async (
  args: RecommendationArgs & PageArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    recommendationsQuery(fields),
    args
  );

  return response?.Page.recommendations;
};

export const getAllAiringSchedules = async (
  args: PageArgs & AiringScheduleArgs,
  fields?: string
) => {
  let list: AiringSchedule[] = [];

  let page = 1;

  const fetch = async () => {
    const response = await anilistFetcher<PageQueryResponse>(
      airingSchedulesQuery(fields),
      { ...args, page }
    );

    list = list.concat(response?.Page.airingSchedules);

    if (response?.Page.pageInfo.hasNextPage) {
      page++;
      await fetch();
    }
  };

  await fetch();

  return removeArrayOfObjectDup(list, "mediaId");
};

export const getCharacters = async (
  args: PageArgs & CharacterArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    charactersQuery(fields),
    args
  );

  return response?.Page.characters;
};

export const getPageCharacters = async (
  args: PageArgs & CharacterArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    charactersQuery(fields),
    args
  );

  return response?.Page;
};

export const getCharacterDetails = async (
  args: PageArgs & CharacterArgs,
  fields?: string
) => {
  const defaultFields = `
    ${charactersDefaultFields}
    media {
      edges {
        node {
          ${mediaDefaultFields}
        }
        voiceActors {
          ${staffDefaultFields}
        }
      }
    }
  `;

  const response = await anilistFetcher<PageQueryResponse>(
    charactersQuery(fields || defaultFields),
    { ...args, perPage: 1 }
  );

  return response?.Page.characters[0];
};

export const getStaff = async (args: PageArgs & StaffArgs, fields?: string) => {
  const response = await anilistFetcher<PageQueryResponse>(
    staffQuery(fields),
    args
  );

  return response?.Page.staff;
};

export const getStaffDetails = async (
  args: PageArgs & StaffArgs,
  fields?: string
) => {
  const defaultFields = `
    ${staffDefaultFields}
    characters {
      nodes {
        ${charactersDefaultFields}
      }
    }
  `;

  const response = await anilistFetcher<PageQueryResponse>(
    staffQuery(fields || defaultFields),
    { ...args, perPage: 1 }
  );

  return response?.Page.staff[0];
};

export const getPageStaff = async (
  args: PageArgs & StaffArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    staffQuery(fields),
    args
  );

  return response?.Page;
};

export const getStudios = async (
  args: PageArgs & StudioArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    studiosQuery(fields),
    args
  );

  return response?.Page.studios;
};

export const getPageStudios = async (
  args: PageArgs & StudioArgs,
  fields?: string
) => {
  const response = await anilistFetcher<PageQueryResponse>(
    studiosQuery(fields),
    args
  );

  return response?.Page;
};

export const getStudioDetails = async (
  args: PageArgs & StudioArgs,
  fields?: string
) => {
  const response = await anilistFetcher<StudioDetailsQueryResponse>(
    studioDetailsQuery(fields),
    args
  );

  return response?.Studio;
};
