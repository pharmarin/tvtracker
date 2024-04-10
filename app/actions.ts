"use server";

import type { Prisma } from "@prisma/client";
import { routes } from "app/safe-routes";
import type {
  Genre,
  MovieResult,
  SimpleEpisode,
  TvResult,
} from "moviedb-promise";
import { revalidatePath } from "next/cache";
import { db } from "server/db";
import { action } from "server/safe-action";
import tmdb from "server/tmdb";
import { z } from "zod";

export const search = action(
  z.object({
    query: z.string(),
  }),
  async ({ query }) => {
    const tmdbResults = await tmdb
      .searchMulti({ query, language: "fr" })
      .then((response) => response?.results ?? []);
    const myResults = await db.$transaction([
      db.show.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { originalName: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, poster: true },
      }),
      db.movie.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { originalTitle: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, title: true, poster: true },
      }),
    ]);

    return {
      myShows: myResults[0],
      myMovies: myResults[1],
      tmdbShows: tmdbResults.filter(
        (result): result is TvResult => result.media_type === "tv",
      ),
      tmdbMovies: tmdbResults.filter(
        (result): result is MovieResult => result.media_type === "movie",
      ),
    };
  },
);

export const upsertShow = action(
  z.object({ showId: z.number() }),
  async ({ showId }) => {
    const show = await tmdb.tvInfo({ id: showId, language: "fr" });

    if (!show.id) {
      throw new Error("Cette série n'existe pas. ");
    }

    const showData: Prisma.ShowCreateInput = {
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

    await db.show.upsert({
      where: { id: show.id },
      create: showData,
      update: showData,
    });

    for (const season of show.seasons ?? []) {
      if (season.id && season.season_number) {
        const seasonInfo = await tmdb.seasonInfo({
          id: show.id,
          season_number: season.season_number,
          language: "fr",
        });

        const episodes = await db.$transaction(
          (seasonInfo.episodes ?? [])
            .filter((episode): episode is SimpleEpisode & { id: number } =>
              Boolean(episode.id),
            )
            .map((episode) => {
              const episodeData = {
                id: episode.id,
                name: episode.name,
                number: episode.episode_number,
                overview: episode.overview,
                airDate: episode.air_date
                  ? new Date(episode.air_date)
                  : undefined,
              };

              return db.episode.upsert({
                where: { id: episode.id },
                create: episodeData,
                update: episodeData,
              });
            }),
        );

        const seasonData = {
          id: season.id,
          name: season.name,
          episodeCount: season.episode_count,
          number: season.season_number,
          poster: season.poster_path,
          showId: show.id,
          episodes: {
            connect: episodes.map((episode) => ({ id: episode.id })),
          },
        };

        await db.season.upsert({
          where: { id: season.id },
          create: seasonData,
          update: seasonData,
        });
      }
    }

    revalidatePath(routes.home());
    revalidatePath(routes.showSingle({ showId: show.id }));
  },
);

export const upsertMovie = action(
  z.object({ movieId: z.number() }),
  async ({ movieId }) => {
    const movie = await tmdb.movieInfo({ id: movieId, language: "fr" });

    if (!movie.id) {
      throw new Error("Ce film n'existe pas. ");
    }

    const movieData: Prisma.MovieCreateInput = {
      id: movie.id,
      title: movie.title,
      genres: {
        connectOrCreate: (movie.genres ?? [])
          .filter(
            (genre): genre is Required<Genre> =>
              Boolean(genre.id) && Boolean(genre.name),
          )
          .map((genre) => ({
            where: { id: genre.id },
            create: genre,
          })),
      },
      originalLanguage: movie.original_language,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseDate: movie.release_date
        ? new Date(movie.release_date)
        : undefined,
      poster: movie.poster_path,
    };

    await db.movie.upsert({
      where: { id: movie.id },
      create: movieData,
      update: movieData,
    });

    revalidatePath(routes.home());
    revalidatePath(routes.movieSingle({ movieId: movie.id }));
  },
);
