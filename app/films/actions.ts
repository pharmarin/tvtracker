"use server";

import { tmdbMovieToPrisma } from "@/app/films/utils";
import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import tmdb from "@/server/tmdb";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createMovieAction = action(
  z.object({ tmdbMovieId: z.number() }),
  async ({ tmdbMovieId }) => {
    const movie = await tmdb.movieInfo({ id: tmdbMovieId, language: "fr" });
    const data = tmdbMovieToPrisma(movie);

    const { id } = await db.movie.create({
      data,
    });

    revalidatePath(routes.home());

    return id;
  },
);

export const updateMovieAction = action(
  z.object({ tmdbMovieId: z.number() }),
  async ({ tmdbMovieId }) => {
    const movie = await tmdb.movieInfo({ id: tmdbMovieId, language: "fr" });
    const data = tmdbMovieToPrisma(movie);

    const { id } = await db.movie.update({
      where: { tmdbId: tmdbMovieId },
      data,
    });

    revalidatePath(routes.home());
    revalidatePath(routes.movieSingle({ movieId: id }));

    return id;
  },
);
