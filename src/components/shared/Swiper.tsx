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
          className="swiper-navigation pointer-events-none absolute bottom-full right-0 mb-6 flex gap-2.5"
        >
          <button
            ref={prevButtonRef}
            type="button"
            aria-label="Previous"
            className="exotv-nav-btn pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition duration-300 hover:bg-white hover:text-black"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <button
            ref={nextButtonRef}
            type="button"
            aria-label="Next"
            className="exotv-nav-btn pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-md transition duration-300 hover:bg-white hover:text-black"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </ReactSwiper>
  );
};

export const SwiperSlide = ReactSwiperSlide;

export default Swiper;
