//@ts-nocheck
import Swiper, { SwiperSlide } from "@/components/shared/Swiper";
import SwiperCard from "@/components/shared/SwiperCard";
import { Media } from "@/types/anilist";
import { motion } from "motion/react";
import React from "react";

// Reveal each card left-to-right across the row on mount; the hover effect is
// now a pure CSS lift/scale on <SwiperCard> (no slide-width manipulation), so
// the old fragile getVisibleIndex / push-neighbours logic is gone for good.
const REVEAL_EASE = [0.33, 1, 0.68, 1];
const REVEAL_PER_ROW = 7;

interface CardSwiperProps {
  data: Media[];
  onEachCard?: (data: Media, isHover: boolean) => React.ReactNode;
}

const CardSwiper: React.FC<CardSwiperProps> = (props) => {
  const { data, onEachCard = (data) => <SwiperCard data={data} /> } = props;

  return (
    <Swiper speed={500}>
      {data.map((item, index) => (
        <SwiperSlide key={index} className="!h-auto">
          <motion.div
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.45,
              ease: REVEAL_EASE,
              delay: (index % REVEAL_PER_ROW) * 0.05,
            }}
          >
            {onEachCard(item, false)}
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default React.memo(CardSwiper);
