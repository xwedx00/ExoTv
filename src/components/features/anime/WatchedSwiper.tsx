//@ts-nocheck
import EpisodeCard from "@/components/features/anime/EpisodeCard";
import Swiper, { SwiperProps, SwiperSlide } from "@/components/shared/Swiper";
import { Watched } from "@/types";
import { getTitle } from "@/utils/data";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

interface WatchedSwiperProps extends SwiperProps {
  data: Watched[];
}

const WatchedSwiper: React.FC<WatchedSwiperProps> = ({ data, ...props }) => {
  const { locale } = useRouter();

  return (
    <Swiper speed={500} {...props}>
      {data.map(({ media, episode, watchedTime }, index) => {
        return (
          <SwiperSlide key={index}>
            <Link
              href={`/anime/watch/${media.id}/${episode.sourceId}/${episode.sourceEpisodeId}`}
            >

              <EpisodeCard
                episode={{
                  ...episode,
                  thumbnail: media.bannerImage || media.coverImage.extraLarge,
                }}
                title={getTitle(media, locale)}
                duration={(media?.duration || 0) * 60}
                watchedTime={watchedTime}
              />

            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default React.memo(WatchedSwiper);
