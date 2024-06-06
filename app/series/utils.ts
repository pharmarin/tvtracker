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
    tmdbId: show.id,
    name: show.name,
    genres: {
      connectOrCreate: (show.genres ?? [])
        .filter(
          (genre): genre is Required<Genre> =>
            Boolean(genre.id) && Boolean(genre.name),
        )
        .map((genre) => ({
          where: { tmdbId: genre.id },
          create: { tmdbId: genre.id, name: genre.name },
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
  tmdbShowId: number,
  season: SimpleSeason & { id: number },
): Prisma.SeasonCreateInput => ({
  tmdbId: season.id,
  name: season.name,
  number: season.season_number,
  poster: season.poster_path,
  show: { connect: { tmdbId: tmdbShowId } },
});

const tmdbEpisodeToPrisma = (
  season: Season,
  episode: SimpleEpisode & { id: number },
): Prisma.EpisodeCreateInput => ({
  tmdbId: episode.id,
  name: episode.name,
  number: episode.episode_number,
  overview: episode.overview,
  airDate: episode.air_date ? new Date(episode.air_date) : undefined,
  season: { connect: season },
});

export const createShow = async (tmdbShowId: number) => {
  const show = await tmdb.tvInfo({ id: tmdbShowId, language: "fr" });
  const data = await tmdbShowToPrisma(show);
  const { id } = await db.show.create({ data });
  await upsertSeasonsAndEpisodes(show.id ?? 0, show.seasons);

  return id;
};

export const upsertSeasonsAndEpisodes = async (
  tmdbShowId: number,
  seasons?: SimpleSeason[],
) => {
  if (!seasons) {
    const show = await tmdb.tvInfo(tmdbShowId);
    seasons = show.seasons ?? [];
  }

  for (const season of seasons.filter(
    (season): season is SimpleSeason & { id: number } => Boolean(season.id),
  )) {
    if (season.name === "Épisodes spéciaux") {
      continue;
    }

    const seasonInfo = await tmdb.seasonInfo({
      id: tmdbShowId,
      season_number: season.season_number ?? 0,
      language: "fr",
    });

    const seasonData = tmdbSeasonToPrisma(tmdbShowId, season);

    const dbSeason = await db.season.upsert({
      where: { tmdbId: season.id },
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
              where: { tmdbId: episode.id },
              create: episodeData,
              update: episodeData,
            });
          }),
      );
    }
  }
};

export const updateShow = async (
  show: string | Pick<Show, "id" | "tmdbId" | "episodeCount" | "seasonCount">,
) => {
  const currentShow =
    typeof show === "string"
      ? await db.show.findFirstOrThrow({
          where: { id: show },
        })
      : show;
  const tmdbShow = await tmdb.tvInfo(currentShow.tmdbId);

  if (
    currentShow.episodeCount !== tmdbShow.number_of_episodes ||
    currentShow.seasonCount !== tmdbShow.number_of_seasons
  ) {
    await upsertSeasonsAndEpisodes(currentShow.tmdbId, tmdbShow.seasons);
    return true;
  } else {
    return false;
  }
};

export const refreshShow = async (skip = 0) => {
  const show = await db.show.findFirst({
    orderBy: { id: "asc" },
    take: 1,
    skip,
    select: {
      id: true,
      tmdbId: true,
      name: true,
      episodeCount: true,
      seasonCount: true,
    },
  });

  if (!show) {
    return true;
  }

  const updated = await updateShow(show);
  console.log(
    updated
      ? `Mise à jour de : ${show.name}`
      : `Série déjà à jour : ${show.name}`,
  );
};
