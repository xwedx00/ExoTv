//@ts-nocheck
import enTranslations from "@/constants/en";
import { Chapter, Episode, Translation as TranslationType } from "@/types";
import { Media } from "@/types/anilist";
import { Translation } from "@/lib/i18n";
import { parseNumbersFromString } from ".";

type Translate = { readonly value: string; readonly label: string } & Record<
  string,
  any
>;

type TranslationKeys = [
  "SEASONS",
  "FORMATS",
  "STATUS",
  "GENRES",
  "CHARACTERS_ROLES",
  "ANIME_SORTS",
  "MANGA_SORTS",
  "TYPES",
  "COUNTRIES",
  "VISIBILITY_MODES",
  "CHAT_EVENT_TYPES",
  "READ_STATUS",
  "WATCH_STATUS",
  "GENDERS",
  "EMOJI_GROUP"
];
type Translation = Record<TranslationKeys[number], Translate[]>;

export const getConstantTranslation = (_locale?: string) => {
  // English-only app; the non-English locale constant files were removed.
  return enTranslations;
};

const composeTranslation = (translation: Translation) => {
  return {
    season: translation.SEASONS as Translate[],
    format: translation.FORMATS as Translate[],
    status: translation.STATUS as Translate[],
    genre: translation.GENRES as Translate[],
    characterRole: translation.CHARACTERS_ROLES as Translate[],
    animeSort: translation.ANIME_SORTS as Translate[],
    mangaSort: translation.MANGA_SORTS as Translate[],
    type: translation.TYPES as Translate[],
    country: translation.COUNTRIES as Translate[],
  };
};

const types = [
  "season",
  "format",
  "status",
  "genre",
  "characterRole",
  "animeSort",
  "mangaSort",
  "type",
  "country",
] as const;

type ConvertOptions = {
  reverse?: boolean;
  locale?: string;
};

export const convert = (
  text: string,
  type: typeof types[number],
  options: ConvertOptions = {}
) => {
  const { locale, reverse } = options;

  // @ts-ignore
  const constants = composeTranslation(getConstantTranslation(locale));

  const constant = constants[type];

  if (!constant) return text;

  const index = constant.findIndex(
    (el: typeof constant[number]) => el.value === text || el.label === text
  );

  if (index === -1) return null;

  if (reverse) return constant[index].value;

  return constant[index].label;
};

// Title language (English ⇄ native), driven globally by SettingsContext so every
// getTitle/getDescription call reflects the user's choice without threading it
// through every call site. Defaults to English (fixes the romaji/"Japanese"
// titles that AniList's `userPreferred` returns by default).
export type TitleLanguage = "english" | "native";

let currentTitleLanguage: TitleLanguage = "english";

export const setTitleLanguage = (lang: TitleLanguage) => {
  currentTitleLanguage = lang;
};

export const getCurrentTitleLanguage = () => currentTitleLanguage;

// Second arg may be the legacy `locale` string (ignored now) or an options object.
type TitleOptions =
  | string
  | { titleLanguage?: TitleLanguage; forceNative?: boolean }
  | undefined;

const titleOptions = (opts: TitleOptions) =>
  opts && typeof opts === "object" ? opts : {};

export const getTitle = (data: Media, opts?: TitleOptions) => {
  if (!data) return "";

  const o = titleOptions(opts);
  const title = data.title || ({} as any);

  // Details pages pass forceNative to keep the original/canonical AniList title
  // (exactly what was shown before) regardless of the global English/native toggle.
  if (o.forceNative) {
    return (
      title.userPreferred || title.native || title.romaji || title.english || ""
    );
  }

  const lang = o.titleLanguage ?? currentTitleLanguage;

  if (lang === "native") {
    return (
      title.native || title.userPreferred || title.romaji || title.english || ""
    );
  }

  // English (default)
  return (
    title.english || title.userPreferred || title.romaji || title.native || ""
  );
};

export const getDescription = (data: Media, opts?: TitleOptions) => {
  if (!data) return "";

  const o = titleOptions(opts);
  const translations = data.translations || [];
  const lang = o.forceNative
    ? "native"
    : o.titleLanguage ?? currentTitleLanguage;

  if (lang === "native") {
    const native = translations.find((t) => t.locale && t.locale !== "en");
    return native?.description || data.description || "";
  }

  // English (default) — AniList descriptions are English.
  const en = translations.find((t) => t.locale === "en");
  return en?.description || data.description || "";
};

export const sortMediaUnit = <T extends Chapter | Episode>(data: T[]) => {
  return data.sort((a, b) => {
    const aNumber = parseNumbersFromString(a.name, 9999)?.[0];
    const bNumber = parseNumbersFromString(b.name, 9999)?.[0];

    return aNumber - bNumber;
  });
};
