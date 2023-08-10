//@ts-nocheck
import Button from "@/components/shared/Button";
import Card from "@/components/shared/Card";
import CharacterConnectionCard from "@/components/shared/CharacterConnectionCard";
import CircleButton from "@/components/shared/CircleButton";
import DetailsBanner from "@/components/shared/DetailsBanner";
import DetailsSection from "@/components/shared/DetailsSection";
import DotList from "@/components/shared/DotList";
import Head from "@/components/shared/Head";
import InfoItem from "@/components/shared/InfoItem";
import List from "@/components/shared/List";
import MediaDescription from "@/components/shared/MediaDescription";
import NotificationButton from "@/components/shared/NotificationButton";
import PlainCard from "@/components/shared/PlainCard";
import Section from "@/components/shared/Section";
import SourceStatus from "@/components/shared/SourceStatus";
import { REVALIDATE_TIME } from "@/constants";
import { useUser } from "@/contexts/AuthContext";
import withRedirect from "@/hocs/withRedirect";
import { getMediaDetails } from "@/services/anilist";
import { Media, MediaType } from "@/types/anilist";
import { numberWithCommas } from "@/utils";
import { convert, getDescription, getTitle } from "@/utils/data";

import classNames from "classnames";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { isMobile } from "react-device-detect";

import { BsFillPlayFill } from "react-icons/bs";

interface DetailsPageProps {
  manga: Media;
}

const DetailsPage: NextPage<DetailsPageProps> = ({ manga }) => {
  const user = useUser();
  const { locale } = useRouter();
  

  const title = useMemo(() => getTitle(manga, locale), [manga, locale]);
  const description = useMemo(
    () => getDescription(manga, locale),
    [manga, locale]
  );

  return <>
    <Head
      title={`${title} - Exoexs`}
      description={description}
      image={manga.bannerImage}
    />

    <div className="pb-8">
      <DetailsBanner image={manga.bannerImage} />

      <Section className="relative z-10 bg-background-900 pb-4">
        <div className="flex md:space-x-8">
          <div className="shrink-0 relative md:static md:left-0 md:-translate-x-0 w-[120px] md:w-[186px] -mt-20 space-y-6">
            <PlainCard src={manga.coverImage.extraLarge} alt={title} />

            {user && !isMobile && (
              <div className="flex items-center space-x-1">
                <SourceStatus type={MediaType.Manga} source={manga} />
                <NotificationButton type={MediaType.Manga} source={manga} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between md:py-4 ml-4 text-left items-start md:-mt-16 space-y-4">
            <div className="flex flex-col items-start space-y-4 md:no-scrollbar">
              <div className="hidden md:flex items-center flex-wrap gap-2 mb-4">
               
              </div>

              <p className="text-2xl md:text-3xl font-semibold mb-2">
                {title}
              </p>

              <DotList>
                {manga.genres.map((genre) => (
                  <span key={genre}>
                    {convert(genre, "genre", { locale })}
                  </span>
                ))}
              </DotList>

              <MediaDescription
                description={description}
                containerClassName="mt-4 mb-8 hidden md:block"
                className="text-gray-300 hover:text-gray-100 transition duration-300"
              />

              {/* MAL-Sync UI */}
              <div id="mal-sync" className="hidden md:block"></div>
            </div>

            <div className="hidden md:flex gap-x-8 overflow-x-auto md:gap-x-16 [&>*]:shrink-0">
              <InfoItem
                title="Country"
                value={manga.countryOfOrigin}
              />

              <InfoItem
                title="Status"
                value={convert(manga.status, "status", { locale })}
              />

              <InfoItem title="Total Chapters" value={manga.chapters} />

              <InfoItem
                title="Age Rated"
                value={manga.isAdult ? "18+" : ""}
              />
            </div>
          </div>
        </div>

        <MediaDescription
          description={description}
          containerClassName="my-4 block md:hidden"
          className="text-gray-300 hover:text-gray-100 transition duration-300"
        />

        <div className="flex md:hidden items-center space-x-2 mb-4">
          {user && isMobile && (
            <SourceStatus type={MediaType.Manga} source={manga} />
          )}

         

          {user && isMobile && (
            <NotificationButton type={MediaType.Manga} source={manga} />
          )}

        </div>

        <div className="md:hidden flex gap-x-8 overflow-x-auto md:gap-x-16 [&>*]:shrink-0">
          <InfoItem
            title="Country"
            value={manga.countryOfOrigin}
          />

          <InfoItem
            title="Status"
            value={convert(manga.status, "status", { locale })}
          />

          <InfoItem title="Total Chapters" value={manga.chapters} />

          <InfoItem
            title="Age Rated"
            value={manga.isAdult ? "18+" : ""}
          />
        </div>
      </Section>

      <Section className="w-full min-h-screen gap-8 mt-2 md:mt-8 space-y-8 md:space-y-0 md:grid md:grid-cols-10 sm:px-12">
        <div className="md:col-span-2 h-[max-content] space-y-4">
          <div className="p-4 flex flex-row md:flex-col overflow-x-auto bg-background-900 rounded-md gap-4 [&>*]:shrink-0 md:no-scrollbar">
            <InfoItem title="English" value={manga.title.english} />
            <InfoItem title="Native" value={manga.title.native} />
            <InfoItem title="Romanji" value={manga.title.romaji} />
            <InfoItem
              title="Popular"
              value={numberWithCommas(manga.popularity)}
            />
            <InfoItem
              title="Favourite"
              value={numberWithCommas(manga.favourites)}
            />
            <InfoItem
              title="Trending"
              value={numberWithCommas(manga.trending)}
            />

            <InfoItem
              title="Synonyms"
              value={manga.synonyms.join("\n")}
            />
          </div>

          <div className="space-y-2 text-gray-400">
            <h1 className="font-semibold">Tags</h1>

            <ul className="overflow-x-auto flex flex-row md:flex-col gap-2 [&>*]:shrink-0 md:no-scrollbar">
              {manga.tags.map((tag) => (
                (<Link
                  href={{
                    pathname: "/browse",
                    query: { type: "manga", tags: tag.name },
                  }}
                  key={tag.id}
                  className="block">

                  <li className="p-2 rounded-md bg-background-900 hover:text-primary-300 transition duration-300">
                    {tag.name}
                  </li>

                </Link>)
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-8 space-y-12">
          

          {!!manga?.characters?.edges.length && (
            <DetailsSection
              title="Characters"
              className="w-full grid md:grid-cols-2 grid-cols-1 gap-4"
            >
              {manga.characters.edges.map((characterEdge, index) => (
                <CharacterConnectionCard
                  characterEdge={characterEdge}
                  key={index}
                />
              ))}
            </DetailsSection>
          )}

          {!!manga?.relations?.nodes?.length && (
            <DetailsSection title="Relations">
              <List data={manga.relations.nodes}>
                {(node) => <Card data={node} />}
              </List>
            </DetailsSection>
          )}

          {!!manga?.recommendations?.nodes.length && (
            <DetailsSection title="Recommendations">
              <List
                data={manga.recommendations.nodes.map(
                  (node) => node.mediaRecommendation
                )}
              >
                {(node) => <Card data={node} />}
              </List>
            </DetailsSection>
          )}
        </div>
      </Section>
    </div>
  </>;
};

export const getStaticProps: GetStaticProps = async ({
  params: { params },
}) => {
  try {

    const media = await getMediaDetails({
      type: MediaType.Manga,
      id: Number(params[0]),
    });

    return {
      props: {
        manga: media as Media,
      },
      revalidate: REVALIDATE_TIME,
    };
  } catch (err) {
    return { notFound: true, revalidate: REVALIDATE_TIME };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default withRedirect(DetailsPage, (router, props) => {
  const { params } = router.query;
  const [id, slug] = params as string[];
  const title = getTitle(props.manga, router.locale);

  if (slug) return null;

  return {
    url: `/manga/details/${id}/${title}`,
    options: {
      shallow: true,
    },
  };
});
