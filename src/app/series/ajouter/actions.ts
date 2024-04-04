"use server";

import tmdb from "@/app/tmdb";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import type { Genre, SimpleEpisode } from "moviedb-promise";
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
    const show = await tmdb.tvInfo({ id: showId });

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
      inProduction: show.in_production,
      episodeCount: show.number_of_episodes,
      seasonCount: show.number_of_seasons,
      originCountry: show.origin_country
        ? JSON.stringify(show.origin_country)
        : undefined,
      originalLanguage: show.original_language,
      originalName: show.original_name,
      status: show.status,
      poster: show.poster_path,
      /* seasons: {
          connectOrCreate: (show.seasons ?? [])
            .filter(
              (season): season is SimpleSeason & { id: number; name: string } =>
                Boolean(season.id) && Boolean(season.name),
            )
            .map((season) => ({
              where: {
                id: season.id,
              },
              create: {
                id: season.id,
                name: season.name,
                number: season.season_number,
                episodeCount: season.episode_count,
                poster: season.poster_path,
              },
            })),
        }, */
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
        });

        const seasonData = {
          id: season.id,
          episodeCount: season.episode_count,
          number: season.season_number,
          poster: season.poster_path,
          showId: show.id,
          episodes: {
            connectOrCreate: (seasonInfo.episodes ?? [])
              .filter(
                (
                  episode,
                ): episode is SimpleEpisode & { id: number; name: string } =>
                  Boolean(episode.id) && Boolean(episode.name),
              )
              .map((episode) => ({
                where: { id: episode.id },
                create: {
                  id: episode.id,
                  name: episode.name,
                  overview: episode.overview,
                  airDate: episode.air_date,
                },
              })),
          },
        };

        await db.season.upsert({
          where: { id: season.id },
          create: seasonData,
          update: seasonData,
        });
      }
    }
  },
);
