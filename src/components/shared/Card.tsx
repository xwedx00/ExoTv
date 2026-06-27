//@ts-nocheck
import DotList from "@/components/shared/DotList";
import Image from "@/components/shared/Image";
import TextIcon from "@/components/shared/TextIcon";
import { Media } from "@/types/anilist";
import {
  createMediaDetailsUrl,
  isColorVisible,
  numberWithCommas,
} from "@/utils";
import { convert, getTitle } from "@/utils/data";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { AiFillHeart } from "react-icons/ai";
import { MdTagFaces } from "react-icons/md";

interface CardProps {
  data: Media;
  className?: string;
  containerEndSlot?: React.ReactNode;
  imageEndSlot?: React.ReactNode;
  redirectUrl?: string;
}

const Card: React.FC<CardProps> = (props) => {
  const {
    data,
    className,
    containerEndSlot,
    imageEndSlot,
    redirectUrl = createMediaDetailsUrl(data),
  } = props;

  const router = useRouter();

  const primaryColor = useMemo(
    () =>
      data.coverImage?.color && isColorVisible(data.coverImage.color, "#3a3939")
        ? data.coverImage.color
        : "white",
    [data]
  );
  const title = useMemo(
    () => getTitle(data, router.locale),
    [data, router?.locale]
  );

  return (
    <Link href={redirectUrl}>
      <div className="group relative cursor-pointer">
        {/* Modern in-place hover (matches SwiperCard): lift + scale, raise above
            neighbours, fade info in over the art (z-[2], above the image). */}
        <div
          className={classNames(
            "relative aspect-[2/3] overflow-hidden rounded-card bg-background-900 shadow-md ring-1 ring-white/5 transition-[transform,box-shadow] duration-300 ease-out will-change-transform group-hover:z-20 group-hover:-translate-y-1.5 group-hover:scale-[1.04] group-hover:shadow-[0_24px_48px_rgba(0,0,0,0.55)] group-hover:ring-white/25",
            className
          )}
        >
          <Image
            src={data.coverImage?.extraLarge}
            layout="fill"
            objectFit="cover"
            alt={title}
          />

          {imageEndSlot}

          <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col justify-end gap-2 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {data.averageScore && (
                <TextIcon LeftIcon={MdTagFaces} iconClassName="text-green-300">
                  <p>{data.averageScore}%</p>
                </TextIcon>
              )}

              <TextIcon LeftIcon={AiFillHeart} iconClassName="text-red-400">
                <p>{numberWithCommas(data.favourites)}</p>
              </TextIcon>
            </div>

            {!!data.genres?.length && (
              <DotList>
                {data.genres.slice(0, 3).map((genre) => (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: primaryColor }}
                    key={genre}
                  >
                    {convert(genre, "genre", { locale: router.locale })}
                  </span>
                ))}
              </DotList>
            )}

            {containerEndSlot}
          </div>
        </div>

        <p
          className="mt-2 line-clamp-2 text-base font-semibold"
          style={{ color: primaryColor }}
        >
          {title}
        </p>
      </div>
    </Link>
  );
};

export default React.memo(Card) as typeof Card;
