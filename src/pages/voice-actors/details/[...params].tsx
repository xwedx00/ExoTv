//@ts-nocheck
import CharacterCard from "@/components/shared/CharacterCard";
import Head from "@/components/shared/Head";
import List from "@/components/shared/List";
import PlainCard from "@/components/shared/PlainCard";
import Section from "@/components/shared/Section";
import TextIcon from "@/components/shared/TextIcon";
import { REVALIDATE_TIME } from "@/constants";
import withRedirect from "@/hocs/withRedirect";
import dayjs from "@/lib/dayjs";
import { getStaffDetails } from "@/services/anilist";
import { Staff } from "@/types/anilist";
import {
  arePropertiesFalsy,
  formatDate,
  numberWithCommas,
  vietnameseSlug,
} from "@/utils";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import React, { useMemo } from "react";
import { AiFillHeart } from "react-icons/ai";
import { BiCake } from "react-icons/bi";

const KeyValue: React.FC<{ property: string; value: string }> = ({
  property,
  value,
}) => (
  <div>
    <b>{property}: </b>

    <span>{value || "Unknown"}</span>
  </div>
);

interface DetailsPageProps {
  voiceActor: Staff;
}

const DetailsPage: NextPage<DetailsPageProps> = ({ voiceActor }) => {

  const gender = useMemo(
    () => voiceActor.gender?.toLowerCase() || voiceActor.gender,
    [ voiceActor.gender ]
  );

  const birthday = useMemo(() => {
    const dateOfBirth = voiceActor.dateOfBirth;

    if (arePropertiesFalsy(dateOfBirth)) {
      return null;
    }

    return formatDate(dateOfBirth);
  }, [voiceActor.dateOfBirth]);

  const yearsActive = useMemo(() => {
    const yearsActive = voiceActor.yearsActive;

    if (!yearsActive?.length) return null;

    if (!yearsActive[1]) return `${yearsActive[0]} - ${"Present"}`;

    return `${yearsActive[0]} - ${yearsActive[1]}`;
  }, [voiceActor.yearsActive]);

  const isDead = useMemo(
    () => !arePropertiesFalsy(voiceActor.dateOfDeath),
    [voiceActor.dateOfDeath]
  );

  const isBirthday = useMemo(() => {
    const date = dayjs();
    const birthday = voiceActor.dateOfBirth;

    return date.date() === birthday.day && date.month() === birthday.month - 1;
  }, [voiceActor.dateOfBirth]);

  return (
    <>
      <Head
        title={`${voiceActor.name.userPreferred} - Exoexs`}
        image={voiceActor.image.large}
      />

      <div className="pb-8">
        <div className="w-full h-[200px] bg-background"></div>

        <Section className="relative px-4 sm:px-12 z-10 bg-background-900 pb-4 mb-8">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="shrink-0 relative left-1/2 -translate-x-1/2 md:static md:left-0 md:-translate-x-0 w-[186px] -mt-20 space-y-6">
              <PlainCard
                src={voiceActor.image.large}
                alt={voiceActor.name.userPreferred}
              />
            </div>

            <div className="space-y-8 text-center md:text-left flex flex-col items-center md:items-start py-4 md:-mt-[5.5rem]">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <h1 className="text-3xl font-semibold">
                    {voiceActor.name.userPreferred}
                  </h1>
                  <TextIcon
                    iconClassName="text-primary-500"
                    LeftIcon={AiFillHeart}
                  >
                    <p>{numberWithCommas(voiceActor.favourites)}</p>
                  </TextIcon>
                  {isBirthday && (
                    <TextIcon
                      iconClassName="text-primary-300"
                      LeftIcon={BiCake}
                    >
                      <p>Birthday Today ?</p>
                    </TextIcon>
                  )}
                </div>
                <p className="text-gray-300">{voiceActor.name.native}</p>
              </div>

              <div className="space-y-2">
                <KeyValue property="Gender" value={gender} />
                <KeyValue property="Birthday" value={birthday} />
                {isDead && (
                  <KeyValue
                    property="Deathday"
                    value={formatDate(voiceActor.dateOfDeath)}
                  />
                )}
                <KeyValue
                  property="Age"
                  value={voiceActor.age?.toString()}
                />
                <KeyValue property="Years Active" value={yearsActive} />
                <KeyValue
                  property="Blood Type"
                  value={voiceActor.bloodType}
                />
                <KeyValue
                  property="Hometown"
                  value={voiceActor.homeTown}
                />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Characters">
          <List data={voiceActor.characters.nodes}>
            {(character) => <CharacterCard character={character} />}
          </List>
        </Section>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { params },
}) => {
  try {
    const data = await getStaffDetails({
      id: Number(params[0]),
    });

    return {
      props: {
        voiceActor: data,
      },
      revalidate: REVALIDATE_TIME,
    };
  } catch (error) {
    console.log(error);

    return { notFound: true, revalidate: REVALIDATE_TIME };
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default withRedirect(DetailsPage, (router, props) => {
  const { params } = router.query;
  const [id, slug] = params as string[];

  if (slug) return null;

  return {
    url: `/voice-actors/details/${id}/${vietnameseSlug(
      props.voiceActor.name.userPreferred
    )}`,
    options: {
      shallow: true,
    },
  };
});
