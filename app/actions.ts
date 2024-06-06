"use server";

import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import tmdb from "@/server/tmdb";
import type { Prisma } from "@prisma/client";
import { routes } from "app/safe-routes";
import type { Genre, MovieResult, TvResult } from "moviedb-promise";
import { revalidatePath } from "next/cache";
import { db } from "server/db";
import { action } from "server/safe-action";
import tmdb from "server/tmdb";
import type { MovieResult, TvResult } from "moviedb-promise";
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
