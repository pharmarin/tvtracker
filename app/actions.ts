"use server";

import type { Prisma } from "@prisma/client";
import { routes } from "app/safe-routes";
import type { Genre, MovieResult, TvResult } from "moviedb-promise";
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
