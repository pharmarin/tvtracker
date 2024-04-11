import { db } from "@/server/db";
import tmdb from "@/server/tmdb";
import type { Prisma, Season, Show } from "@prisma/client";
import type {
  Genre,
  ShowResponse,
  SimpleEpisode,
  SimpleSeason,
} from "moviedb-promise";

const tmdbShowToPrisma = async (
  show: ShowResponse,
): Promise<Prisma.ShowCreateInput> => {
  if (!show.id) {
    throw new Error("Cette série n'existe pas. ");
  }

  return {
    id: show.id,
    name: show.name,
    genres: {
      connectOrCreate: (show.genres ?? [])
        .filter(
          (genre): genre is Required<Genre> =>
            Boolean(genre.id) && Boolean(genre.name),
        )
        .map((genre) => ({
          where: { id: genre.id },
          create: genre,
        })),
    },
    episodeCount: show.number_of_episodes,
    seasonCount: show.number_of_seasons,
    originalCountry: show.origin_country
      ? JSON.stringify(show.origin_country)
      : undefined,
    originalLanguage: show.original_language,
    originalName: show.original_name,
    status: show.status,
    poster: show.poster_path,
  };
};

const tmdbSeasonToPrisma = (
  showId: number,
  season: SimpleSeason & { id: number },
): Prisma.SeasonCreateInput => ({
  id: season.id,
  name: season.name,
  number: season.season_number,
  poster: season.poster_path,
  show: { connect: { id: showId } },
});

const tmdbEpisodeToPrisma = (
  season: Season,
  episode: SimpleEpisode & { id: number },
): Prisma.EpisodeCreateInput => ({
  id: episode.id,
  name: episode.name,
  number: episode.episode_number,
  overview: episode.overview,
  airDate: episode.air_date ? new Date(episode.air_date) : undefined,
  season: { connect: season },
});

export const createShow = async (showId: number) => {
  const show = await tmdb.tvInfo({ id: showId, language: "fr" });
  const data = await tmdbShowToPrisma(show);
  await db.show.create({ data });
  await upsertSeasonsAndEpisodes(data.id, show.seasons);
};

export const upsertSeasonsAndEpisodes = async (
  showId: number,
  seasons?: SimpleSeason[],
) => {
  if (!seasons) {
    const show = await tmdb.tvInfo(showId);
    seasons = show.seasons ?? [];
  }

  for (const season of seasons.filter(
    (season): season is SimpleSeason & { id: number } => Boolean(season.id),
  )) {
    const seasonInfo = await tmdb.seasonInfo({
      id: showId,
      season_number: season.season_number ?? 0,
      language: "fr",
    });

    const seasonData = tmdbSeasonToPrisma(showId, season);

    const dbSeason = await db.season.upsert({
      where: { id: season.id },
      create: seasonData,
      update: seasonData,
    });

    if (Array.isArray(seasonInfo.episodes) && seasonInfo.episodes.length > 0) {
      await db.$transaction(
        seasonInfo.episodes
          .filter((episode): episode is SimpleEpisode & { id: number } =>
            Boolean(episode.id),
          )
          .map((episode) => {
            const episodeData = tmdbEpisodeToPrisma(dbSeason, episode);

            return db.episode.upsert({
              where: { id: episode.id },
              create: episodeData,
              update: episodeData,
            });
          }),
      );
    }
  }
};

export const updateShow = async (
  show: number | Pick<Show, "id" | "episodeCount" | "seasonCount">,
) => {
  const currentShow =
    typeof show === "number"
      ? await db.show.findFirstOrThrow({
          where: { id: show },
        })
      : show;
  const tmdbShow = await tmdb.tvInfo(currentShow.id);

  if (
    currentShow.episodeCount !== tmdbShow.number_of_episodes ||
    currentShow.seasonCount !== tmdbShow.number_of_seasons
  ) {
    await upsertSeasonsAndEpisodes(currentShow.id, tmdbShow.seasons);
    return true;
  } else {
    return false;
  }
};
