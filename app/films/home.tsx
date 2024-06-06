import { routes } from "@/app/safe-routes";
import Grid from "@/components/grid";
import Poster from "@/components/poster";
import { db } from "@/server/db";
import type { Movie } from "@prisma/client";
import Link from "next/link";

const MovieHome = async () => {
  const checkedMovies = await db.movie.findMany({
    where: {
      checked: { equals: true },
    },
    orderBy: { title: "asc" },
  });
  const uncheckedMovies = await db.movie.findMany({
    where: {
      checked: { equals: false },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4 w-full max-w-screen-md">
      <div>
        <h2 className="font-semibold text-3xl mb-4">Mes films</h2>
        {uncheckedMovies.length > 0 ? (
          <Grid>
            {uncheckedMovies.map((movie) => (
              <MoviePoster key={movie.id} movie={movie} />
            ))}
          </Grid>
        ) : (
          <div className="italic">Pas de film ajouté</div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-2xl mb-4">Films vus</h3>
        {checkedMovies.length > 0 ? (
          <Grid>
            {checkedMovies.map((movie) => (
              <MoviePoster key={movie.id} movie={movie} />
            ))}
          </Grid>
        ) : (
          <div className="italic">Pas de film vu</div>
        )}
      </div>
    </div>
  );
};

export const MoviePoster = ({ movie }: { movie: Movie }) => {
  return (
    <Link
      key={movie.id}
      className="flex justify-top flex-col"
      href={routes.movieSingle({
        movieId: movie.id,
      })}
    >
      <Poster
        imageAlt={`${movie.title} poster`}
        imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster}`}
        title={movie.title ?? ""}
      />
    </Link>
  );
};

export default MovieHome;
