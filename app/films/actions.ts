"use server";

import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import tmdb from "@/server/tmdb";
import type { Prisma } from "@prisma/client";
import type { Genre } from "moviedb-promise";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
