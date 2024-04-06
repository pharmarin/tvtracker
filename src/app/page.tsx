import { routes } from "@/app/safe-routes";
import { Badge } from "@/components/ui/badge";
import { db } from "@/server/db";
import { switchShowStatus } from "@/server/tmdb";
import type { Show } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

const HomePage = async () => {
  const currentShows = await db.show.findMany({
    where: {
      seasons: { some: { episodes: { some: { checked: { equals: false } } } } },
    },
    select: {
      id: true,
      name: true,
      status: true,
      poster: true,
      seasonCount: true,
      episodeCount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const terminatedShows = await db.show.findMany({
    where: {
      seasons: {
        every: {
          episodes: { every: { checked: { equals: true } } },
        },
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      poster: true,
      seasonCount: true,
      episodeCount: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between">
          <h2 className="font-semibold text-3xl mb-4">Mes séries</h2>
          <Link href={routes.showAdd()}>Ajouter</Link>
        </div>
        <ShowGrid shows={currentShows} />
      </div>
      <div>
        <h3 className="font-semibold text-2xl mb-4">Séries terminées</h3>
        <ShowGrid shows={terminatedShows} />
      </div>
    </div>
  );
};

const ShowGrid = ({
  shows,
}: {
  shows: Pick<
    Show,
    "id" | "name" | "status" | "poster" | "seasonCount" | "episodeCount"
  >[];
}) => {
  return (
    <div className="grid grid-cols-5 gap-4 max-w-3xl">
      {shows.map(async (show) => {
        const toWatchEpisode = await db.episode.findFirst({
          where: { season: { show: { id: show.id } }, checked: false },
          orderBy: [{ season: { number: "asc" } }, { number: "asc" }],
          select: { number: true, season: { select: { number: true } } },
        });

        return (
          <Link
            key={show.id}
            className="flex justify-top flex-col"
            href={routes.showSingle({
              showId: show.id,
            })}
          >
            <div className="relative">
              <Image
                alt={`${show.name} poster`}
                className="rounded-lg"
                src={`https://image.tmdb.org/t/p/w500${show.poster}`}
                height={500}
                width={500}
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center flex-col">
                {toWatchEpisode?.number && (
                  <Badge className="mx-auto mb-2">
                    S{toWatchEpisode?.season?.number} E{toWatchEpisode?.number}
                  </Badge>
                )}
                <Badge className="mx-auto mb-2">
                  {switchShowStatus(show.status)}
                </Badge>
              </div>
            </div>
            <div className="font-bold text-center">{show.name}</div>
            <div className="text-sm text-center italic">
              {show.seasonCount} saisons/{show.episodeCount} épisodes
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default HomePage;
