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
import React, { useMemo, useState } from "react";
import { AiFillHeart } from "react-icons/ai";
import { MdTagFaces } from "react-icons/md";

interface AnimeCardProps {
  data: Media;
  className?: string;
  containerEndSlot?: React.ReactNode;
  imageEndSlot?: React.ReactNode;
  redirectUrl?: string;
  /** legacy prop — hover state is now self-managed, kept for call-site compat */
  isExpanded?: boolean;
}

const Card: React.FC<AnimeCardProps> = (props) => {
  const {
    data,
    className,
    containerEndSlot,
    imageEndSlot,
    redirectUrl = createMediaDetailsUrl(data),
  } = props;

  const router = useRouter();
  const [hovered, setHovered] = useState(false);

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
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Poster — lifts, scales and raises above neighbours on hover (no
            layout push). Info fades in over the art. */}
        <div
          className={classNames(
            "relative aspect-[2/3] overflow-hidden rounded-card bg-background-900 ring-1 transition-[transform,box-shadow,outline] duration-300 ease-out will-change-transform",
            hovered
              ? "z-20 -translate-y-1.5 scale-[1.04] shadow-[0_24px_48px_rgba(0,0,0,0.55)] ring-white/20"
              : "z-0 shadow-md ring-white/5",
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

          <div
            className={classNames(
              "pointer-events-none absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3 transition-opacity duration-300",
              hovered ? "opacity-100" : "opacity-0"
            )}
          >
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
          className="mt-2 line-clamp-2 text-base font-semibold transition-colors duration-300"
          style={{ color: primaryColor }}
        >
          {title}
        </p>
      </div>
    </Link>
  );
};

export default React.memo(Card) as typeof Card;
