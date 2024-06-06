import type { Prisma } from "@prisma/client";
import type { Genre, MovieResponse } from "moviedb-promise";

export const tmdbMovieToPrisma = (
  movie: MovieResponse,
): Omit<Prisma.MovieCreateInput, "id"> => {
  if (!movie.id) {
    throw new Error("Ce film n'existe pas. ");
  }

  return {
    tmdbId: movie.id,
    title: movie.title,
    genres: {
      connectOrCreate: (movie.genres ?? [])
        .filter(
          (genre): genre is Required<Genre> =>
            Boolean(genre.id) && Boolean(genre.name),
        )
        .map((genre) => ({
          where: { tmdbId: genre.id },
          create: {
            tmdbId: genre.id,
            name: genre.name,
          },
        })),
    },
    originalLanguage: movie.original_language,
    originalTitle: movie.original_title,
    overview: movie.overview,
    releaseDate: movie.release_date ? new Date(movie.release_date) : undefined,
    poster: movie.poster_path,
  };
};
