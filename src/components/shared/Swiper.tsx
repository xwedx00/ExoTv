//@ts-nocheck
import React, { useRef } from "react";
import {
  Swiper as ReactSwiper,
  SwiperSlide as ReactSwiperSlide,
} from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import "swiper/css";
import "swiper/css/navigation";

import CircleButton from "@/components/shared/CircleButton";
import classNames from "classnames";

export type SwiperInstance = SwiperClass;
export interface SwiperProps extends React.ComponentProps<typeof ReactSwiper> {
  hideNavigation?: boolean;
  isOverflowHidden?: boolean;
  defaultActiveSlide?: number;
}

const Swiper: React.FC<SwiperProps> = ({
  children,
  hideNavigation,
  onInit,
  isOverflowHidden = false,
  className,
  defaultActiveSlide,
  ...props
}) => {
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ReactSwiper
      modules={[Navigation]}
      className={classNames(
        isOverflowHidden ? "!overflow-hidden" : "!overflow-visible",
        className
      )}
      breakpoints={{
        1536: {
          slidesPerView: 7,
          slidesPerGroup: 7,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 5,
          slidesPerGroup: 5,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          spaceBetween: 20,
        },
        640: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 10,
        },
        0: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 10,
        },
      }}
      grabCursor
      navigation={{
        prevEl: prevButtonRef.current,
        nextEl: nextButtonRef.current,
      }}
      onBeforeInit={(swiper) => {
        // Bind the custom arrow buttons BEFORE the Navigation module initialises.
        // The old code did this in onInit — too late, so navigation was wired to
        // null refs and the arrows did nothing.
        // @ts-ignore
        swiper.params.navigation.prevEl = prevButtonRef.current;
        // @ts-ignore
        swiper.params.navigation.nextEl = nextButtonRef.current;
      }}
      onInit={(swiper) => {
        if (defaultActiveSlide) {
          swiper.slideTo(defaultActiveSlide);
        }

        onInit?.(swiper);
      }}
      {...props}
    >
      {children}

      {!hideNavigation && (
        <div
          slot="container-end"
          className="swiper-navigation absolute right-0 bottom-full mb-4 flex space-x-4"
        >
          <CircleButton
            ref={prevButtonRef}
            outline
            LeftIcon={FiChevronLeft}
            className="swiper-button-prev flex items-center justify-center"
          />
          <CircleButton
            ref={nextButtonRef}
            outline
            LeftIcon={FiChevronRight}
            className="swiper-button-next flex items-center justify-center"
          />
        </div>
      )}
    </ReactSwiper>
  );
};

export const SwiperSlide = ReactSwiperSlide;

export default Swiper;
