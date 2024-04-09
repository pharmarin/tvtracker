import { upsertMovie } from "@/app/actions";
import { setCheckedMovie } from "@/app/films/[movieId]/actions";
import DeleteButton from "@/app/films/[movieId]/delete-button";
import { routes } from "@/app/safe-routes";
import LoadingButton from "@/components/loading-button";
import { db } from "@/server/db";
import { CheckCircle2Icon, RefreshCcwIcon, XCircleIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

const MoviePage = async ({ params }: { params: unknown }) => {
  try {
    const { movieId } = routes.movieSingle.$parseParams(params);
    const movie = await db.movie.findFirstOrThrow({ where: { id: movieId } });

    const upsertMovieWithId = upsertMovie.bind(null, { movieId: movie.id });
    const setCheckedMovieWithId = setCheckedMovie.bind(null, {
      checked: movie.checked,
      movieId: movie.id,
    });

    return (
      <div className="max-w-3xl w-full space-y-4">
        <div className="flex flex-row space-x-4">
          <Image
            alt={`${movie.title} poster`}
            className="rounded-lg w-48 max-w-[33%]"
            src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
            height={500}
            width={500}
          />
          <div>
            <h2 className="text-3xl font-bold mb-4">{movie.title}</h2>
            <div className="my-4 italic text-opacity-50">{movie.overview}</div>
            <p>
              Langue d&apos;origine : {movie.originalLanguage} (
              {movie.originalTitle})
            </p>
            <div className="flex mt-4 flex-col gap-2 md:flex-row">
              <form action={setCheckedMovieWithId}>
                <LoadingButton className="w-full space-x-2">
                  {movie.checked ? (
                    <>
                      <XCircleIcon />
                      <span>Marquer comme non vu</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2Icon />
                      <span>Marquer comme vu</span>
                    </>
                  )}
                </LoadingButton>
              </form>
              <form action={upsertMovieWithId}>
                <LoadingButton className="w-full space-x-2">
                  <RefreshCcwIcon /> <span>Mettre à jour</span>
                </LoadingButton>
              </form>
              <DeleteButton movieId={movie.id} movieName={movie.title ?? ""} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
};

export default MoviePage;
