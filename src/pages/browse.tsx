//@ts-nocheck
import { MediaFormat, MediaSort } from "@/types/anilist";
import AnimeBrowseList from "@/components/features/anime/AnimeBrowseList";
import CharacterBrowseList from "@/components/features/characters/CharacterBrowseList";
import MangaBrowseList from "@/components/features/manga/MangaBrowseList";
import VABrowseList from "@/components/features/va/VABrowseList";
import Head from "@/components/shared/Head";
import Select from "@/components/shared/Select";
import useConstantTranslation from "@/hooks/useConstantTranslation";
import { useTranslation } from "@/lib/i18n";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import Section from "@/components/shared/Section";

const components = {
  anime: AnimeBrowseList,
  manga: MangaBrowseList,
  characters: CharacterBrowseList,
  voice_actors: VABrowseList,
};

const convertQueryToArray = <T,>(query: T[]) => {
  if (typeof query === "string") return [query];

  return query;
};

const typeSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.04)",
    border: 0,
    boxShadow: "none",
    borderRadius: "0.85rem",
    padding: "0 0.35rem",
    cursor: "pointer",
    transition: "background-color 200ms",
    ":hover": { backgroundColor: "rgba(255,255,255,0.08)" },
  }),
  singleValue: (provided) => ({
    ...provided,
    fontSize: "2.25rem",
    lineHeight: "2.5rem",
    color: "white",
    fontWeight: 600,
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: "2.25rem",
    lineHeight: "2.5rem",
    color: "white",
    fontWeight: 600,
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "rgba(255,255,255,0.55)",
    ":hover": { color: "#fff" },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "rgba(17,25,40,0.92)",
    backdropFilter: "blur(16px) saturate(170%)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.75rem",
    overflow: "hidden",
    minWidth: "13rem",
    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
  }),
};

const BrowsePage = ({ query: baseQuery }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { TYPES } = useConstantTranslation();

  const {
    format = undefined,
    keyword = "",
    season = undefined,
    seasonYear = undefined,
    sort = "popularity",
    genres = [],
    tags = [],
    countries = [],
    type = "anime",
  } = baseQuery;

  const query = {
    format: format as MediaFormat,
    keyword: keyword as string,
    genres: convertQueryToArray<string>(genres),
    tags: convertQueryToArray<string>(tags),
    countries: convertQueryToArray<string>(countries),
    season: season as string,
    seasonYear: seasonYear as string,
    sort: sort as MediaSort,
    type,
  };

  const handleTypeChange = (type: typeof TYPES[number]) => {
    const truthyQuery = {};

    Object.keys(query).forEach((key) => {
      if (!query[key]) return;

      truthyQuery[key] = query[key];
    });

    router.replace({
      query: { ...truthyQuery, type: type.value },
      pathname: "/browse",
    });
  };

  const BrowseComponent = useMemo(() => components[type], [type]);
  const chosenType = useMemo(
    () => TYPES.find((t) => t.value === type),
    [TYPES, type]
  );

  return (
    <Section className="py-20">
      <Head
        title={`Search ${chosenType.label} - ExoTv`}
        description={`Search ${chosenType.label} in ExoTv`}
      />

      <div className="mb-8 flex items-center space-x-2">
        <h1 className="text-4xl font-semibold text-center md:text-left">
          {t("common:search")}
        </h1>

        <Select
          value={{ value: type, label: chosenType.label }}
          options={TYPES}
          isClearable={false}
          isSearchable={false}
          components={{ IndicatorSeparator: () => null }}
          onChange={handleTypeChange}
          styles={typeSelectStyles}
        />
      </div>

      <BrowseComponent defaultQuery={query} />
    </Section>
  );
};

BrowsePage.getInitialProps = ({ query }) => {
  return { query };
};

export default BrowsePage;
