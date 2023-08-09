//@ts-nocheck
import ReadSection from "@/components/features/manga/ReadSection";
import RecommendedMangaSection from "@/components/features/manga/RecommendedMangaSection";
import CardSwiper from "@/components/shared/CardSwiper";
import ClientOnly from "@/components/shared/ClientOnly";
import GenreSwiper from "@/components/shared/GenreSwiper";
import Head from "@/components/shared/Head";
import HomeBanner from "@/components/shared/HomeBanner";
import NewestComments from "@/components/shared/NewestComments";
import Section from "@/components/shared/Section";
import ShouldWatch from "@/components/shared/ShouldWatch";
import ListSwiperSkeleton from "@/components/skeletons/ListSwiperSkeleton";
import useDevice from "@/hooks/useDevice";
import useMedia from "@/hooks/useMedia";
import useRecommendations from "@/hooks/useRecommendations";
import { MediaSort, MediaType } from "@/types/anilist";
import { randomElement } from "@/utils";
import classNames from "classnames";
import React, { useMemo } from "react";
import { isMobile } from "react-device-detect";

const Home = () => {
  const { isDesktop } = useDevice();

  const { data: trendingManga, isLoading: trendingLoading } = useMedia({
    type: MediaType.Manga,
    sort: [MediaSort.Trending_desc, MediaSort.Popularity_desc],
    perPage: isMobile ? 5 : 10,
  });

  const { data: popularManga, isLoading: popularMangaLoading } = useMedia({
    type: MediaType.Manga,
    sort: [MediaSort.Popularity_desc],
    perPage: isMobile ? 5 : 10,
  });

  const { data: favouriteManga, isLoading: favouriteMangaLoading } = useMedia({
    type: MediaType.Manga,
    sort: [MediaSort.Favourites_desc],
    perPage: isMobile ? 5 : 10,
  });

  const { data: recentlyUpdated, isLoading: recentlyUpdatedLoading } = useMedia(
    {
      type: MediaType.Manga,
      sort: [MediaSort.Updated_at_desc],
      isAdult: false,
      perPage: isMobile ? 5 : 10,
    }
  );

  const randomTrendingManga = useMemo(() => {
    return randomElement(trendingManga || []);
  }, [trendingManga]);

  const { data: recommendationsManga } = useRecommendations(
    {
      mediaId: randomTrendingManga?.id,
    },
    { enabled: !!randomTrendingManga }
  );

  const randomManga = useMemo(
    () => randomElement(recommendationsManga || [])?.media,
    [recommendationsManga]
  );

  return (
    <React.Fragment>
      <Head
        title="(Manga) - Exoexs"
        description="Read the latest and best managas only on Exoexs"
      />

      <ClientOnly>
        <div className="pb-8">
          <HomeBanner data={trendingManga} isLoading={trendingLoading} />

          <div className="space-y-8">
            <ReadSection />
            <RecommendedMangaSection />

            

            {recentlyUpdatedLoading ? (
              <ListSwiperSkeleton />
            ) : (
              <Section title="Recently Updated">
                <CardSwiper data={recentlyUpdated} />
              </Section>
            )}

            {popularMangaLoading ? (
              <ListSwiperSkeleton />
            ) : (
              <Section title="Popular">
                <CardSwiper data={popularManga} />
              </Section>
            )}

            <NewestComments type={MediaType.Manga} />

            {favouriteMangaLoading ? (
              <ListSwiperSkeleton />
            ) : (
              <Section title="Most Favourite">
                <CardSwiper data={favouriteManga} />
              </Section>
            )}

            <div
              className={classNames(
                "flex gap-8",
                isDesktop ? "flex-row" : "flex-col"
              )}
            >
              <Section
                title="Should Read Today"
                className="w-full md:w-[80%] md:!pr-0"
              >
                {randomManga && (
                  <ShouldWatch data={randomManga} isLoading={!randomManga} />
                )}
              </Section>
              <Section
                title="Genres"
                className="w-full md:w-[20%] md:!pl-0"
              >
                <GenreSwiper className="md:h-[500px]" />
              </Section>
            </div>
          </div>
        </div>
      </ClientOnly>
    </React.Fragment>
  );
};

export default Home;
