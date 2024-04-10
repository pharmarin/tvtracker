import type { Show } from "@prisma/client";
import { routes } from "app/safe-routes";
import Grid from "components/grid";
import Poster from "components/poster";
import { Badge } from "components/ui/badge";
import Link from "next/link";
import { db } from "server/db";
import { switchShowStatus } from "server/tmdb";

const ShowHome = async () => {
  const currentShows = await db.show.findMany({
    where: {
      seasons: {
        some: {
          episodes: {
            some: { checked: { equals: false }, airDate: { lte: new Date() } },
          },
        },
      },
      OR: [{ dropped: { equals: false } }, { dropped: { equals: null } }],
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
  const toComeShow = await db.show.findMany({
    where: {
      seasons: {
        some: {
          episodes: {
            every: { checked: { equals: false }, airDate: { gt: new Date() } },
          },
        },
        none: {
          episodes: {
            some: { checked: { equals: false }, airDate: { lte: new Date() } },
          },
        },
      },
      OR: [{ dropped: { equals: false } }, { dropped: { equals: null } }],
    },
  });
  const terminatedShows = await db.show.findMany({
    where: {
      seasons: {
        every: {
          episodes: { every: { checked: { equals: true } } },
        },
      },
      OR: [{ dropped: { equals: false } }, { dropped: { equals: null } }],
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
  const droppedShows = await db.show.findMany({
    where: { dropped: { equals: true } },
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-3xl mb-4">Mes séries</h2>
        {currentShows.length > 0 ? (
          <Grid>
            {currentShows.map(async (show) => (
              <ShowPoster key={show.id} show={show} />
            ))}
          </Grid>
        ) : (
          <div className="italic">Pas de série ajoutée</div>
        )}
      </div>
      {toComeShow.length > 0 && (
        <div>
          <h3 className="font-semibold text-2xl mb-4">Séries à venir</h3>
          <Grid className="grid-cols-4 sm:grid-cols-6">
            {toComeShow.map(async (show) => (
              <ShowPoster key={show.id} show={show} />
            ))}
          </Grid>
        </div>
      )}
      {terminatedShows.length > 0 && (
        <div>
          <h3 className="font-semibold text-2xl mb-4">Séries terminées</h3>
          <Grid className="grid-cols-4 sm:grid-cols-6">
            {terminatedShows.map(async (show) => (
              <ShowPoster key={show.id} show={show} />
            ))}
          </Grid>
        </div>
      )}
      {droppedShows.length > 0 && (
        <div>
          <h3 className="font-semibold text-2xl mb-4">Séries abandonnées</h3>
          <Grid className="grid-cols-5 sm:grid-cols-7">
            {droppedShows.map(async (show) => (
              <ShowPoster key={show.id} show={show} />
            ))}
          </Grid>
        </div>
      )}
    </div>
  );
};

const ShowPoster = async ({
  show,
}: {
  show: Pick<
    Show,
    "id" | "name" | "status" | "poster" | "seasonCount" | "episodeCount"
  >;
}) => {
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
      <Poster
        badges={
          <>
            {toWatchEpisode?.number && (
              <Badge className="mx-4 mb-2" variant="secondary">
                S{toWatchEpisode?.season?.number} E{toWatchEpisode?.number}
              </Badge>
            )}
            <Badge className="mx-4 mb-2 w-fit">
              {switchShowStatus(show.status)}
            </Badge>
          </>
        }
        imageAlt={`${show.name} poster`}
        imageUrl={`https://image.tmdb.org/t/p/w500${show.poster}`}
        title={show.name ?? ""}
        subtitle={
          <>
            <div>{show.seasonCount} saisons</div>
            <div>{show.episodeCount} épisodes</div>
          </>
        }
      />
    </Link>
  );
};

export default ShowHome;
