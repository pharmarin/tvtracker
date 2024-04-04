"use server";

import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import tmdb from "@/server/tmdb";
import type { Genre, SimpleEpisode } from "moviedb-promise";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const searchShow = action(
  zfd.formData({
    query: zfd.text(),
  }),
  async ({ query }) =>
    await tmdb
      .searchTv({ query, language: "fr" })
      .then((response) => response?.results ?? []),
);

export const upsertShow = action(
  z.object({ showId: z.number() }),
  async ({ showId }) => {
    const show = await tmdb.tvInfo({ id: showId, language: "fr" });

    if (!show.id) {
      throw new Error("Cette série n'existe pas. ");
    }

    const showData = {
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

      revalidatePath(routes.home());
      revalidatePath(routes.showSingle({ showId: show.id }));
    }
  },
);
